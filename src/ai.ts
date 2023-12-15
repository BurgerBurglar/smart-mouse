import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { AI_CONFIG } from "./config";
import { getResponseProps } from "./types";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

export const getResponse = async ({
  prompt,
  initialPrompt,
  previousMessages = [],
}: getResponseProps) => {
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: initialPrompt },
    ...previousMessages,
    { role: "user", content: prompt },
  ];
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4",
    messages,
    max_tokens: AI_CONFIG.maxTokens,
  });
  const response = chatCompletion.choices[0].message?.content;
  return response;
};
