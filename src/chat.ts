import { log, Message } from "wechaty";
import { getResponse } from "./ai";
import { AI_CONFIG } from "./config";
import { isPersonalMessage, getPrompt, randomChoice, say } from "./utils";
import { context } from "./context";

export const dingDongBot = (message: Message) => {
  const isDirectMessageToMe = message.listener()?.self();
  const hasDing = message.text().toLowerCase().includes("ding");
  if (isDirectMessageToMe && hasDing) {
    say(message, "dong");
  }
};

export const getRoomConfig = (roomTopic: string) => {
  const roomConfig = AI_CONFIG.groups[roomTopic] ?? AI_CONFIG.groups["default"];
  return roomConfig;
};

export const chat = async (message: Message) => {
  if (!(await isPersonalMessage(message))) return;

  const room = message.room();
  if (!room) return;
  const roomTopic = await room.topic();

  const {
    initialPrompt,
    errorResponsePromptTooLong,
    errorResponse429,
    errorResponseGeneral,
    badRequestReplies,
  } = getRoomConfig(roomTopic);

  try {
    for (let i = 0; i < AI_CONFIG.max_retries; i++) {
      const prompt = getPrompt(message);
      if (prompt.length > AI_CONFIG.max_length) {
        say(message, errorResponsePromptTooLong);
        return;
      }
      const previousMessages = context[room.id];
      const response = await getResponse({
        prompt,
        initialPrompt,
        previousMessages,
      });
      if (!response) continue;

      log.info(">> Response:", response);
      if (AI_CONFIG.badResponseFlags.some((flag) => response?.includes(flag))) {
        if (i !== AI_CONFIG.max_retries - 1) continue;
        const badResponse = randomChoice(badRequestReplies);
        say(message, badResponse);
        return;
      }
      say(message, response);
      return;
    }
  } catch (error: any) {
    console.error(error);
    if (error?.response?.status === 429) {
      say(message, errorResponse429);
      return;
    }
    say(message, errorResponseGeneral);
  }
};
