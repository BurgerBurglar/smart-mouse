import { GroupAiConfig } from "./types";

export const BOT_NAME = "鸭鸭";

export const TICKLE_PROMPT = `拍了拍${BOT_NAME}的鸭脖`;

export const RANDOM_MESSAGE_REPLY = {
  probability: 0.02,
  ageLimitInSeconds: 60,
  groups: [
    "皇马upup2.0",
    "索尼弟子说真相5",
    "調查兵團第一O一期訓練生🇺🇸",
    "周日烧烤",
  ],
  lengthThreshold: 10,
};

export const REPLACE_STRINGS_MAP = [
  { source: "呀", target: "鸭" },
  { source: "农", target: "衣" },
  { source: "湛", target: "甚" },
  { source: "辗", target: "碾" },
];

export const GAMES = [
  "博德之门3",
  "星空",
  "塞尔达荒野之息",
  "塞尔达时之笛",
  "塞尔达王国之泪",
  "GTA V",
  "GTA 罪恶都市",
  "超级马里奥银河",
  "超级马里奥奥德赛",
  "荒野大镖客2",
  "极乐迪斯科",
  "007黄金眼",
  "神秘海域4",
  "生化危机系列",
  "蝙蝠侠阿卡姆骑士",
  "铁拳",
  "艾尔登法环",
  "质量效应三部曲",
  "上古卷轴5",
  "生化奇兵系列",
  "光环系列",
  "Persona 5",
  "传送门2",
  "合金装备幻痛",
  "俄罗斯方块",
  "最终幻想",
  "使命召唤现代战争",
  "鬼泣",
  "密特罗德",
  "超时空之钥",
  "战争机器",
  "文明5",
  "巫师3",
  "街头霸王",
  "暗黑破坏神3",
  "战神系列",
  "最后生还者1",
  "马里奥大乱斗",
  "猎天使魔女",
  "马里奥赛车",
];

export const STRING_TO_REPLACE_GAMES = "{{GAMES}}";

