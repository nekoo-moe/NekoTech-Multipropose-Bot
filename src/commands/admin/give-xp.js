  "use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  Command_1 = require("../../structures/Command"),
  querys_1 = require("../../helpers/querys");
exports.default = new Command_1.Command({
  name: "givexp",
  description: "Cấp điểm kinh nghiệm (XP) cho một người dùng",
  options: [
    {
      name: "user",
      description: "Người dùng được nhận XP",
      type: discord_js_1.ApplicationCommandOptionType.User,
      required: !0,
    },
    {
      name: "amount",
      description: "Số lượng XP muốn cấp",
      type: discord_js_1.ApplicationCommandOptionType.Integer,
      minValue: 1,
      required: !0,
    },
  ],
  run: ({ client: e, interaction: r }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
      const i = r.options.getUser("user"),
        t = r.options.getInteger("amount"),
        o = yield (0, querys_1.users)()
          .profile()
          .get({ guildId: r.guildId, userId: i.id });
      return (
        (o.xp += t),
        (o.level = Math.floor(0.1 * Math.sqrt(o.xp))),
        yield o.save(),
        r.reply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle(`Người dùng **${i.username}** đã được cộng ${t} XP`)
              .setColor(e.config.GeneralSettings.EmbedColor),
          ],
        })
      );
      } catch (error) {
        console.error("[give-xp] Error:", error);
        const errorEmbed = new discord_js_1.EmbedBuilder()
          .setTitle("❌ Đã xảy ra lỗi")
          .setDescription("Có lỗi xảy ra khi thực thi lệnh này. Vui lòng thử lại sau.")
          .setColor("Red");
        if (r.replied || r.deferred) {
          r.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        } else {
          r.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        }
      }
    }),
});
