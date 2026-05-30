"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  Command_1 = require("../../structures/Command");
exports.default = new Command_1.Command({
  name: "say",
  description: "Gửi một tin nhắn thông qua bot",
  options: [
    {
      name: "message",
      description: "Nội dung tin nhắn muốn gửi",
      type: discord_js_1.ApplicationCommandOptionType.String,
      required: !0,
    },
  ],
  run: ({ client: e, interaction: s }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
      const t = s.options.getString("message");
      (yield s.channel.send({ content: t }),
        yield s.reply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle("✅ Tin nhắn đã được gửi")
              .setColor(e.config.GeneralSettings.EmbedColor),
          ],
          ephemeral: !0,
        }));
      } catch (error) {
        console.error("[say] Error:", error);
        const errorEmbed = new discord_js_1.EmbedBuilder()
          .setTitle("❌ Đã xảy ra lỗi")
          .setDescription("Có lỗi xảy ra khi thực thi lệnh này. Vui lòng thử lại sau.")
          .setColor("Red");
        if (s.replied || s.deferred) {
          s.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        } else {
          s.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        }
      }
    }),
});
