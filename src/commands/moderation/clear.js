"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  Command_1 = require("../../structures/Command");
exports.default = new Command_1.Command({
  name: "clear",
  description: "Xóa một số lượng tin nhắn trong kênh chat",
  options: [
    {
      name: "amount",
      description: "Số lượng tin nhắn cần xóa",
      type: discord_js_1.ApplicationCommandOptionType.Number,
      required: !0,
    },
  ],
  run: ({ client: e, interaction: o }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
        const s = o.options.getNumber("amount");
        try {
          const r = yield o.channel.bulkDelete(s);
          yield o.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle(`✅ Đã xóa thành công ${r.size} tin nhắn`)
                .setColor(e.config.GeneralSettings.EmbedColor),
            ],
          });
        } catch (e) {
          yield o.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle(
                  (null == e ? void 0 : e.message) ||
                    "❌ Đã xảy ra lỗi khi xóa tin nhắn",
                )
                .setColor("Red"),
            ],
          });
        }
      } catch (error) {
        console.error("[clear] Error:", error);
        const errorEmbed = new discord_js_1.EmbedBuilder()
          .setTitle("❌ Đã xảy ra lỗi")
          .setDescription("Có lỗi xảy ra khi thực thi lệnh này. Vui lòng thử lại sau.")
          .setColor("Red");
        if (o.replied || o.deferred) {
          o.followUp({ embeds: [errorEmbed], ephemeral: !0 }).catch(() => {});
        } else {
          o.reply({ embeds: [errorEmbed], ephemeral: !0 }).catch(() => {});
        }
      }
    }),
});
