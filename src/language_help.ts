import { Message } from "wechaty";
import { getResponse } from "./ai";
import { AI_CONFIG, LANGUAGE_HELP_CONFIG } from "./config";
import { say } from "./utils";
import { MessageType } from "./types";
import { getRoomConfig } from "./chat";

const getComposition = (message: Message) =>
  message
    .text()
    .replaceAll(/#\S*\s/g, "")
    .trim();

const shouldDoLanguageHelp = async (message: Message) => {
  if (message.type() !== MessageType.Text) return false;
  const room = message.room();
  if (!room) return false;
  const roomTopic = await room.topic();
  if (!LANGUAGE_HELP_CONFIG.allowedRooms.includes(roomTopic)) return false;
  return message.text().includes(LANGUAGE_HELP_CONFIG.summonFlag);
};

export const getLanguageHelp = async (message: Message) => {
  if (!(await shouldDoLanguageHelp(message))) return;
  const room = message.room();
  if (!room) return;
  const roomTopic = await room.topic();

  const { errorResponse429, errorResponseGeneral } = getRoomConfig(roomTopic);
  try {
    for (let i = 0; i < AI_CONFIG.maxRetries; i++) {
      const response = await getResponse({
        prompt: getComposition(message),
        initialPrompt: LANGUAGE_HELP_CONFIG.initialPrompt,
      });
      if (!response) {
        say(message, AI_CONFIG.groups["default"].errorResponseGeneral);
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
