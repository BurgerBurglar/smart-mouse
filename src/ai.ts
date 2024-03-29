import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { AI_CONFIG } from "./config";
import { GetResponseProps } from "./types";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

export const getResponse = async ({
  prompt,
  initialPrompt,
  previousMessages = [],
}: GetResponseProps) => {
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

export const getAiDrawingUrl = async (prompt: string) => {
  const response = await openai.images.generate({
    prompt,
    model: "dall-e-3",
  });
  const imageUrl = response.data[0].url;
  return imageUrl;
};
