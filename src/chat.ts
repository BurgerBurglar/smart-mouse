import { log, Message } from "wechaty";
import { getResponse } from "./ai";
import { AI_CONFIG } from "./config";
import { MessageType } from "./types";
import { isPersonalMessage, isTickle, randomChoice, say } from "./utils";

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

const getPrompt = (message: Message) => {
  if (message.type() === MessageType.Text)
    return message.text().replaceAll(/@\S*\s/g, "");
  else if (isTickle(message)) return "你好";
  else throw Error("Only allows tickle and text messages");
};

export const chat = async (message: Message) => {
  if (!(await isPersonalMessage(message))) return;

  const roomTopic = await message.room()?.topic();
  if (!roomTopic) return;

  const {
    errorResponsePromptTooLong,
    errorResponse429,
    errorResponseGeneral,
    badRequestReplies,
  } = getRoomConfig(roomTopic);

  try {
    const prompt = getPrompt(message);
    if (prompt.length > AI_CONFIG.max_length) {
      say(message, errorResponsePromptTooLong);
      return;
    }
    const roomTopic = await message.room()?.topic();
    const response = await getResponse(prompt, roomTopic!);
    if (!response) return;

    log.info(">> Response:", response);
    if (AI_CONFIG.badResponseFlags.some((flag) => response?.includes(flag))) {
      const badResponse = randomChoice(badRequestReplies);
      say(message, badResponse);
      return;
    }
    say(message, response);
  } catch (error: any) {
    console.error(error);
    if (error?.response?.status === 429) {
      say(message, errorResponse429);
      return;
    }
    say(message, errorResponseGeneral);
  }
};
