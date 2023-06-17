import { Configuration, OpenAIApi } from "openai";
import { AI_CONFIG } from "./config";

const configuration = new Configuration({
  apiKey: AI_CONFIG.key,
});
const openai = new OpenAIApi(configuration);

export const getResponse = async (prompt: string) => {
  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: AI_CONFIG.prompt },
      { role: "user", content: prompt },
    ],
  });
  const response = chatCompletion.data.choices[0].message?.content;
  return response;
};
