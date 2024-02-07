import * as sqlite from "sqlite";
import * as sqlite3 from "sqlite3";
import { Message } from "wechaty";
import {
  HUMOR_LEVEL_NAME,
  LAUGHTER_VALUE_MAP,
  SELF_LAUGHTER_ERROR_MESSAGE,
} from "./config";
import { LaughterData, LaughterDataSimplified, MessageType } from "./types";
import { parseQuotedMessage, say } from "./utils";

const getDataBase = () =>
  sqlite.open({
    filename: "./count_laughters.db",
    driver: sqlite3.Database,
  });

const getLaughterData = async (userId: string, roomId: string) => {
  const db = await getDataBase();
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
  const db = await getDataBase();
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

const calculateHumorLevelInText = (
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
    humorLevel: calculateHumorLevelInText(original),
  };
};

const roundHumorLevel = (humorLevel: number) => humorLevel.toFixed(2);

const getHumorLevelName = (humorLevel: number) => {
  for (const { threshold, name } of HUMOR_LEVEL_NAME.slice().reverse()) {
    if (humorLevel > threshold) return name;
  }
  return "???";
};

const getLaughterResponse = ({
  userAlias,
  humorLevel,
}: LaughterDataSimplified) =>
  `哈哈！@${userAlias} 的幽默指数提升到了${roundHumorLevel(
    humorLevel
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
  say(message, laughterResponse, false);
};

const getAllLaughterData = async (message: Message) => {
  const room = message.room();
  if (!room) return [];
  const roomId = room.id;
  const db = await getDataBase();
  const laughterData = await db.all<
    Pick<LaughterData, "rank" | "userId" | "userAlias" | "humorLevel">[]
  >(
    `
    SELECT ROW_NUMBER() OVER(ORDER BY humorLevel DESC ) as rank,
          userId, 
          userAlias,
          humorLevel
    FROM   Laughter
    WHERE  roomId = @roomId
    ORDER  BY humorLevel DESC; 
    `,
    {
      "@roomId": roomId,
    }
  );
  return laughterData;
};

const formatLaughterData = (
  laughterData: Pick<LaughterData, "rank" | "userAlias" | "humorLevel">
) => {
  return `${laughterData.rank}. @${
    laughterData.userAlias
  } 幽默指数：${roundHumorLevel(
    laughterData.humorLevel
  )}，目前等级：${getHumorLevelName(laughterData.humorLevel)}。`;
};

export const shouldLookUpHumorLevels = async (message: Message) => {
  const { original } = await parseQuotedMessage(message);
  return original.includes("#幽默指数");
};

const pickLaughterDataRows = (
  rows: Pick<LaughterData, "rank" | "userId" | "userAlias" | "humorLevel">[],
  talkerId: LaughterData["userId"]
) => {
  const NUM_FIRST_ROWS = 3;
  const firstRows = rows.slice(0, NUM_FIRST_ROWS);
  if (firstRows.some(({ userId }) => userId === talkerId)) return { firstRows };
  const talkerRow = rows.find(({ userId }) => userId === talkerId);
  if (!talkerRow) return { firstRows };
  return {
    firstRows,
    talkerRow,
  };
};

export const lookUpHumorLevels = async (message: Message) => {
  if (!(await shouldLookUpHumorLevels(message))) return;
  const talkerId = message.talker().id;
  const results = await getAllLaughterData(message);
  if (!results.length) return;
  const { firstRows, talkerRow } = pickLaughterDataRows(results, talkerId);
  let response = `哈哈，各位最近都在努力幽默嘛？\n\n${firstRows
    .map(formatLaughterData)
    .join("\n\n")}
    `;
  if (talkerRow) response += `--------\n${formatLaughterData(talkerRow)}`;
  response += "\n\n请再接再厉，提升自己的幽默感哦！";
  say(message, response, false);
};
