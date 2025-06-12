import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
  id: string;
  user_id: string;
  content: string;
  date: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, personality, conversationHistory, currentUserId } =
      await request.json();

    if (!message || !personality) {
      return NextResponse.json(
        { error: "Message and personality are required" },
        { status: 400 }
      );
    }

    // Convert conversation history to OpenAI messages format
    const conversationMessages =
      conversationHistory?.map((msg: Message) => ({
        role: msg.user_id === "current-user" ? "user" : "assistant",
        content: msg.content,
      })) || [];

    // Add the current message
    conversationMessages.push({
      role: "user",
      content: message,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are responding to a message in a chat app. ${personality} Keep your response conversational and under 2 sentences. Don't use quotation marks in your response. You are having an ongoing conversation, so respond appropriately to the context and history.`,
        },
        ...conversationMessages,
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const response =
      completion.choices[0]?.message?.content?.trim() ||
      "Thanks for your message!";

    return NextResponse.json({ response });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
