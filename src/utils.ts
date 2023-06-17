import { Message } from "wechaty";
import { MessageType } from "./types";
import { CONFIG, REPLACE_STRINGS_MAP } from "./config";

export const isFromSelf = (message: Message) => {
  if (isTickle(message)) return message.listener()?.id === CONFIG["my_id"];
  else return message.talker().id === CONFIG["my_id"];
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
  if (message.type() === MessageType.Text) return await message.mentionSelf();
};

const finalizeOutput = (output: string) => {
  let new_output = output;
  for (const { source, target } of REPLACE_STRINGS_MAP) {
    new_output = new_output.replaceAll(source, target);
  }
  return new_output;
};

export const say = (message: Message, content: string) => {
  message.say(finalizeOutput(content));
};
