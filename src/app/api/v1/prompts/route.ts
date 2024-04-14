import { NextRequest, NextResponse } from 'next/server';

type PostBody = {
  prompt?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PostBody;
    const prompt = body.prompt;
    if (!prompt) {
      throw 'Missing field';
    }

    const answer = `this is my answer to ${prompt}`;
    return NextResponse.json(answer);
  } catch (e) {
    return NextResponse.json(e, { status: 400, statusText: 'Bad Request' });
  }
}
