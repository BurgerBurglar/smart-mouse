import { log, Message } from "wechaty";
import { getResponse } from "./ai";
import { AI_CONFIG, GAMES, STRING_TO_REPLACE_GAMES } from "./config";
import { context } from "./context";
import {
  getMultipleRandomValues,
  getPrompt,
  randomChoice,
  say,
  shouldChat,
} from "./utils";

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
  if (!(await shouldChat(message))) return;

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
    for (let i = 0; i < AI_CONFIG.maxRetries; i++) {
      const prompt = await getPrompt(message);
      if (prompt.length > AI_CONFIG.maxInputLength) {
        say(message, errorResponsePromptTooLong);
        return;
      }
      const previousMessages = context[room.id]?.map((msg) => ({
        ...msg,
        content: msg.content?.substring(0, AI_CONFIG.maxContextLength),
      }));
      const realInitialPrompt = initialPrompt.includes(STRING_TO_REPLACE_GAMES)
        ? initialPrompt.replaceAll(
            STRING_TO_REPLACE_GAMES,
            getMultipleRandomValues(GAMES, 3).join("、")
          )
        : initialPrompt;
      const response = await getResponse({
        prompt,
        initialPrompt: realInitialPrompt,
        previousMessages,
      });
      if (!response) continue;

      log.info(">> Response:", response);
      if (AI_CONFIG.badResponseFlags.some((flag) => response?.includes(flag))) {
        if (i !== AI_CONFIG.maxRetries - 1) continue;
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
