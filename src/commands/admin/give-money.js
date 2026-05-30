"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  Command_1 = require("../../structures/Command"),
  querys_1 = require("../../helpers/querys");
exports.default = new Command_1.Command({
  name: "givemoney",
  description: "Cấp tiền cho một người dùng",
  options: [
    {
      name: "user",
      description: "Người dùng được cấp tiền",
      type: discord_js_1.ApplicationCommandOptionType.User,
      required: !0,
    },
    {
      name: "amount",
      description: "Số tiền cần cấp",
      type: discord_js_1.ApplicationCommandOptionType.Integer,
      required: !0,
      minValue: 1,
    },
    {
      name: "where",
      description: "Nơi nhận tiền",
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
      const i = o.options.getUser("user"),
        n = o.options.getInteger("amount"),
        r = o.options.getString("where") || "bank",
        t = yield (0, querys_1.users)()
          .economy()
          .get({ guildId: o.guildId, userId: i.id });
      return (
        (t.balance[r] += n),
        yield t.save(),
        o.reply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle(`Người dùng **${i.username}** đã được cấp thêm ${n} xu`)
              .setColor(e.config.GeneralSettings.EmbedColor),
          ],
        })
      );
      } catch (error) {
        console.error("[give-money] Error:", error);
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
