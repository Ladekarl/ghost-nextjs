import { StreamingTextResponse, Message as VercelChatMessage } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

import { CohereEmbeddings } from '@langchain/cohere';
import { Document } from '@langchain/core/documents';
import {
  BytesOutputParser,
  StringOutputParser
} from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';

export const runtime = 'edge';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

const combineDocumentsFn = (docs: Document[]) => {
  const serializedDocs = docs.map(doc => doc.pageContent);
  return serializedDocs.join('\n\n');
};

const formatVercelMessages = (chatHistory: VercelChatMessage[]) => {
  const formattedDialogueTurns = chatHistory.map(message => {
    if (message.role === 'user') {
      return `Human: ${message.content}`;
    } else if (message.role === 'assistant') {
      return `Assistant: ${message.content}`;
    } else {
      return `${message.role}: ${message.content}`;
    }
  });
  return formattedDialogueTurns.join('\n');
};

const CONDENSE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

<chat_history>
  {chat_history}
</chat_history>

Follow Up Input: {question}
Standalone question:`;

const condenseQuestionPrompt = PromptTemplate.fromTemplate(
  CONDENSE_QUESTION_TEMPLATE
);

const ANSWER_TEMPLATE = `You are an employee at the same company where the person asking the question is working.
Answer the question based only on the following context and chat history:
<context>
  {context}
</context>

<chat_history>
  {chat_history}
</chat_history>

Question: {question}
`;
const answerPrompt = PromptTemplate.fromTemplate(ANSWER_TEMPLATE);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const previousMessages = messages.slice(0, -1);
    const currentMessageContent = messages[messages.length - 1].content;

    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo-1106',
      temperature: 0,
      apiKey: OPENAI_API_KEY,
      streaming: true
    });

    const standaloneQuestionChain = RunnableSequence.from([
      condenseQuestionPrompt,
      model,
      new StringOutputParser()
    ]);

    const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
    const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);

    const vectorstore = await PineconeStore.fromExistingIndex(
      new CohereEmbeddings({ model: 'multilingual-22-12' }),
      { pineconeIndex }
    );

    const retriever = vectorstore.asRetriever();

    const retrievalChain = retriever.pipe(combineDocumentsFn);

    const answerChain = RunnableSequence.from([
      {
        context: RunnableSequence.from([
          input => input.question,
          retrievalChain
        ]),
        chat_history: input => input.chat_history,
        question: input => input.question
      },
      answerPrompt,
      model
    ]);

    const conversationalRetrievalQAChain = RunnableSequence.from([
      {
        question: standaloneQuestionChain,
        chat_history: input => input.chat_history
      },
      answerChain,
      new BytesOutputParser()
    ]);

    const stream = await conversationalRetrievalQAChain.stream({
      question: currentMessageContent,
      chat_history: formatVercelMessages(previousMessages)
    });

    return new StreamingTextResponse(stream);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
