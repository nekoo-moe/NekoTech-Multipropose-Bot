"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  querys_1 = require("../../helpers/querys"),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll"));
exports.default = new Command_1.Command({
  name: "pay",
  description: "Chuyển tiền của bạn cho thành viên khác",
  options: [
    {
      name: "user",
      description: "Thành viên bạn muốn chuyển tiền",
      type: discord_js_1.ApplicationCommandOptionType.User,
      required: !0,
    },
    {
      name: "amount",
      description: "Số tiền muốn chuyển",
      type: discord_js_1.ApplicationCommandOptionType.Number,
      required: !0,
      minValue: 1,
    },
  ],
  run: ({ interaction: e, client: r }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
        var s;
        const i = e.options.getUser("user"),
          d = e.options.getNumber("amount");
        if (!d || d <= 0 || !Number.isInteger(d))
          return e.reply({
            embeds: [
              (0, replaceAll_1.default)(r.messages.Embeds.PayInvalidUserEmbed),
            ],
          });
        if (e.user.id === i.id || i.bot)
          return e.reply({
            embeds: [
              (0, replaceAll_1.default)(r.messages.Embeds.PayInvalidUserEmbed),
            ],
          });
        const o = yield (0, querys_1.users)()
          .economy()
          .get({ userId: e.user.id, guildId: e.guildId });
        if (o.balance.money < d)
          return e.reply({
            embeds: [
              (0, replaceAll_1.default)(r.messages.Embeds.PayInsufficientEmbed),
            ],
          });
        const t = yield (0, querys_1.users)()
          .economy()
          .get({ guildId: e.guildId, userId: i.id });
        ((t.balance.bank += d),
          (o.balance.money -= d),
          yield t.save(),
          yield o.save());
        const a = yield (0, querys_1.guilds)().get(e.guildId);
        return e.reply({
          embeds: [
            (0, replaceAll_1.default)(r.messages.Embeds.PaySentEmbed, {
              "{coin}":
                (null === (s = null == a ? void 0 : a.economyConfig) ||
                void 0 === s
                  ? void 0
                  : s.coin) || "🪙",
              "{payed-tag}": i.tag,
              "{payed-id}": i.id,
              "{user-tag}": e.user.tag,
              "{user-avatar}": e.user.displayAvatarURL(),
              "{amount}": d,
            }),
          ],
        });
      } catch (error) {
        console.error("[pay] Error:", error);
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
