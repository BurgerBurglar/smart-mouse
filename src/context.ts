import { ChatCompletionRequestMessage } from "openai";
import { AI_CONFIG } from "./config";

export const context: Record<string, ChatCompletionRequestMessage[]> = {};

export const addMessages = (
  roomId: string,
  messages: ChatCompletionRequestMessage[]
) => {
  if (!context[roomId]) {
    context[roomId] = [];
  }
  const totalUserMessages = [...context[roomId], ...messages].filter(
    ({ role }) => role === "user"
  ).length;
  if (totalUserMessages > AI_CONFIG.maxContextMessages) {
    context[roomId] = context[roomId].slice(messages.length);
  }
  context[roomId].push(...messages);
};
