import { Message } from "wechaty";
import { RANDOM_MESSAGE_REPLY, REPLACE_STRINGS_MAP } from "./config";
import { addMessages } from "./context";
import { MessageType } from "./types";

export const getPrompt = (message: Message) => {
  if (message.type() === MessageType.Text)
    return message
      .text()
      .replaceAll(/@\S*\s/g, "")
      .trim();
  else if (isTickle(message)) return "你好鸭";
  else throw Error("Only allows tickle and text messages");
};

const getTalker = (message: Message) => {
  if (isTickle(message)) return message.listener();
  return message.talker();
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
  message.text().replace(/.*\n- - - - - - - - - - - - - - -\n/, "");

const isPersonalMessage = async (message: Message) => {
  if (isWrongMessageType(message)) return false;
  if (isTickleMe(message)) return true;
  if (message.type() === MessageType.Text) {
    return (
      ((await message.mentionSelf()) &&
        !["@All", "所有人"].some((str) => message.text().includes(str))) ||
      removeQuoting(message).includes(`@${message.wechaty.currentUser.name()}`)
    );
  }
  return false;
};

export const shouldChat = async (message: Message) => {
  if (await isPersonalMessage(message)) return true;
  const roomTopic = await message.room()?.topic();
  if (!roomTopic) return false;
  if (!RANDOM_MESSAGE_REPLY.groups.includes(roomTopic)) return false;
  const messageLength = message.text().length;
  if (RANDOM_MESSAGE_REPLY.lengthThreshold > messageLength) return false;
  return Math.random() < RANDOM_MESSAGE_REPLY.probability;
};

const finalizeOutput = (output: string) => {
  let new_output = output;
  for (const { source, target } of REPLACE_STRINGS_MAP) {
    new_output = new_output.replaceAll(source, target);
  }
  return new_output;
};

export const say = (message: Message, content: string) => {
  const output = finalizeOutput(content);
  const room = message.room();
  if (!room) {
    message.say(output);
    return;
  }
  const talker = getTalker(message);
  const mentionList = talker ? [talker] : [];
  room.say(output, ...mentionList);
  const prompt = getPrompt(message);
  addMessages(room.id, [
    { role: "user", content: prompt },
    { role: "assistant", content: output },
  ]);
};

const splitOnFirstOccurence = (str: string, splitBy: string) => {
  if (!str.includes(splitBy)) return "";
  const firstOccurenceIndex = str.indexOf(splitBy);
  return [
    str.substring(0, firstOccurenceIndex),
    str.substring(firstOccurenceIndex + 1),
  ];
};

export const parseQuotedMessages = (message: Message) => {
  const content = message.text();
  const SPLIT_BY = "- - - - - - - - - - - - - - -";
  if (!content.includes(SPLIT_BY)) {
    return {
      quoted: null,
      orignal: content,
    };
  } else {
    const [quotedRaw, orignal] = splitOnFirstOccurence(content, SPLIT_BY);
    const quoted = splitOnFirstOccurence(quotedRaw, "：")[1]
      .trim()
      .slice(0, -1);
    return {
      quoted,
      orignal,
    };
  }
};

export const getMultipleRandomValues = <T>(arr: T[], num: number) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}