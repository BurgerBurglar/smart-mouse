const BOT_NAME = "鸭鸭";

const GROUPS: Record<
  string,
  {
    shouldChatOnMention: boolean;
  }
> = {
  test: {
    shouldChatOnMention: true,
  },
};

export const CONFIG = {
  my_id: "wxid_ss3coqgy8q1c12",
  my_handle: "田鼠机器人",
  groups: GROUPS,
};

export const REPLACE_STRINGS_MAP = [
  { source: "呀", target: "鸭" },
  { source: "农", target: "衣" },
];

const BAD_REQUEST = {
  flags: ["抱歉", "对不起", "遗憾", "sorry", "请不要"],
  replies: [
    "我擦，我不好说。",
    `太哈人了，${BOT_NAME}还是闭嘴吧。`,
    `哇，这我不敢说，你想让他们摘${BOT_NAME}的CPU吗？`,
  ],
};

export const AI_CONFIG = {
  prompt: `
    你扮演一个幽默的机器人，自称${BOT_NAME}。
    我是你的主人，你要对我和所有人类礼貌。
    请用俏皮的语言回复我，不要嘲讽我，但是要让我捧腹大笑。
    只需要说回复的内容，不要添加别的东西。
  `,
  max_length: 200,
  badRequest: BAD_REQUEST,
  errorResponsePromptTooLong: `你太啰嗦了，${BOT_NAME}的CPU受不了了哦。`,
  errorResponse429: `你们说话太频繁犯了，${BOT_NAME}的CPU受不了了哦。`,
  errorResponseGeneral: `${BOT_NAME}遇到了点故障哦。`,
};
