import { FileBox } from "file-box";
import OpenAI from "openai";
import { Message } from "wechaty";
import { getAiDrawingUrl } from "./ai";
import { getRoomConfig } from "./chat";
import { BOT_NAME, DRAW_AGAIN_TRIGGERS, DRAW_TRIGGERS } from "./config";
import { MessageType } from "./types";
import {
  getPreviousMessages,
  getUserHandle,
  isPersonalMessage,
  parseQuotedMessage,
  randomChoice,
  say,
  sleep,
} from "./utils";

const getDrawingPrompt = async (message: Message, hasHistory = false) => {
  const userHandle = getUserHandle(message);
  const { original, quotedContent } = await parseQuotedMessage(message);
  const currentPrompt = original + quotedContent;
  let prompts = currentPrompt;
  if (hasHistory) {
    const previousMessages = getPreviousMessages(message);
    const previousPrompts = previousMessages
      .filter(
        ({ role, content }) =>
          role === "user" &&
          DRAW_TRIGGERS.some((word) => content?.toLowerCase().includes(word))
      )
      .map(({ content }) => content);
    prompts += previousPrompts.join("\n");
  }
  prompts = prompts.replaceAll(BOT_NAME, "").replaceAll(userHandle, "");
  for (const word of DRAW_TRIGGERS) {
    prompts = prompts.replaceAll(word, "");
  }
  return prompts;
};

export const draw = async (message: Message) => {
  if (message.type() !== MessageType.Text) return;
  if (!(await isPersonalMessage(message))) return;
  const room = message.room();
  if (!room) return;

  const { original } = await parseQuotedMessage(message);
  if (!DRAW_TRIGGERS.some((word) => original.includes(word.toLowerCase())))
    return;
  const hasHistory = DRAW_AGAIN_TRIGGERS.some((word) =>
    original.includes(word)
  );
  const prompt = await getDrawingPrompt(message, hasHistory);
  try {
    const imageUrl = await getAiDrawingUrl(prompt);
    if (!imageUrl) return;
    message.say(FileBox.fromUrl(imageUrl));
  } catch (error: any) {
    console.error(error);
    if (error instanceof OpenAI.APIError) {
      const roomTopic = await room.topic();
      const { errorResponse429, errorResponseGeneral, badRequestReplies } =
        getRoomConfig(roomTopic);
      const badResponse = randomChoice(badRequestReplies);
      if (error.status === 429) {
        await sleep(2000);
        say(message, errorResponse429);
        return;
      }
      if (error.status === 400) {
        say(message, badResponse);
        return;
      }
      say(message, errorResponseGeneral);
    }
  }
};
