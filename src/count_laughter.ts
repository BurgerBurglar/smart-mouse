import * as sqlite from "sqlite";
import * as sqlite3 from "sqlite3";
import { Message } from "wechaty";
import {
  HUMOR_LEVEL_NAME,
  LAUGHTER_VALUE_MAP,
  SELF_LAUGHTER_ERROR_MESSAGE,
} from "./config";
import { LaughterData, MessageType } from "./types";
import { parseQuotedMessage, say } from "./utils";

const getLaughterData = async (userId: string, roomId: string) => {
  const db = await sqlite.open({
    filename: "./count_laughters.db",
    driver: sqlite3.Database,
  });

  const result = await db.get<LaughterData>(
    `
  select * from Laughter
  where userId = ?
  and roomId = ?;
`,
    userId,
    roomId
  );
  return result;
};

const incrementLaughterData = async ({
  userId,
  userAlias,
  roomId,
  humorLevel,
}: {
  userId: string;
  userAlias: string | null;
  roomId: string;
  humorLevel: number;
}) => {
  const db = await sqlite.open({
    filename: "./count_laughters.db",
    driver: sqlite3.Database,
  });
  const result = await db.run(
    `
    INSERT INTO Laughter (
      userId,
      userAlias,
      roomId,
      laughterMessages,
      humorLevel
    )
    VALUES (
      @userId,
      @userAlias,
      @roomId,
      1,
      @humorLevel
    ) ON CONFLICT (userId, roomId) DO
    UPDATE
    SET userId = @userId,
        userAlias = @userAlias,
        roomId = @roomId,
        laughterMessages = laughterMessages + 1,
        humorLevel = humorLevel + @humorLevel
    WHERE userId = @userId
      AND roomId = @roomId;
  `,
    {
      "@userId": userId,
      "@userAlias": userAlias,
      "@roomId": roomId,
      "@humorLevel": humorLevel,
    }
  );
  return result;
};

const countInstances = (string: string, substring: string) => {
  return string.split(substring).length - 1;
};

const getHumorLevelInText = (
  text: string,
  laughterValueMap = LAUGHTER_VALUE_MAP
) => {
  let humorLevel = 0;
  for (const [substring, value] of Object.entries(laughterValueMap)) {
    const numInstances = countInstances(text, substring);
    humorLevel += value * numInstances;
  }
  // normalize laughter levels
  humorLevel = humorLevel ** (1 / 3);
  return humorLevel;
};

export const getHumorInfo = async (message: Message) => {
  if (message.type() !== MessageType.Text) return null;

  const { original, quotedContent, quotedTalkerId, quotedTalkerAlias } =
    await parseQuotedMessage(message);

  // do not count if it's not quoting someone
  if (!quotedContent) return null;
  const room = message.room();
  if (!room) return null;

  return {
    quotedTalkerId,
    quotedTalkerAlias,
    roomId: room.id,
    humorLevel: getHumorLevelInText(original),
  };
};

const getHumorLevelName = (humorLevel: number) => {
  for (const { threshold, name } of HUMOR_LEVEL_NAME.slice().reverse()) {
    if (humorLevel > threshold) return name;
  }
  return "???";
};

const getLaughterResponse = ({
  userAlias,
  humorLevel,
}: Pick<LaughterData, "userAlias" | "humorLevel">) =>
  `哈哈！@${userAlias} 的幽默指数提升到了${humorLevel.toFixed(
    2
  )}。目前等级：${getHumorLevelName(humorLevel)}`;

export const respondToLaughter = async (message: Message) => {
  const humorInfo = await getHumorInfo(message);
  if (!humorInfo?.humorLevel || !humorInfo?.quotedTalkerId) return;
  const { quotedTalkerId, quotedTalkerAlias, roomId, humorLevel } = humorInfo;
  const talker = message.talker();
  if (talker.id === quotedTalkerId) {
    say(message, SELF_LAUGHTER_ERROR_MESSAGE);
    return;
  }
  await incrementLaughterData({
    userId: quotedTalkerId,
    userAlias: quotedTalkerAlias,
    roomId,
    humorLevel,
  });
  const result = await getLaughterData(quotedTalkerId, roomId);
  if (!result) return;
  const laughterResponse = getLaughterResponse({
    userAlias: quotedTalkerAlias,
    humorLevel: result.humorLevel,
  });
  say(message, laughterResponse);
};
