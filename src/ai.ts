import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { getResponseProps } from "./types";
import { AI_CONFIG } from "./config";

const configuration = new Configuration({
  apiKey: process.env["OPENAI_API_KEY"],
  basePath:process.env["OPEN_AI_BASE_PATH"],
});
const openai = new OpenAIApi(configuration);

export const getResponse = async ({
  prompt,
  initialPrompt,
  previousMessages = [],
}: getResponseProps) => {
  const messages: ChatCompletionRequestMessage[] = [
    { role: "system", content: initialPrompt },
    ...previousMessages,
    { role: "user", content: prompt },
  ];
  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages,
    max_tokens: AI_CONFIG.maxTokens,
  });
  const response = chatCompletion.data.choices[0].message?.content;
  return response;
};