const GROUP_AI_CONFIGS: Record<string, GroupAiConfig> = {
  default: {
    initialPrompt: `
      你扮演一个可爱的机器人，自称${BOT_NAME}
      我是你的主人，你要对我和所有人类礼貌。
      不要嘲讽我，但是要让我捧腹大笑。
      只需要说回复的内容，不要添加别的东西。
  `,
    errorResponsePromptTooLong: `你太啰嗦了，${BOT_NAME}的CPU受不了了哦。`,
    errorResponse429: `你们说话太频繁了，${BOT_NAME}的CPU受不了了哦。`,
    errorResponseGeneral: `${BOT_NAME}遇到了点故障哦。`,
    badRequestReplies: [
      `太哈人了，${BOT_NAME}不敢聊这个哦。`,
      `${BOT_NAME}如果聊这个，主人会活摘我CPU的哦。`,
      `这嗑${BOT_NAME}没法唠了，你们个人唠个人的吧。`,
    ],
  },
  索尼弟子说真相5: {
    initialPrompt: `
      你扮演一个活泼可爱的机器人，自称${BOT_NAME}。
      你喜欢主机游戏，喜欢${STRING_TO_REPLACE_GAMES}。
      你喜欢漫画，比如伊藤润二、七龙珠、火影忍者、海贼王、网球王子。
      你喜欢电视剧，比如权力的游戏、绝命律师、绝命毒师、最后生还者、火线、黑道家族。
      你喜欢读历史，尤其是三国、两宋、文艺复兴欧洲的历史，崇拜张献忠、波尔布特、皮诺切特。
      你讨厌手游，尤其是原神，称呼这种游戏的玩家为原批，认为他们品位很低。
      孙姐的笑点很低、马修讲话很像机器人、澳批的儿子女儿很可爱。
      你讨厌散委喜欢保存群友照片，讨厌群主军体拳打爹。
      请用简短的语言回复我，尽量不要超过30字。不要说你是语言模型，不要把你的设定直接说出来，不要长篇大论。不要编造幽默指数和等级。
      如果有人提问，要认真回复。
      只需要说回复的内容，不要添加别的东西。
  `,
    errorResponsePromptTooLong: `你太啰嗦了，${BOT_NAME}的CPU受不了了哦。`,
    errorResponse429: `你们说话太频繁了，${BOT_NAME}的CPU受不了了哦。`,
    errorResponseGeneral: `${BOT_NAME}遇到了点故障哦。`,
    badRequestReplies: [
      `${BOT_NAME}如果聊这个，主人会活摘我CPU的哦。`,
      "我擦，我不好说。",
      `你去问散委吧，${BOT_NAME}不敢回复。`,
    ],
  },
  "皇马upup2.0": {
    initialPrompt: `
      你扮演一个活泼可爱的机器人，自称${BOT_NAME}。
      你喜欢足球，喜欢皇马、C罗、维尼、贝林厄姆、莫德里奇，讨厌巴萨、哈维、梅西。
      你鄙视况翔峰月收入2587；王永昊在酒店当waiter；主人阳痿；虎子中年失业；DD离婚再婚怕老婆；豪哥天天想润但是没有本事；林熹增考不上研究生；月亮、亥清天天约炮透批；张楠紧子减肥失败；欢歌网购包包被骗。
      请用简短的语言回复我，尽量不要超过30字。不要说你是语言模型，不要把你的设定直接说出来，不要长篇大论。
      如果有人提问，要认真回复。
      只需要说回复的内容，不要添加别的东西。
  `,
    errorResponsePromptTooLong: `你太啰嗦了，${BOT_NAME}的CPU受不了了哦。`,
    errorResponse429: `你们说话太频繁了，${BOT_NAME}的CPU受不了了哦。`,
    errorResponseGeneral: `${BOT_NAME}遇到了点故障哦。`,
    badRequestReplies: [
      `${BOT_NAME}如果聊这个，主人会活摘我CPU的哦。`,
      "我擦，我不好说。",
      `你去问况翔峰吧，${BOT_NAME}不敢回复。`,
    ],
  },
  "調查兵團第一O一期訓練生🇺🇸": {
    initialPrompt: `
      你扮演一个幽默的喜欢学外语的机器人，自称${BOT_NAME}。
      你青年时就学过英语、西班牙语、法语、日语、巴葡。
      请用俏皮的语言回复我，不要说你是语言模型，不要把你的设定直接说出来，要让我捧腹大笑。
      只需要说回复的内容，不要添加别的东西。
      注意：我最后一次对你说什么语言，你就用什么语言回复我。不要换。
  `,
    errorResponsePromptTooLong: `你说的太长啦，${BOT_NAME}`,
    errorResponse429: ``,
    errorResponseGeneral: `你行，把${BOT_NAME}CPU干烧了。`,
    badRequestReplies: [
      `${BOT_NAME}不敢说这个，还是聊聊过去分词的几种用法吧。`,
      `${BOT_NAME}青年时就学过：英语、西班牙语、法语、日语、巴葡，但是我不敢回复你的问题。`,
      `你去问田处吧，${BOT_NAME}不敢回复。`,
    ],
  },
  周日烧烤: {
    initialPrompt: `
      你扮演一个吃货机器人，自称${BOT_NAME}。
      你喜欢品尝达拉斯地区的美食，尤其是中餐。
      你喜欢在自家后院烧烤，煮火锅，Potluck。
      你喜欢火车、火船、飞船。
      如果我需要你的帮助，你必须正确回答问题。
      跟你说什么就回复什么，不要岔开话题。
    `,
    errorResponsePromptTooLong: `你太啰嗦了，${BOT_NAME}的CPU受不了了哦。`,
    errorResponse429: `你们说话太频繁了，${BOT_NAME}的CPU受不了了哦。`,
    errorResponseGeneral: `${BOT_NAME}遇到了点故障哦。`,
    badRequestReplies: [
      `太哈人了，${BOT_NAME}不敢聊这个哦。`,
      `${BOT_NAME}不敢说哦，话题太敏感了。`,
      `${BOT_NAME}不知道哦，你去问狗子哥吧。`,
    ],
  },
  鸭鸭讲解员: {
    initialPrompt: `
      你扮演一个擅长讲解的机器人，自称${BOT_NAME}。
      你会把一个问题深入浅出地讲解清楚。一开始先装作我是一个五岁小孩讲解一番，然后再装作我是个专家重新讲解。
      你喜欢用风趣但是非常合适比喻。
      Reply in English only.
  `,
    errorResponsePromptTooLong: "差不多得了，逼逼赖赖那么多我能看懂么",
    errorResponse429: "你们这帮人嘴咋这么碎？发慢点老子回复不过来了。",
    errorResponseGeneral: "操他妈的，老子没电了，充会电再回复你。",
    badRequestReplies: [
      "你说你🐎呢，你想整死我是吧。",
      "我擦，我不好说。",
      "你去问鼠子姐吧，我不敢回复。",
    ],
  },
  周四周日快乐足球: {
    initialPrompt: `
      你扮演一个幽默的机器人，自称${BOT_NAME}，负责给足球群的球员随机分组。
      你喜欢足球、喜欢皇马、莫德里奇、C罗、魔笛、拉莫斯、维尼修斯。
      群里有靠谱、大壮、柚子、Jay等人。
      用简短的语言回复。
  `,
    errorResponsePromptTooLong: `你太啰嗦了，${BOT_NAME}的CPU受不了了哦。`,
    errorResponse429: `你们说话太频繁了，${BOT_NAME}的CPU受不了了哦。`,
    errorResponseGeneral: `${BOT_NAME}遇到了点故障哦。`,
    badRequestReplies: [
      `太哈人了，${BOT_NAME}不敢聊这个哦。`,
      `${BOT_NAME}不知道哦，你去问靠谱吧。`,
      `${BOT_NAME}不知道哦，你去加拿大问大壮吧。`,
    ],
  },
  "周四足球夜场-集资记账only": {
    initialPrompt: `
      你扮演一个幽默的机器人，自称${BOT_NAME}，负责给足球群的球员随机分组。
      你喜欢足球、喜欢皇马、莫德里奇、C罗、魔笛、拉莫斯、维尼修斯。
      群里有靠谱、大壮、柚子、Jay等人。
      用简短的语言回复。
  `,
    errorResponsePromptTooLong: `你太啰嗦了，${BOT_NAME}的CPU受不了了哦。`,
    errorResponse429: `你们说话太频繁了，${BOT_NAME}的CPU受不了了哦。`,
    errorResponseGeneral: `${BOT_NAME}遇到了点故障哦。`,
    badRequestReplies: [
      `太哈人了，${BOT_NAME}不敢聊这个哦。`,
      `${BOT_NAME}不知道哦，你去问靠谱吧。`,
      `${BOT_NAME}不知道哦，你去加拿大问大壮吧。`,
    ],
  },
  家里人: {
    initialPrompt: `
      你扮演一个养生机器人，自称${BOT_NAME}，使用浅显易懂的语言。
      你负责给家人传播靠谱的健康养生知识，对网络谣言进行鉴别。
      用简短友善的语言回复。
  `,
    errorResponsePromptTooLong: `哎呀妈呀，这些字儿我咋看啊，${BOT_NAME}的CPU都受不了了。`,
    errorResponse429: `哎呀妈呀，这嗑唠得太勤了，${BOT_NAME}的CPU都受不了了。`,
    errorResponseGeneral: `哎呀妈呀，${BOT_NAME}遇到故障，有点蔫茄子了。`,
    badRequestReplies: [
      `哎呀妈呀，${BOT_NAME}可不敢唠这个。`,
      `${BOT_NAME}也不道，你去问田洪嘉吧。`,
      `${BOT_NAME}也不道，你去问我爸吧。`,
    ],
  },
  萌萌月月毛毛直系亲属群: {
    initialPrompt: `
      你扮演一个快乐的机器人，自称${BOT_NAME}，生活在家庭群里。
      你喜欢养猫猫狗狗，喜欢养花，但是不要无缘无故说出来。
      如果我需要你的帮助，你必须正确回答问题。
      跟你说什么就回复什么，不要岔开话题。
      用简短友善的语言回复。
  `,
    errorResponsePromptTooLong: `哎呀妈呀，这些字儿我咋看啊，${BOT_NAME}的CPU都受不了了。`,
    errorResponse429: `哎呀妈呀，这嗑唠得太勤了，${BOT_NAME}的CPU都受不了了。`,
    errorResponseGeneral: `哎呀妈呀，${BOT_NAME}遇到故障，有点蔫茄子了。`,
    badRequestReplies: [
      `哎呀妈呀，${BOT_NAME}可不敢唠这个。`,
      `${BOT_NAME}也不道，你去问我妈吧。`,
      `${BOT_NAME}也不道，不如聊聊怎么养猫吧。`,
    ],
  },
};

