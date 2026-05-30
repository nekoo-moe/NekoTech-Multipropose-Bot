"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  UserModel_1 = tslib_1.__importDefault(require("../../models/UserModel")),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll"));
exports.default = new Command_1.Command({
  name: "messages",
  description: "Xem số lượng tin nhắn đã gửi của bạn hoặc thành viên khác",
  options: [
    {
      name: "user",
      description: "Thành viên bạn muốn xem số lượng tin nhắn",
      type: discord_js_1.ApplicationCommandOptionType.User,
    },
  ],
  run: ({ interaction: e, client: s }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
      const r = e.options.getUser("user") || e.user,
        t = yield UserModel_1.default.findOne({
          guildId: e.guildId,
          ownerId: r.id,
        });
      return (
        t ||
          (yield UserModel_1.default.create({
            guildId: e.guildId,
            ownerId: r.id,
            messages: 1,
          })),
        e.reply({
          embeds: [
            (0, replaceAll_1.default)(s.messages.Embeds.UserMessagesEmbed, {
              "{user-tag}": r.tag,
              "{messages}": (null == t ? void 0 : t.messages) || 0,
            }),
          ],
        })
      );
      } catch (error) {
        console.error("[messages] Error:", error);
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
