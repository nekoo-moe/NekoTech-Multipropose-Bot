"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  querys_1 = require("../../helpers/querys"),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll"));
exports.default = new Command_1.Command({
  name: "withdraw",
  description: "Rút tiền từ tài khoản ngân hàng về ví tiền mặt",
  options: [
    {
      name: "amount",
      description: "Số tiền muốn rút (để trống để rút toàn bộ tiền trong ngân hàng)",
      type: discord_js_1.ApplicationCommandOptionType.Number,
      minValue: 1,
    },
  ],
  run: ({ interaction: e, client: r }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
        var t;
        const a = yield (0, querys_1.users)()
            .economy()
            .get({ userId: e.user.id, guildId: e.guildId }),
          i = e.options.getNumber("amount") || a.balance.bank;
        if (!i || i <= 0 || !Number.isInteger(i))
          return e.reply({
            embeds: [
              (0, replaceAll_1.default)(
                r.messages.Embeds.WithdrawlIncorrectEmbed,
                { "{amount}": i },
              ),
            ],
          });
        if (i > a.balance.bank)
          return e.reply({
            embeds: [
              (0, replaceAll_1.default)(
                r.messages.Embeds.WithdrawlInsufficientEmbed,
                { "{amount}": i },
              ),
            ],
          });
        ((a.balance.money += i), (a.balance.bank -= i), yield a.save());
        const s = yield (0, querys_1.guilds)().get(e.guildId);
        return e.reply({
          embeds: [
            (0, replaceAll_1.default)(r.messages.Embeds.WithdrawlCorrectEmbed, {
              "{user-tag}": e.user.tag,
              "{user-avatar}": e.user.displayAvatarURL(),
              "{amount}": i,
              "{coin}":
                null === (t = null == s ? void 0 : s.economyConfig) ||
                void 0 === t
                  ? void 0
                  : t.coin,
            }),
          ],
        });
      } catch (error) {
        console.error("[withdraw] Error:", error);
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
