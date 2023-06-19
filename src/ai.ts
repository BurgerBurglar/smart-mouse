import { Configuration, OpenAIApi } from "openai";
import { getRoomConfig } from "./chat";

const configuration = new Configuration({
  apiKey: process.env["OPENAI_API_KEY"],
  basePath:process.env["OPEN_AI_BASE_PATH"],
});
const openai = new OpenAIApi(configuration);

export const getResponse = async (prompt: string, roomTopic: string) => {
  const { initialPrompt } = getRoomConfig(roomTopic);
  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: initialPrompt },
      { role: "user", content: prompt },
    ],
  });
  const response = chatCompletion.data.choices[0].message?.content;
  return response;
};
