"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  querys_1 = require("../../helpers/querys"),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll"));
exports.default = new Command_1.Command({
  name: "weekly",
  description: "Nhận phần quà điểm danh hàng tuần",
  run: ({ interaction: e, client: l }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
        var r, i, a;
        const d = new Date(),
          s = yield (0, querys_1.guilds)().get(e.guildId),
          t = yield (0, querys_1.users)()
            .economy()
            .get({ userId: e.user.id, guildId: e.guildId }),
          o = new Date(t.weeklyReward);
        return d < o
          ? e.reply({
              embeds: [
                (0, replaceAll_1.default)(l.messages.Embeds.WeeklyMustWaitEmbed, {
                  "{time}": Math.floor(o.getTime() / 1e3),
                }),
              ],
            })
          : ((t.weeklyReward = d.setDate(d.getDate() + 7)),
            (t.balance.bank +=
              (null === (r = null == s ? void 0 : s.economyConfig) || void 0 === r
                ? void 0
                : r.weeklyReward) || 2500),
            yield t.save(),
            e.reply({
              embeds: [
                (0, replaceAll_1.default)(l.messages.Embeds.WeeklyClaimedEmbed, {
                  "{user-tag}": e.user.tag,
                  "{user-avatar}": e.user.displayAvatarURL(),
                  "{amount}":
                    (null === (i = null == s ? void 0 : s.economyConfig) ||
                    void 0 === i
                      ? void 0
                      : i.weeklyReward) || 2500,
                  "{coin}":
                    null === (a = null == s ? void 0 : s.economyConfig) ||
                    void 0 === a
                      ? void 0
                      : a.coin,
                }),
              ],
            }));
      } catch (error) {
        console.error("[weekly] Error:", error);
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
