"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  Command_1 = require("../../structures/Command"),
  querys_1 = require("../../helpers/querys");
exports.default = new Command_1.Command({
  name: "setxp",
  description: "Đặt điểm kinh nghiệm (XP) cho một người dùng",
  options: [
    {
      name: "user",
      description: "Người dùng muốn đặt XP",
      type: discord_js_1.ApplicationCommandOptionType.User,
      required: !0,
    },
    {
      name: "amount",
      description: "Số điểm XP muốn đặt",
      type: discord_js_1.ApplicationCommandOptionType.Integer,
      minValue: 0,
      required: !0,
    },
  ],
  run: ({ client: e, interaction: t }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      const r = t.options.getUser("user"),
        s = t.options.getInteger("amount"),
        o = yield (0, querys_1.users)()
          .profile()
          .get({ guildId: t.guildId, userId: r.id });
      return (
        (o.xp = s),
        (o.level = Math.floor(0.1 * Math.sqrt(o.xp))),
        yield o.save(),
        t.reply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle(`Điểm XP của người dùng **${r.username}** đã được đặt thành ${s}`)
              .setColor(e.config.GeneralSettings.EmbedColor),
          ],
        })
      );
    }),
});
