"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  Command_1 = require("../../structures/Command");
exports.default = new Command_1.Command({
  name: "ping",
  description: "Kiểm tra độ trễ (ping) của bot",
  run: ({ interaction: e, client: i }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
        // Gửi tin nhắn đầu tiên để đo round-trip latency
        const sent = yield e.reply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle("🏓 Pong!")
              .setDescription("Đang đo độ trễ...")
              .setColor(i.config.GeneralSettings.EmbedColor),
          ],
          fetchReply: true,
        });

        const roundtrip = sent.createdTimestamp - e.createdTimestamp;
        const wsLatency = i.ws.ping;

        yield e.editReply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle("🏓 Pong!")
              .setColor(i.config.GeneralSettings.EmbedColor)
              .addFields(
                {
                  name: "📡 Độ trễ Bot",
                  value: `\`${roundtrip}ms\``,
                  inline: true,
                },
                {
                  name: "💓 WebSocket",
                  value: `\`${wsLatency}ms\``,
                  inline: true,
                },
              )
              .setFooter({ text: `Yêu cầu bởi ${e.user.tag}`, iconURL: e.user.displayAvatarURL() })
              .setTimestamp(),
          ],
        });
      } catch (error) {
        console.error("[ping] Error:", error);
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
