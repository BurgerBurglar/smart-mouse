import { Message } from "wechaty";
import { getResponse } from "./ai";
import { AI_CONFIG, CONFIG } from "./config";
import { isPersonalMessage, isTickle, randomChoice, say } from "./utils";
import { MessageType } from "./types";

export const dingDongBot = (message: Message) => {
  const isDirectMessageToMe = message.listener()?.self();
  const hasDing = message.text().toLowerCase().includes("ding");
  if (isDirectMessageToMe && hasDing) {
    say(message, "dong");
  }
};

const getPrompt = (message: Message) => {
  if (message.type() === MessageType.Text)
    return message.text().replaceAll(/@\S*\s/g, "");
  else if (isTickle(message)) return "你好";
  else throw Error("Only allows tickle and text messages");
};

export const chat = async (message: Message) => {
  if (!(await isPersonalMessage(message))) return;

  const roomName = await message.room()?.topic();
  if (!roomName) return;
  const isInChattableRoom = CONFIG.groups[roomName]?.shouldChatOnMention;
  if (!isInChattableRoom) return;

  try {
    const prompt = getPrompt(message);
    if (prompt.length > AI_CONFIG.max_length) {
      say(message, AI_CONFIG.errorResponsePromptTooLong);
      return;
    }
    const response = await getResponse(prompt);
    if (!response) return;

    if (AI_CONFIG.badRequest.flags.some((flag) => response?.includes(flag))) {
      const badResponse = randomChoice(AI_CONFIG.badRequest.replies);
      say(message, badResponse);
      return;
    }
    say(message, response);
  } catch (error: any) {
    console.error(error);
    if (error?.response?.status === 429) {
      say(message, AI_CONFIG.errorResponse429);
      return;
    }
    say(message, AI_CONFIG.errorResponseGeneral);
  }
};
