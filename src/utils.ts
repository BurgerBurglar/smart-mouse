import { Message } from "wechaty";
import { MessageType } from "./types";
import { CONFIG, REPLACE_STRINGS_MAP } from "./config";
import { addMessages } from "./context";

export const getPrompt = (message: Message) => {
  if (message.type() === MessageType.Text)
    return message.text().replaceAll(/@\S*\s/g, "");
  else if (isTickle(message)) return "你好鸭";
  else throw Error("Only allows tickle and text messages");
};

const getTalker = (message: Message) => {
  if (isTickle(message)) return message.listener();
  return message.talker();
};

export const isFromSelf = (message: Message) => {
  return getTalker(message)?.id === CONFIG["my_id"];
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
    message.text().includes(`<pattedusername>${CONFIG.my_id}</pattedusername>`)
  );
};

export const isWrongMessageType = (message: Message) =>
  ![MessageType.Text, MessageType.Recalled].includes(message.type());

export const isPersonalMessage = async (message: Message) => {
  if (isWrongMessageType(message)) return false;
  if (isTickleMe(message)) return true;
  if (message.type() === MessageType.Text) {
    return (
      (await message.mentionSelf()) ||
      message.text().includes(`@${CONFIG.my_handle}`)
    );
  }
  return false;
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
