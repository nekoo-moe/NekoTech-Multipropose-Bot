"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  messageUtils_1 = require("../../helpers/messageUtils"),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll"));
exports.default = new Command_1.Command({
  name: "nuke",
  description: "Xóa sạch toàn bộ tin nhắn bằng cách tạo lại kênh chat",
  options: [
    {
      name: "channel",
      description: "Kênh chat cần dọn dẹp sạch sẽ",
      type: discord_js_1.ApplicationCommandOptionType.Channel,
      channelTypes: [discord_js_1.ChannelType.GuildText],
    },
  ],
  run: ({ client: e, interaction: s }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
        const n =
          s.options.getChannel("channel", !1, [
            discord_js_1.ChannelType.GuildText,
          ]) || s.channel;
        if (
          !(yield (0, messageUtils_1.confirmAction)({
            message: (0, replaceAll_1.default)(
              e.messages.Embeds.NukeConfirmEmbed,
            ),
            interaction: s,
          }))
        )
          return s.editReply({
            embeds: [
              (0, replaceAll_1.default)(e.messages.Embeds.NukeCancelEmbed),
            ],
            components: [],
          });
        const l = yield n.clone();
        (yield l.setPosition(n.position),
          yield n.delete(),
          yield l.send({
            embeds: [
              (0, replaceAll_1.default)(e.messages.Embeds.NukeSuccessEmbed, {
                "{user-tag}": s.user.tag,
              }),
            ],
          }));
      } catch (error) {
        console.error("[nuke] Error:", error);
        const errorEmbed = new discord_js_1.EmbedBuilder()
          .setTitle("❌ Đã xảy ra lỗi")
          .setDescription("Có lỗi xảy ra khi thực thi lệnh này. Vui lòng thử lại sau.")
          .setColor("Red");
        if (s.replied || s.deferred) {
          s.followUp({ embeds: [errorEmbed], ephemeral: !0 }).catch(() => {});
        } else {
          s.reply({ embeds: [errorEmbed], ephemeral: !0 }).catch(() => {});
        }
      }
    }),
});
