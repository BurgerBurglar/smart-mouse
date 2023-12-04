import "dotenv/config";
import { log, ScanStatus, WechatyBuilder } from "wechaty";
import { PuppetPadlocal } from "wechaty-puppet-padlocal";
import { WechatyEventListenerMessage } from "wechaty/dist/esm/src/schemas/wechaty-events";
import { chat, dingDongBot } from "./chat";
import { createGroups } from "./football";
import { getLanguageHelp } from "./language_help";
import { isFromSelf, isWrongMessageType } from "./utils";

const puppet = new PuppetPadlocal({
  token: process.env["PADLOCAL_TOKEN"],
});

const onMessage: WechatyEventListenerMessage = async (message) => {
  try {
    log.info(`on message: ${message.toString()}`);
    if (isWrongMessageType(message)) return;
    if (isFromSelf(message)) return;
    dingDongBot(message);
    getLanguageHelp(message);
    createGroups(message);
    chat(message);
  } catch (e) {
    log.error(e);
  }
};

const bot = WechatyBuilder.build({
  name: "PadLocalDemo",
  puppet,
})
  .on("scan", (qrcode, status) => {
    if (!(status === ScanStatus.Waiting && qrcode)) {
      log.info(`onScan: ${ScanStatus[status]}(${status})`);
    } else {
      const qrcodeImageUrl = [
        "https://wechaty.js.org/qrcode/",
        encodeURIComponent(qrcode),
      ].join("");

      log.info(`onScan: ${ScanStatus[status]}(${status})`);

      console.log(
        "\n=================================================================="
      );
      require("qrcode-terminal").generate(qrcode, { small: true });
      console.log(`\n${qrcodeImageUrl}`);
      console.log(
        "\n==================================================================\n"
      );
    }
  })

  .on("login", (user) => {
    log.info(`${user} login`);
  })

  .on("logout", (user, reason) => {
    log.info(`${user} logout, reason: ${reason}`);
  })

  .on("message", onMessage)

  .on("error", (error) => {
    log.error(`on error: ${error}`);
  });

bot.start().then(() => {
  log.info("started.");
});
