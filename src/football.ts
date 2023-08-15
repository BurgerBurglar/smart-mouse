import { Message } from "wechaty";
import { FOOTBALL_GROUP_CONFIG } from "./config";
import { parseQuotedMessages, say } from "./utils";

const shuffle = <T>(list: T[]) =>
  list
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

const shouldGroup = async (message: Message) => {
  const topic = await message.room()?.topic();
  if (!topic || !FOOTBALL_GROUP_CONFIG.allowedRooms.includes(topic))
    return false;
  const { quoted, orignal } = parseQuotedMessages(message);
  return (
    quoted?.startsWith(FOOTBALL_GROUP_CONFIG.triggers.quoted) &&
    orignal.includes(FOOTBALL_GROUP_CONFIG.triggers.original)
  );
};

const getPlayerNames = (content: string) => {
  const REGEX_ORDERED_LIST_ITEM = /\d+\. /;
  const names = content
    .split("\n")
    .filter((line) => line && REGEX_ORDERED_LIST_ITEM.test(line))
    .map((line) => line.replace(REGEX_ORDERED_LIST_ITEM, ""));
  return names;
};

const splitPlayersPreGrouped = (players: string[]) => {
  const playersPreGrouped: string[] = [];
  const playersOthers: string[] = [];

  for (const playerName of players) {
    if (
      FOOTBALL_GROUP_CONFIG.playerNamesPreGrouped.some((partialName) =>
        playerName.includes(partialName)
      )
    ) {
      playersPreGrouped.push(playerName);
    } else {
      playersOthers.push(playerName);
    }
  }
  return {
    playersPreGrouped,
    playersOthers,
  };
};

const groupListOfPlayers = (
  groups: string[][],
  players: string[],
  numPlayersPerGroup: number
) => {
  const shuffledPlayers = shuffle(players);
  while (shuffledPlayers.length) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup.length >= numPlayersPerGroup) {
      // lastGroup is full, create a new group
      groups.push([]);
    }
    // lastGroup not full yet
    const player = shuffledPlayers.shift();
    // players is empty, push other players now
    if (!player) break;
    lastGroup.push(player);
  }
};

const groupAllPlayers = (players: string[], numGroups: number) => {
  const numPlayersPerGroup = Math.floor(players.length / numGroups);
  const groups: string[][] = [[]];
  const { playersPreGrouped, playersOthers } = splitPlayersPreGrouped(players);
  groupListOfPlayers(groups, playersPreGrouped, numPlayersPerGroup);
  groupListOfPlayers(groups, playersOthers, numPlayersPerGroup);
  let result =
    "Quack quack, the groups are made! Please find your shirt color as below:\n\n";
  const shuffledGroups = shuffle(groups);
  for (const index in shuffledGroups) {
    const color =
      FOOTBALL_GROUP_CONFIG.groupColors[index] ?? "Some other color";
    const names = shuffledGroups[index].join("\n");
    result += `${color}: \n${names}\n\n`;
  }
  return result.trim();
};

const getNumGroups = (content: string) => {
  const chineseNumbers = [
    "零",
    "一",
    "两",
    "三",
    "四",
    "五",
    "六",
    "七",
    "八",
    "九",
    "十",
  ];
  const numberIndex =
    content.indexOf(FOOTBALL_GROUP_CONFIG.triggers.original) + 1;
  const numberStr = content[numberIndex + 1];
  let number: number;
  if (chineseNumbers.includes(numberStr))
    number = chineseNumbers.indexOf(numberStr);
  else number = parseInt(numberStr);
  if (
    isNaN(number) ||
    number < 2 ||
    number > FOOTBALL_GROUP_CONFIG.maxNumGroups
  )
    return undefined;
  return number;
};

export const createGroups = async (message: Message) => {
  if (!(await shouldGroup(message))) return;
  const { quoted, orignal } = parseQuotedMessages(message);
  const players = getPlayerNames(quoted!);
  const numGroups = getNumGroups(orignal);
  if (!numGroups) {
    say(message, FOOTBALL_GROUP_CONFIG.numGroupUndefinedError);
    return;
  }
  const result = groupAllPlayers(players, numGroups);
  say(message, result);
};