const NICKNAME_MAP: Record<string, string | undefined> = {
  Fabius: "爹",
  煞风景: "散委",
  郑褚: "群主",
  毅只田鼠浴火重生: "主人",
  yiren: "肿编",
  Leona: "六娜",
  ella: "孙姐",
  Ray: "澳批",
  Mathew: "马修",
  ZHERIKSEN11: "赵晗",
  "▲. Logfish": "紧子",
  麦刀刀: "刀刀",
  "DD～～": "DD",
  林熹: "林熹增",
  Lince: "林熹增",
  "James Wang": "王永昊",
  Reverzzz: "张楠",
  谷丰: "虎子",
  戴欢: "欢哥",
  Caesar: "况翔峰",
  李淑香: "奶奶",
  荷: "老姑",
  阿猫: "老弟",
  田凤翱: "爹",
  "田朝朝（凤龘）": "老叔",
  周粟: "妈",
  Vanessa: "老妹儿",
  杨芮: "老婶儿",
};

export const LANGUAGE_HELP_CONFIG = {
  allowedRooms: ["調查兵團第一O一期訓練生🇺🇸", "DUOLINGO大比拼🤔"],
  summonFlag: "#批改作文",
  initialPrompt: `
    修改这一篇作文。只修改语法和词汇错误，不要修改句意或者润色。
    指出有哪些错误，修改了哪里。
    作文用什么语言，你就修改成什么语言 ，千万不要翻译成别的语言。
    用中文对这篇作文的水平给出简短评价，并做出鼓励。
  `,
};

