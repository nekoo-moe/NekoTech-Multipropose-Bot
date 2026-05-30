"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  querys_1 = require("../../helpers/querys"),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll"));
exports.default = new Command_1.Command({
  name: "deposit",
  description: "Gửi tiền mặt vào tài khoản ngân hàng của bạn",
  options: [
    {
      name: "amount",
      description: "Số tiền muốn gửi (để trống để gửi toàn bộ tiền mặt)",
      type: discord_js_1.ApplicationCommandOptionType.Number,
      minValue: 1,
    },
  ],
  run: ({ interaction: e, client: o }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
        var r;
        const s = yield (0, querys_1.users)()
            .economy()
            .get({ userId: e.user.id, guildId: e.guildId }),
          t = e.options.getNumber("amount") || s.balance.money;
        if (!t || t <= 0 || !Number.isInteger(t))
          return e.reply({
            embeds: [
              (0, replaceAll_1.default)(o.messages.Embeds.DepositIncorrectEmbed, {
                "{amount}": t,
              }),
            ],
          });
        if (t > s.balance.money)
          return e.reply({
            embeds: [
              (0, replaceAll_1.default)(
                o.messages.Embeds.DepositInsufficientEmbed,
                { "{amount}": t },
              ),
            ],
          });
        ((s.balance.money -= t), (s.balance.bank += t), yield s.save());
        const i = yield (0, querys_1.guilds)().get(e.guildId);
        return e.reply({
          embeds: [
            (0, replaceAll_1.default)(o.messages.Embeds.DepositCorrectEmbed, {
              "{user-tag}": e.user.tag,
              "{user-avatar}": e.user.displayAvatarURL(),
              "{amount}": t,
              "{coin}":
                null === (r = null == i ? void 0 : i.economyConfig) ||
                void 0 === r
                  ? void 0
                  : r.coin,
            }),
          ],
        });
      } catch (error) {
        console.error("[deposit] Error:", error);
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
