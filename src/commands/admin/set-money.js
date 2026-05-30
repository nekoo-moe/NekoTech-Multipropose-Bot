"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  Command_1 = require("../../structures/Command"),
  querys_1 = require("../../helpers/querys");
exports.default = new Command_1.Command({
  name: "setmoney",
  description: "Đặt số tiền cho một người dùng",
  options: [
    {
      name: "user",
      description: "Người dùng muốn đặt số tiền",
      type: discord_js_1.ApplicationCommandOptionType.User,
      required: !0,
    },
    {
      name: "amount",
      description: "Số tiền muốn đặt",
      type: discord_js_1.ApplicationCommandOptionType.Integer,
      minValue: 0,
      required: !0,
    },
    {
      name: "where",
      description: "Nơi đặt số tiền",
      type: discord_js_1.ApplicationCommandOptionType.String,
      choices: [
        { name: "Ngân hàng", value: "bank" },
        { name: "Ví tiền mặt", value: "money" },
      ],
      required: !1,
    },
  ],
  run: ({ client: e, interaction: o }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
      const t = o.options.getUser("user"),
        n = o.options.getInteger("amount"),
        r = o.options.getString("where") || "bank",
        i = yield (0, querys_1.users)()
          .economy()
          .get({ guildId: o.guildId, userId: t.id });
      return (
        (i.balance[r] = n),
        yield i.save(),
        o.reply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle(`Số tiền của người dùng **${t.username}** đã được đặt thành ${n} xu`)
              .setColor(e.config.GeneralSettings.EmbedColor),
          ],
        })
      );
      } catch (error) {
        console.error("[set-money] Error:", error);
        const errorEmbed = new discord_js_1.EmbedBuilder()
          .setTitle("❌ Đã xảy ra lỗi")
          .setDescription("Có lỗi xảy ra khi thực thi lệnh này. Vui lòng thử lại sau.")
          .setColor("Red");
        if (o.replied || o.deferred) {
          o.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        } else {
          o.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        }
      }
    }),
});