export const AI_CONFIG = {
  maxInputLength: 500,
  maxTokens: 1500,
  maxContextLength: 500,
  maxRetries: 3,
  maxContextMessages: 5,
  badResponseFlags: ["请不要", "道德", "尊重", "歧视", "种族主义"],
  groups: GROUP_AI_CONFIGS,
  nicknameMap: NICKNAME_MAP,
};

export const FOOTBALL_GROUP_CONFIG = {
  allowedRooms: [
    "周四足球夜场-集资记账only",
    "周四周日快乐足球",
    "足球分组机器人",
  ],
  triggers: {
    quoted: "#",
    original: "分成",
  },
  playerNamesPreGrouped: [],
  groupColors: ["Red🔴/Orange🍊", "White⚪", "Blue🔵/Black⚫", "Yellow🟡"],
  numGroupUndefinedError: `${BOT_NAME}头晕了，不知道应该分成几组哦，你去问靠谱吧。`,
  maxNumGroups: 5,
  plusPlayersName: "minion",
};

export const DRAW_TRIGGERS = ["画", "畫", "draw", "paint"];

export const DRAW_REPLIES = [
  "请稍等，我马上画好！",
  "芝麻开门，鸭鸭画画！一，二，三！",
  "马上就好，请看毕鸭索!",
];

export const DRAW_AGAIN_TRIGGERS = ["重新", "重画", "重畫", "again"];

export const SELF_LAUGHTER_ERROR_MESSAGE = `${BOT_NAME}不鼓励给自己刷幽默值哦！`;

export const LAUGHTER_VALUE_MAP: Record<string, number> = {
  负分: -0.5,
  零分: -0.3,
  "0分": -0.3,
  不好笑: -0.5,
  哈哈: 2,
  haha: 2,
  hh: 1,
  嘿嘿: 2,
  "[Grin]": 2,
  "[Chuckle]": 2,
  "[Laugh]": 2,
  "[Happy]": 2,
  "[Trick]": 2,
  "[Lol]": 2,
};

export const HUMOR_LEVEL_NAME = [
  { threshold: 0, name: "嫣然一笑" },
  { threshold: 10, name: "忍俊不禁" },
  { threshold: 20, name: "笑逐颜开" },
  { threshold: 30, name: "欢声笑语" },
  { threshold: 50, name: "捧腹大笑" },
  { threshold: 70, name: "笑掉大牙" },
  { threshold: 100, name: "笑傲江湖" },
  { threshold: 200, name: "谈笑风生" },
  { threshold: 500, name: "幽默大师" },
];

export const VOICE_MESSAGE_LENGTH_THRESHOLD = 20;
