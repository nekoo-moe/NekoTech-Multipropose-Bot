"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  pagination_1 = tslib_1.__importDefault(require("../../helpers/pagination")),
  PunishModel_1 = tslib_1.__importDefault(require("../../models/PunishModel")),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll"));
exports.default = new Command_1.Command({
  name: "warn",
  description: "Quản lý cảnh cáo thành viên",
  options: [
    {
      name: "add",
      description: "Cảnh cáo một thành viên",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "member",
          description: "Thành viên cần cảnh cáo",
          type: discord_js_1.ApplicationCommandOptionType.User,
          required: !0,
        },
        {
          name: "reason",
          description: "Lý do cảnh cáo",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
      ],
    },
    {
      name: "remove",
      description: "Gỡ cảnh cáo cho thành viên",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "case",
          description: "Số mã Case cần gỡ cảnh cáo",
          type: discord_js_1.ApplicationCommandOptionType.Integer,
          required: !0,
        },
        {
          name: "reason",
          description: "Lý do gỡ cảnh cáo",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
      ],
    },
    {
      name: "list",
      description: "Liệt kê danh sách cảnh cáo của thành viên hoặc toàn bộ máy chủ",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "member",
          description: "Thành viên cần xem lịch sử cảnh cáo",
          type: discord_js_1.ApplicationCommandOptionType.User,
        },
      ],
    },
  ],
  run: ({ client: e, interaction: r }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
      var s, i, o, n;
      const a = r.options.getString("reason"),
        d = r.options.getMember("member"),
        t = yield PunishModel_1.default.findOne({ guildId: r.guildId }),
        l = (null == t ? void 0 : t.warns) || [],
        m = r.options.getSubcommand(!1);
      if ("add" === m) {
        if (!d)
          return r.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("❌ Người dùng không còn trong server")
                .setDescription("Thành viên này đã rời khỏi server hoặc không tồn tại.")
                .setColor("Red"),
            ],
            ephemeral: true,
          });
        if (d.id === e.user.id)
          return r.reply({
            embeds: [(0, replaceAll_1.default)(e.messages.Embeds.WarnBotEmbed)],
          });
        if (d && r.member.roles.highest.position <= d.roles.highest.position)
          return r.reply({
            embeds: [
              (0, replaceAll_1.default)(
                e.messages.Embeds.WarnBadPermissionsEmbed,
              ),
            ],
          });
        const s = (null == t ? void 0 : t.cases) + 1 || 1,
          i = (e) => ({
            userId: d.id,
            reason: a,
            date: new Date(),
            moderator: r.member.id,
            caseNumber: e,
            removeReason: null,
          });
        if (t) {
          const e = [...l, i(s)];
          yield PunishModel_1.default.updateOne(
            { guildId: r.guildId },
            { $set: { warns: e, cases: s } },
          );
        } else
          yield PunishModel_1.default.create({
            guildId: r.guildId,
            warns: [i(1)],
            cases: 1,
          });
        return r.reply({
          embeds: [
            (0, replaceAll_1.default)(e.messages.Embeds.WarnSuccessfullyEmbed, {
              "{case}": s,
              "{member-id}": d.id,
              "{member-tag}": d.user.tag,
              "{reason}": a,
            }),
          ],
        });
      }
      if ("remove" === m) {
        const s = r.options.getInteger("case"),
          i = l.find((e) => (null == e ? void 0 : e.caseNumber) === s);
        if (!i || (null == i ? void 0 : i.removeReason))
          return r.reply({
            embeds: [
              (0, replaceAll_1.default)(
                e.messages.Embeds.WarnRemovalFailedEmbed,
                { "{case}": s },
              ),
            ],
          });
        const o = l.map(
          (e) => (
            (null == e ? void 0 : e.caseNumber) === s && (e.removeReason = a),
            e
          ),
        );
        return (
          yield PunishModel_1.default.updateOne(
            { guildId: r.guildId },
            { $set: { warns: o } },
          ),
          r.reply({
            embeds: [
              (0, replaceAll_1.default)(
                e.messages.Embeds.WarnRemovalSuccessfullyEmbed,
                { "{case}": s, "{member-id}": i.userId, "{reason}": a },
              ),
            ],
          })
        );
      }
      if ("list" === m) {
        const a = (null == d ? void 0 : d.id)
          ? l.filter((e) => (null == e ? void 0 : e.userId) === d.id)
          : l;
        if (!a.length)
          return r.reply({
            embeds: [
              (0, replaceAll_1.default)(e.messages.Embeds.WarnsNoFoundEmbed, {
                "{members}": (null == d ? void 0 : d.id)
                  ? d.user.tag
                  : "Tất cả thành viên",
              }),
            ],
          });
        const t = [];
        for (let l = 0; l < a.length; l++) {
          const m = a[l],
            u = (0, replaceAll_1.default)(
              e.messages.Strings.WarnRemovedMessage,
              { "{reason}": m.removeReason },
            );
          t.push(
            (0, replaceAll_1.default)(e.messages.Embeds.WarnListEmbed, {
              "{name}": (null == d ? void 0 : d.user.tag) || r.guild.name,
              "{case}": m.caseNumber,
              "{reason-remove}": m.removeReason ? u : "",
              "{user}":
                null !==
                  (i =
                    null === (s = r.guild.members.cache.get(m.userId)) ||
                    void 0 === s
                      ? void 0
                      : s.user.tag) && void 0 !== i
                  ? i
                  : `<@!${m.userId}>`,
              "{time-d}": `<t:${Math.floor(m.date.getTime() / 1e3)}>`,
              "{time-r}": `<t:${Math.floor(m.date.getTime() / 1e3)}:R>`,
              "{reason}": m.reason,
              "{moderator}":
                null !==
                  (n =
                    null === (o = r.guild.members.cache.get(m.moderator)) ||
                    void 0 === o
                      ? void 0
                      : o.user.tag) && void 0 !== n
                  ? n
                  : `<@!${m.moderator}>`,
              "{current-page}": l + 1,
              "{total-pages}": a.length,
            }),
          );
        }
        return (0, pagination_1.default)({
          interaction: r,
          embeds: t,
          time: 12e4,
        });
      }
      } catch (error) {
        console.error("[warn] Error:", error);
        const errorEmbed = new discord_js_1.EmbedBuilder()
          .setTitle("❌ Đã xảy ra lỗi")
          .setDescription("Có lỗi xảy ra khi thực thi lệnh này. Vui lòng thử lại sau.")
          .setColor("Red");
        if (r.replied || r.deferred) {
          r.followUp({ embeds: [errorEmbed], ephemeral: !0 }).catch(() => {});
        } else {
          r.reply({ embeds: [errorEmbed], ephemeral: !0 }).catch(() => {});
        }
      }
    }),
});
