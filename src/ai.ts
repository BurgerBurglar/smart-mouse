import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { AI_CONFIG } from "./config";
import { GetResponseProps } from "./types";
import { FileBox } from "file-box";

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

export const getAiVoice = async (prompt: string) => {
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: prompt,
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  const file = FileBox.fromBuffer(buffer, "test.mp3");
  return file;
};
