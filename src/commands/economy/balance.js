"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  querys_1 = require("../../helpers/querys"),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll"));
exports.default = new Command_1.Command({
  name: "balance",
  description: "Xem số dư tài khoản của bạn hoặc người dùng khác",
  options: [
    {
      name: "user",
      description: "Người dùng bạn muốn xem số dư",
      type: discord_js_1.ApplicationCommandOptionType.User,
    },
  ],
  run: ({ interaction: e, client: r }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
        const a = e.options.getUser("user") || e.user,
          s = yield (0, querys_1.guilds)().get(e.guildId),
          i = yield (0, querys_1.users)()
            .economy()
            .get({ userId: a.id, guildId: e.guildId });
        return e.reply({
          embeds: [
            (0, replaceAll_1.default)(r.messages.Embeds.BalanceEmbed, {
              "{user-tag}": a.tag,
              "{user-avatar}": a.displayAvatarURL(),
              "{coin}": (null == s ? void 0 : s.economyConfig?.coin) || "🪙",
              "{cash}": i.balance.money,
              "{bank}": i.balance.bank,
              "{total}": i.balance.money + i.balance.bank,
            }),
          ],
        });
      } catch (error) {
        console.error("[balance] Error:", error);
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
