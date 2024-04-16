import {
  StreamingTextResponse,
  Message as VercelChatMessage,
  createStreamDataTransformer
} from 'ai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { createRetrieverTool } from 'langchain/tools/retriever';
import { NextRequest, NextResponse } from 'next/server';

import { CohereEmbeddings } from '@langchain/cohere';
import { AIMessage, ChatMessage, HumanMessage } from '@langchain/core/messages';
import {
  ChatPromptTemplate,
  MessagesPlaceholder
} from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';

export const runtime = 'edge';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
  if (message.role === 'user') {
    return new HumanMessage(message.content);
  } else if (message.role === 'assistant') {
    return new AIMessage(message.content);
  } else {
    return new ChatMessage(message.content, message.role);
  }
};

const AGENT_SYSTEM_TEMPLATE = `You are a senior employee working at a big company trying to answer the best way you can.
If you don't know how to answer a question, use the available tools to look up relevant information.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    /**
     * We represent intermediate steps as system messages for display purposes,
     * but don't want them in the chat history.
     */
    const messages = (body.messages ?? []).filter(
      (message: VercelChatMessage) =>
        message.role === 'user' || message.role === 'assistant'
    );
    const returnIntermediateSteps = body.show_intermediate_steps;
    const previousMessages = messages
      .slice(0, -1)
      .map(convertVercelMessageToLangChainMessage);
    const currentMessageContent = messages[messages.length - 1].content;

    const chatModel = new ChatOpenAI({
      apiKey: OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo-1106',
      temperature: 0.2,
      streaming: true
    });

    const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
    const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);

    const vectorstore = await PineconeStore.fromExistingIndex(
      new CohereEmbeddings({ model: 'multilingual-22-12' }),
      { pineconeIndex }
    );

    const retriever = vectorstore.asRetriever();

    const tool = createRetrieverTool(retriever, {
      name: 'search_vector_database',
      description: 'Searches and returns information.'
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', AGENT_SYSTEM_TEMPLATE],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad')
    ]);

    const agent = createToolCallingAgent({
      llm: chatModel,
      tools: [tool],
      prompt
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools: [tool],
      returnIntermediateSteps
    });

    if (!returnIntermediateSteps) {
      const logStream = agentExecutor.streamLog({
        input: currentMessageContent,
        chat_history: previousMessages
      });

      const textEncoder = new TextEncoder();
      const transformStream = new ReadableStream({
        async start(controller) {
          for await (const chunk of logStream) {
            if (chunk.ops?.length > 0 && chunk.ops[0].op === 'add') {
              const addOp = chunk.ops[0];
              if (
                addOp.path.startsWith('/logs/ChatOpenAI') &&
                typeof addOp.value === 'string' &&
                addOp.value.length
              ) {
                controller.enqueue(textEncoder.encode(addOp.value));
              }
            }
          }
          controller.close();
        }
      });

      return new StreamingTextResponse(
        transformStream.pipeThrough(createStreamDataTransformer())
      );
    } else {
      const result = await agentExecutor.invoke({
        input: currentMessageContent,
        chat_history: previousMessages
      });

      return NextResponse.json(
        { output: result.output, intermediate_steps: result.intermediateSteps },
        { status: 200 }
      );
    }
  } catch (e: any) {
    console.log(e);
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
