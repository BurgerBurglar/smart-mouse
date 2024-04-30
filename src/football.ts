import { Message } from "wechaty";
import { FOOTBALL_GROUP_CONFIG } from "./config";
import { parseQuotedMessage, say } from "./utils";

const REGEX_ADDED_PLAYERS = /\+\s*\d+/;

const shuffle = <T>(list: T[]) =>
  list
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

const shouldGroup = async (message: Message) => {
  const topic = await message.room()?.topic();
  if (!topic || !FOOTBALL_GROUP_CONFIG.allowedRooms.includes(topic))
    return false;
  const { original, quotedContent } = await parseQuotedMessage(message);
  return (
    original.includes(FOOTBALL_GROUP_CONFIG.triggers.original) &&
    quotedContent?.includes(FOOTBALL_GROUP_CONFIG.triggers.quoted)
  );
};

const getPlayerNames = (content: string | null) => {
  if (!content) return [];
  const REGEX_ORDERED_LIST_ITEM = /\d+\. /;
  const names: string[] = [];
  for (const line of content.split("\n")) {
    if (!REGEX_ORDERED_LIST_ITEM.test(line)) continue;
    const lineContent = line.replace(REGEX_ORDERED_LIST_ITEM, "");
    if (!REGEX_ADDED_PLAYERS.test(line)) {
      names.push(lineContent);
      continue;
    }
    const name = lineContent.replace(REGEX_ADDED_PLAYERS, "");
    names.push(`${name} - ${FOOTBALL_GROUP_CONFIG.plusPlayersName} master`);
    const numAddedPlayer = parseInt(lineContent.split("+").slice(-1)[0]);
    if (numAddedPlayer < 1) continue;

    for (let i = 1; i <= numAddedPlayer; i++) {
      names.push(`${name}'s ${FOOTBALL_GROUP_CONFIG.plusPlayersName} ${i}`);
    }
  }
  return names;
};

const splitPlayers = (players: string[]) => {
  const playersWithPluses: string[] = [];
  const playersPreGrouped: string[] = [];
  const playersOthers: string[] = [];

  for (const playerName of players) {
    // TODO: this is a hack. change into parsing text in the future.
    if (playerName.includes(FOOTBALL_GROUP_CONFIG.plusPlayersName)) {
      playersWithPluses.push(playerName);
    } else if (
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
    playersWithPluses,
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
    let lastGroup = groups[groups.length - 1];
    if (lastGroup.length >= numPlayersPerGroup) {
      // lastGroup is full, create a new group
      groups.push([]);
      lastGroup = groups[groups.length - 1];
    }
    // lastGroup not full yet
    const player = shuffledPlayers.shift();
    // players is empty, push other players now
    if (!player) break;
    lastGroup.push(player);
  }
};

const groupAllPlayers = (players: string[], numGroups: number) => {
  const numPlayersPerGroup = Math.ceil(players.length / numGroups);
  const groups: string[][] = [[]];
  const { playersWithPluses, playersPreGrouped, playersOthers } =
    splitPlayers(players);
  groupListOfPlayers(groups, playersWithPluses, numPlayersPerGroup);
  groupListOfPlayers(groups, playersOthers, numPlayersPerGroup);
  groupListOfPlayers(groups, playersPreGrouped, numPlayersPerGroup);
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
  const { quotedContent, original } = await parseQuotedMessage(message);
  const players = getPlayerNames(quotedContent);
  const numGroups = getNumGroups(original);
  if (!numGroups) {
    say(message, FOOTBALL_GROUP_CONFIG.numGroupUndefinedError);
    return;
  }
  const result = groupAllPlayers(players, numGroups);
  say(message, result);
};
