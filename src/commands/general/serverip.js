"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll")),
  axios_1 = tslib_1.__importDefault(require("axios"));
exports.default = new Command_1.Command({
  name: "serverip",
  description: "Xem thông tin chi tiết về một máy chủ game Minecraft",
  options: [
    {
      name: "hostname",
      description: "Địa chỉ IP hoặc tên miền của máy chủ Minecraft",
      type: discord_js_1.ApplicationCommandOptionType.String,
      required: !0,
    },
  ],
  run: ({ interaction: e, client: t }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
      yield e.deferReply();
      const i = e.options.getString("hostname"),
        r = (yield axios_1.default.get(`https://api.mcsrvstat.us/2/${i}`)).data;
      return (null == r ? void 0 : r.online)
        ? yield e.followUp({
            embeds: [
              (0, replaceAll_1.default)(t.messages.Embeds.ServerIpEmbed, {
                "{query-hostname}": i,
                "{ip}": r.ip,
                "{hostname}": r.hostname,
                "{online}": r.players.online,
                "{max-players}": r.players.max,
                "{software}": r.version,
              }),
            ],
          })
        : yield e.followUp({
            embeds: [
              (0, replaceAll_1.default)(t.messages.Embeds.ServerOfflineEmbed, {
                "{query-hostname}": i,
                "{hostname}": i,
              }),
            ],
          });
      } catch (error) {
        console.error("[serverip] Error:", error);
        const errorEmbed = new discord_js_1.EmbedBuilder()
          .setTitle("❌ Đã xảy ra lỗi")
          .setDescription("Có lỗi xảy ra khi thực thi lệnh này. Vui lòng thử lại sau.")
          .setColor("Red");
        if (e.replied || e.deferred) {
          e.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        } else {
          e.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        }
      }
    }),
});
