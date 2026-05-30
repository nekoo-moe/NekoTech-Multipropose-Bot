"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  Command_1 = require("../../structures/Command"),
  querys_1 = require("../../helpers/querys");
exports.default = new Command_1.Command({
  name: "setlevel",
  description: "Đặt cấp độ (level) cho một người dùng",
  options: [
    {
      name: "user",
      description: "Người dùng muốn đặt cấp độ",
      type: discord_js_1.ApplicationCommandOptionType.User,
      required: !0,
    },
    {
      name: "level",
      description: "Cấp độ muốn đặt",
      type: discord_js_1.ApplicationCommandOptionType.Integer,
      minValue: 1,
      required: !0,
    },
  ],
  run: ({ client: e, interaction: r }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
      const s = r.options.getUser("user"),
        t = r.options.getInteger("level"),
        i = yield (0, querys_1.users)()
          .profile()
          .get({ guildId: r.guildId, userId: s.id });
      return (
        (i.level = t),
        (i.xp = Math.floor((10 * Math.pow(i.level, 2)) / 0.1)),
        yield i.save(),
        r.reply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle(`Cấp độ của người dùng **${s.username}** đã được đặt thành ${t}`)
              .setColor(e.config.GeneralSettings.EmbedColor),
          ],
        })
      );
      } catch (error) {
        console.error("[set-level] Error:", error);
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
