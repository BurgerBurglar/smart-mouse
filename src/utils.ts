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
import { getHumorInfo } from "./count_laughter";
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
  const talkerNickname = AI_CONFIG.nicknameMap[talkerName];
  if (talkerNickname) return talkerNickname;

  if (!room) return talker.name();
  const alias = await room.alias(talker);
  return alias ?? talker.name();
};

const getQuotedRealName = (aliasOrName: string, name: string) => {
  const talkerNickname = AI_CONFIG.nicknameMap[name];
  if (talkerNickname) return talkerNickname;
  return aliasOrName;
};

export const getPrompt = async (message: Message) => {
  const talkerName = (await getTalkerName(message)) ?? "";
  if (isTickle(message)) return talkerName + TICKLE_PROMPT;
  if (message.type() === MessageType.Text) {
    const { quotedTalkerAlias, quotedTalkerName, quotedContent, original } =
      await parseQuotedMessage(message);

    const quotedPrompt =
      quotedTalkerName && quotedTalkerAlias
        ? `${getQuotedRealName(
            quotedTalkerAlias,
            quotedTalkerName
          )}：${quotedContent}`
        : null;
    const userHandle = getUserHandle(message);
    const originalPromptBody = original.replace(userHandle, "").trim();
    const prefix = talkerName ? talkerName + "：" : "";
    let prompt = prefix + originalPromptBody;
    if (quotedPrompt) {
      prompt = quotedPrompt + "\n" + prompt;
    }
    prompt = prompt.trim();
    return prompt;
  }
  throw Error("Only allows tickle and text messages");
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

const removeQuoting = async (message: Message) =>
  (await parseQuotedMessage(message)).original;

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

  const messageOrignal = await removeQuoting(message);
  return names.some((str) => messageOrignal.includes(str));
};

export const isPersonalMessage = async (message: Message) => {
  if (isWrongMessageType(message)) return false;
  if (isTickleMe(message)) return true;
  if (message.type() !== MessageType.Text) return false;
  if (await isNameIncluded(message)) return true;

  const isMentioned = await message.mentionSelf();
  const isMentionAll = ["@All", "@所有人"].some(async (str) =>
    (await removeQuoting(message)).includes(str)
  );
  return isMentioned && !isMentionAll;
};

export const shouldChat = async (message: Message) => {
  if ((await getHumorInfo(message))?.humorLevel) return false;
  if (await isPersonalMessage(message)) return true;
  if (message.type() !== MessageType.Text) return false;

  const roomTopic = await message.room()?.topic();
  if (!roomTopic) return false;

  if (!RANDOM_MESSAGE_REPLY.groups.includes(roomTopic)) return false;

  const { original, quotedContent } = await parseQuotedMessage(message);
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

export const parseQuotedMessage = async (
  message: Message
): Promise<{
  quotedTalkerAlias: string | null;
  quotedTalkerName: string | null;
  quotedContent: string | null;
  quotedTalkerId: string | null;
  original: string;
}> => {
  const content = message.text();
  const SPLIT_BY = "\n- - - - - - - - - - - - - - -\n";
  if (!content.includes(SPLIT_BY)) {
    return {
      quotedTalkerAlias: null,
      quotedTalkerName: null,
      quotedTalkerId: null,
      quotedContent: null,
      original: content,
    };
  }
  const [quotedRaw, original] = splitOnFirstOccurence(content, SPLIT_BY);
  if (!quotedRaw.includes("：")) {
    return {
      quotedTalkerAlias: null,
      quotedTalkerName: null,
      quotedTalkerId: null,
      quotedContent: null,
      original,
    };
  }
  let [quotedTalkerAliasOrName, quotedContent] = splitOnFirstOccurence(
    quotedRaw,
    "："
  );
  // could be a name or an Alias depending on whether it was set by the user
  quotedTalkerAliasOrName = quotedTalkerAliasOrName.trim().slice(1);
  quotedContent = quotedContent.slice(0, -1);
  const room = message.room();
  if (!room) {
    return {
      quotedTalkerAlias: null,
      quotedTalkerName: quotedTalkerAliasOrName,
      quotedTalkerId: null,
      quotedContent,
      original,
    };
  }
  const quotedTalkerContact = await room.member(quotedTalkerAliasOrName);
  const quotedTalkerName = quotedTalkerContact?.name() ?? "";
  const quotedTalkerId = quotedTalkerContact?.id ?? "";
  return {
    quotedTalkerAlias: quotedTalkerAliasOrName,
    quotedTalkerName,
    quotedTalkerId,
    quotedContent,
    original,
  };
};

export const getMultipleRandomValues = <T>(arr: T[], num: number) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

export const shouldDraw = async (message: Message) => {
  if (message.type() !== MessageType.Text) return false;
  if (!(await isPersonalMessage(message))) return false;
  const { original } = await parseQuotedMessage(message);
  if (!DRAW_TRIGGERS.some((word) => original.includes(word.toLowerCase())))
    return false;
  return true;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getPreviousMessages = (message: Message) => {
  const room = message.room();
  if (!room) return [];
  const previousMessages =
    context[room.id]?.map((msg) => ({
      ...msg,
      content: (msg?.content?.slice(0, AI_CONFIG.maxContextLength) ??
        "") as string,
    })) ?? [];
  return previousMessages;
};
