"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  querys_1 = require("../../helpers/querys"),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll"));
exports.default = new Command_1.Command({
  name: "work",
  description: "Làm việc chăm chỉ để kiếm tiền xu",
  run: ({ interaction: e, client: r }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
        const o = yield (0, querys_1.guilds)().get(e.guildId),
          s = yield (0, querys_1.users)()
            .economy()
            .get({ userId: e.user.id, guildId: e.guildId }),
          { maxMoney: i, minMoney: t, coin: l } = o.economyConfig,
          a = Math.floor(Math.random() * i) + t;
        return (
          (s.balance.money += a),
          yield s.save(),
          e.reply({
            embeds: [
              (0, replaceAll_1.default)(r.messages.Embeds.WorkEmbed, {
                "{coin}": l,
                "{money}": a,
                "{user-tag}": e.user.tag,
                "{user-avatar}": e.user.displayAvatarURL(),
              }),
            ],
          })
        );
      } catch (error) {
        console.error("[work] Error:", error);
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
