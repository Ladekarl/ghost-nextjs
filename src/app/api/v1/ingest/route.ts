import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { NextRequest, NextResponse } from 'next/server';

import { CohereEmbeddings } from '@langchain/cohere';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME!;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const text = body.text;

  try {
    const client = new Pinecone({ apiKey: PINECONE_API_KEY });
    const pineconeIndex = client.Index(PINECONE_INDEX_NAME);

    const splitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
      chunkSize: 256,
      chunkOverlap: 20
    });

    const splitDocuments = await splitter.createDocuments([text]);

    await PineconeStore.fromDocuments(
      splitDocuments,
      new CohereEmbeddings({ model: 'multilingual-22-12' }),
      {
        pineconeIndex,
        maxConcurrency: 5
      }
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.log(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
