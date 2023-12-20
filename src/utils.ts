import { Message } from "wechaty";
import {
  AI_CONFIG,
  BOT_NAME,
  DRAW_TRIGGERS,
  RANDOM_MESSAGE_REPLY,
  REPLACE_STRINGS_MAP,
  TICKLE_PROMPT,
} from "./config";
import { addMessages, context } from "./context";
import { MessageType } from "./types";

export const getUserHandle = (message: Message) =>
  `@${message.wechaty.currentUser.name()}`;

const getTalker = (message: Message) => {
  if (isTickle(message)) return message.listener();
  return message.talker();
};

const getTalkerName = async (message: Message) => {
  const room = message.room();
  const talker = getTalker(message);
  if (!talker) return;

  const talkerName = talker.name();
  const talkerAlias = AI_CONFIG.nameMap[talkerName];
  if (talkerAlias) return talkerAlias;

  if (!room) return talker.name();
  const alias = await room.alias(talker);
  return alias ?? talker.name();
};

export const getPrompt = async (message: Message) => {
  const talkerName = (await getTalkerName(message)) ?? "";
  if (isTickle(message)) return talkerName + TICKLE_PROMPT;
  else if (message.type() === MessageType.Text) {
    const { quotedTalker, quotedContent, original } =
      parseQuotedMessage(message);
    const quotedPrompt = quotedTalker
      ? `${quotedTalker}：${quotedContent}`
      : null;
    const userHandle = getUserHandle(message);
    const originalPromptBody = original.replaceAll(userHandle, "").trim();
    const prefix = talkerName ? talkerName + "：" : "";
    let prompt = prefix + originalPromptBody;
    if (quotedPrompt) {
      prompt = quotedPrompt + "\n" + prompt;
    }
    prompt = prompt.trim();
    return prompt;
  } else throw Error("Only allows tickle and text messages");
};

export const isFromSelf = (message: Message) => {
  return getTalker(message)?.id === message.wechaty.currentUser.id;
};

export const randomChoice = <T>(values: T[]) =>
  values[Math.floor(Math.random() * values.length)];

export const isTickle = (message: Message) => {
  return (
    message.type() === MessageType.Recalled &&
    message.text().includes('<sysmsg type="pat">')
  );
};

export const isTickleMe = (message: Message) => {
  return (
    isTickle(message) &&
    message
      .text()
      .includes(
        `<pattedusername>${message.wechaty.currentUser.id}</pattedusername>`
      )
  );
};

export const isWrongMessageType = (message: Message) =>
  ![MessageType.Text, MessageType.Recalled].includes(message.type());

const removeQuoting = (message: Message) =>
  parseQuotedMessage(message).original;

const isNameIncluded = async (message: Message) => {
  const room = message.room();
  if (!room) return false;
  const userHandle = getUserHandle(message);
  const names = [userHandle, BOT_NAME];

  const roomTopic = await room.topic();
  const alias = AI_CONFIG.groups[roomTopic]?.alias;
  if (alias) {
    names.push(alias);
  }

  const messageOrignal = removeQuoting(message);
  return names.some((str) => messageOrignal.includes(str));
};

export const isPersonalMessage = async (message: Message) => {
  if (isWrongMessageType(message)) return false;
  if (isTickleMe(message)) return true;
  if (message.type() !== MessageType.Text) return false;

  const userHandle = getUserHandle(message);
  if (await isNameIncluded(message)) return true;

  const isMentioned = await message.mentionSelf();
  const isMentionAll = ["@All", "@所有人"].some((str) =>
    removeQuoting(message).includes(str)
  );
  return isMentioned && !isMentionAll;
};

export const shouldChat = async (message: Message) => {
  if (await isPersonalMessage(message)) return true;
  if (message.type() !== MessageType.Text) return false;
  const roomTopic = await message.room()?.topic();
  if (!roomTopic) return false;
  if (!RANDOM_MESSAGE_REPLY.groups.includes(roomTopic)) return false;
  const { original, quotedContent } = parseQuotedMessage(message);
  const messageLength = original.length + (quotedContent?.length ?? 0);
  if (RANDOM_MESSAGE_REPLY.lengthThreshold > messageLength) return false;
  if (message.age() > RANDOM_MESSAGE_REPLY.ageLimitInSeconds) return false;
  return Math.random() < RANDOM_MESSAGE_REPLY.probability;
};

const finalizeOutput = (output: string) => {
  let new_output = output;
  for (const { source, target } of REPLACE_STRINGS_MAP) {
    new_output = new_output.replaceAll(source, target);
  }
  return new_output;
};

export const say = async (message: Message, content: string) => {
  const output = finalizeOutput(content);
  const room = message.room();
  if (!room) {
    message.say(output);
    return;
  }
  const talker = getTalker(message);
  const mentionList = talker ? [talker] : [];
  room.say(output, ...mentionList);
  const prompt = await getPrompt(message);
  addMessages(room.id, [
    { role: "user", content: prompt },
    { role: "assistant", content: output },
  ]);
};

const splitOnFirstOccurence = (str: string, splitBy: string) => {
  if (!str.includes(splitBy)) return [str, ""];
  const firstOccurenceIndex = str.indexOf(splitBy);
  return [
    str.substring(0, firstOccurenceIndex),
    str.substring(firstOccurenceIndex).replace(splitBy, ""),
  ];
};

export const parseQuotedMessage = (message: Message) => {
  const content = message.text();
  const SPLIT_BY = "\n- - - - - - - - - - - - - - -\n";
  if (!content.includes(SPLIT_BY)) {
    return {
      quotedTalker: null,
      quotedContent: null,
      original: content,
    };
  } else {
    const [quotedRaw, original] = splitOnFirstOccurence(content, SPLIT_BY);
    if (!quotedRaw.includes("：")) {
      return {
        quotedTalker: null,
        quotedContent: null,
        original,
      };
    }
    let [quotedTalker, quotedContent] = splitOnFirstOccurence(quotedRaw, "：");
    quotedTalker = quotedTalker.trim().slice(1);
    quotedContent = quotedContent.slice(0, -1);
    return {
      quotedTalker,
      quotedContent,
      original,
    };
  }
};

export const getMultipleRandomValues = <T>(arr: T[], num: number) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

export const shouldDraw = async (message: Message) => {
  if (message.type() !== MessageType.Text) return false;
  if (!(await isPersonalMessage(message))) return false;
  const content = message.text();
  if (!DRAW_TRIGGERS.some((word) => content.includes(word.toLowerCase())))
    return false;
  return true;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getPreviousMessages = (message: Message) => {
  const room = message.room();
  const previousMessages =
    context[room.id]?.map((msg) => ({
      ...msg,
      content: msg.content.slice(0, AI_CONFIG.maxContextLength) as string,
    })) ?? [];
  return previousMessages;
};
