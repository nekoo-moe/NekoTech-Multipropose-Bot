"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  pagination_1 = tslib_1.__importDefault(require("../../helpers/pagination")),
  PunishModel_1 = tslib_1.__importDefault(require("../../models/PunishModel")),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll"));
exports.default = new Command_1.Command({
  name: "ban",
  description: "Quản lý danh sách cấm thành viên",
  options: [
    {
      name: "add",
      description: "Cấm thành viên khỏi máy chủ",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "member",
          description: "Thành viên cần cấm",
          type: discord_js_1.ApplicationCommandOptionType.User,
          required: !0,
        },
        {
          name: "reason",
          description: "Lý do cấm thành viên",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
        {
          name: "duration",
          description: "Số ngày tin nhắn cần xóa (1-7)",
          type: discord_js_1.ApplicationCommandOptionType.Integer,
          minValue: 1,
          maxValue: 7,
          required: !1,
        },
      ],
    },
    {
      name: "remove",
      description: "Gỡ lệnh cấm cho thành viên",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "case",
          description: "Số Case hoặc ID người dùng cần gỡ cấm",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
        {
          name: "reason",
          description: "Lý do gỡ cấm thành viên",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
      ],
    },
    {
      name: "list",
      description: "Danh sách cấm của một hoặc tất cả thành viên",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "member",
          description: "Thành viên cần liệt kê lịch sử cấm",
          type: discord_js_1.ApplicationCommandOptionType.User,
        },
      ],
    },
  ],
  run: ({ interaction: e, client: s }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      var a, d, r, n;
      const i = e.options.getString("reason") || "Không có lý do.",
        t = e.options.getUser("member"),
        o = yield PunishModel_1.default.findOne({ guildId: e.guildId }),
        l = (null == o ? void 0 : o.bans) || [],
        m = e.options.getSubcommand(!1);
      if ("add" === m) {
        const a = e.options.getInteger("duration");
        if (!e.memberPermissions.has("BanMembers"))
          return e.reply({
            embeds: [(0, replaceAll_1.default)(s.messages.Embeds.BanBadPermissionsEmbed)],
          });
        if (t.id === s.user.id)
          return e.reply({
            embeds: [(0, replaceAll_1.default)(s.messages.Embeds.BanBotEmbed)],
          });
        const d = e.guild.members.cache.get(t.id);
        if (d && e.member.roles.highest.position <= d.roles.highest.position)
          return e.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("❌ Bạn không có quyền cấm thành viên này do có thứ tự vai trò (Role) bằng hoặc cao hơn bạn")
                .setColor("Red"),
            ],
          });
        if (d && !d.bannable)
          return e.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("🤖 Bot không đủ quyền hạn (vị trí vai trò) để cấm thành viên này")
                .setColor("Red"),
            ],
          });
        const r = (null == o ? void 0 : o.cases) + 1 || 1,
          n = (s) => ({
            userId: t.id,
            reason: i,
            date: new Date(),
            moderator: e.member.id,
            caseNumber: s,
            removeReason: null,
          });
        if (o) {
          const s = [...l, n(r)];
          yield PunishModel_1.default.updateOne(
            { guildId: e.guildId },
            { $set: { bans: s, cases: r } },
          );
        } else
          yield PunishModel_1.default.create({
            guildId: e.guildId,
            bans: [n(1)],
            cases: 1,
          });
        (yield e.guild.members
          .ban(t, { reason: `${e.user.tag} : ${i}`, deleteMessageSeconds: a })
          .catch((a) =>
            e.reply({
              embeds: [
                (0, replaceAll_1.default)(s.messages.Embeds.BanFailedEmbed, {
                  "{error}": a,
                }),
              ],
            }),
          ),
          yield e.reply({
            embeds: [
              (0, replaceAll_1.default)(
                s.messages.Embeds.BanSuccessfullyEmbed,
                {
                  "{case}": r,
                  "{member-id}": t.id,
                  "{member-tag}": t.tag,
                  "{reason}": i,
                },
              ),
            ],
          }));
      }
      if ("remove" === m) {
        const a = parseInt(e.options.getString("case")),
          d = l.find((e) => (null == e ? void 0 : e.caseNumber) === a),
          r = l.map(
            (e) => (
              (null == e ? void 0 : e.caseNumber) === a && (e.removeReason = i),
              e
            ),
          );
        if (!d) {
          const a = yield e.guild.members
            .unban(e.options.getString("case"), `${e.user.tag} : ${i}`)
            .catch(() => {
              e.reply({
                embeds: [
                  (0, replaceAll_1.default)(
                    s.messages.Embeds.BanRemovalFailedEmbed,
                    { "{case}": e.options.getString("case") },
                  ),
                ],
              });
            });
          if (!a) return;
          return (
            yield PunishModel_1.default.updateOne(
              { guildId: e.guildId },
              { $set: { bans: r } },
            ),
            e.reply({
              embeds: [
                (0, replaceAll_1.default)(
                  s.messages.Embeds.BanRemovalSuccessfullyEmbed,
                  { "{member-id}": a.id, "{member-tag}": a.tag, "{reason}": i },
                ),
              ],
            })
          );
        }
        yield PunishModel_1.default.updateOne(
          { guildId: e.guildId },
          { $set: { bans: r } },
        );
        const n = yield e.guild.members
          .unban(d.userId, `${e.user.tag} : ${i}`)
          .catch((a) => {
            e.reply({
              embeds: [
                (0, replaceAll_1.default)(
                  s.messages.Embeds.BanRemovalFailedEmbed,
                  {
                    "{error}": a.message.replace(
                      "Unknown Ban",
                      "The ban has already been removed",
                    ),
                  },
                ),
              ],
            });
          });
        if (!n) return;
        e.reply({
          embeds: [
            (0, replaceAll_1.default)(
              s.messages.Embeds.BanRemovalSuccessfullyEmbed,
              { "{member-id}": d.userId, "{member-tag}": n.tag, "{reason}": i },
            ),
          ],
        });
      }
      if ("list" === m) {
        const i = (null == t ? void 0 : t.id)
          ? l.filter((e) => (null == e ? void 0 : e.userId) === t.id)
          : l;
        if (!i.length)
          return e.reply({
            embeds: [
              (0, replaceAll_1.default)(s.messages.Embeds.BansNoFoundEmbed, {
                "{members}": (null == t ? void 0 : t.id)
                  ? t.tag
                  : "Tất cả thành viên",
              }),
            ],
          });
        const o = [];
        for (let m = 0; m < i.length; m++) {
          const u = i[m],
            p = (0, replaceAll_1.default)(
              s.messages.Strings.BanRemovedMessage,
              { "{reason}": u.removeReason },
            );
          o.push(
            (0, replaceAll_1.default)(s.messages.Embeds.BannListEmbed, {
              "{name}": (null == t ? void 0 : t.tag) || e.guild.name,
              "{case}": u.caseNumber,
              "{reason-remove}": u.removeReason ? p : "",
              "{user}":
                null !==
                  (d =
                    null === (a = e.guild.members.cache.get(u.userId)) ||
                    void 0 === a
                      ? void 0
                      : a.user.tag) && void 0 !== d
                  ? d
                  : `<@!${u.userId}>`,
              "{time-d}": `<t:${Math.floor(u.date.getTime() / 1e3)}>`,
              "{time-r}": `<t:${Math.floor(u.date.getTime() / 1e3)}:R>`,
              "{reason}": u.reason,
              "{moderator}":
                null !==
                  (n =
                    null === (r = e.guild.members.cache.get(u.moderator)) ||
                    void 0 === r
                      ? void 0
                      : r.user.tag) && void 0 !== n
                  ? n
                  : `<@!${u.moderator}>`,
              "{current-page}": m + 1,
              "{total-pages}": l.length,
            }),
          );
        }
        (0, pagination_1.default)({ interaction: e, embeds: o, time: 12e4 });
      }
    }),
});
