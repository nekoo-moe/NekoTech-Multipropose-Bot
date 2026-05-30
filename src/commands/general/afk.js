"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  pagination_1 = tslib_1.__importDefault(require("../../helpers/pagination")),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll")),
  querys_1 = require("../../helpers/querys");
exports.default = new Command_1.Command({
  name: "afk",
  description: "Quản lý trạng thái treo máy (AFK) của bạn",
  options: [
    {
      name: "enable",
      description: "Bật trạng thái treo máy (AFK)",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "reason",
          description: "Lý do treo máy (AFK)",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
      ],
    },
    {
      name: "disable",
      description: "Tắt trạng thái treo máy (AFK)",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "list",
      description: "Danh sách tất cả thành viên đang AFK",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
  ],
  run: ({ client: e, interaction: s }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
      const a = s.options.getSubcommand(),
        i = s.options.getString("reason"),
        t = yield (0, querys_1.users)()
          .profile()
          .get({ guildId: s.guildId, userId: s.user.id });
      if ("disable" === a)
        return (
          (t.afk.status = !1),
          (t.afk.reason = null),
          (t.afk.since = null),
          yield t.save(),
          s.reply({
            embeds: [
              (0, replaceAll_1.default)(e.messages.Embeds.AfkDisableEmbed),
            ],
          })
        );
      if ("enable" === a)
        return (
          (t.afk.status = !0),
          (t.afk.reason = i || "Không có lý do"),
          (t.afk.since = Date.now()),
          yield t.save(),
          s.reply({
            embeds: [
              (0, replaceAll_1.default)(e.messages.Embeds.AfkEnabledEmbed, {
                "{reason}": t.afk.reason,
                "{time}": Math.floor(t.afk.since / 1e3),
              }),
            ],
          })
        );
      if ("list" === a) {
        const a = yield (0, querys_1.users)()
            .profile()
            .find({ guildId: s.guildId, "afk.status": !0 }),
          i = [];
        if (!a || a.length === 0) {
          return s.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("Danh sách AFK")
                .setDescription("Không có thành viên nào đang treo máy (AFK) trong máy chủ này.")
                .setColor(e.config.GeneralSettings.EmbedColor),
            ],
            ephemeral: !0,
          });
        }
        for (const s of a) {
          const t = yield e.users.fetch(s.ownerId);
          i.push(
            (0, replaceAll_1.default)(e.messages.Embeds.AfkListEmbed, {
              "{user-username}": t.username,
              "{user-pfp}": t.displayAvatarURL(),
              "{user-tag}": t.tag,
              "{reason}": s.afk.reason,
              "{time}": Math.floor(s.afk.since / 1e3),
              "{current-page}": i.length + 1,
              "{total-pages}": a.length,
            }),
          );
        }
        (0, pagination_1.default)({
          interaction: s,
          embeds: i,
          time: 12e4,
          ephemeral: !0,
        });
      }
      } catch (error) {
        console.error("[afk] Error:", error);
        const errorEmbed = new discord_js_1.EmbedBuilder()
          .setTitle("❌ Đã xảy ra lỗi")
          .setDescription("Có lỗi xảy ra khi thực thi lệnh này. Vui lòng thử lại sau.")
          .setColor("Red");
        if (s.replied || s.deferred) {
          s.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        } else {
          s.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        }
      }
    }),
});
