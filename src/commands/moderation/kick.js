"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  pagination_1 = tslib_1.__importDefault(require("../../helpers/pagination")),
  Command_1 = require("../../structures/Command"),
  discord_js_1 = require("discord.js"),
  PunishModel_1 = tslib_1.__importDefault(require("../../models/PunishModel"));
module.exports = new Command_1.Command({
  name: "kick",
  description: "Quản lý trục xuất thành viên",
  options: [
    {
      name: "add",
      description: "Trục xuất thành viên khỏi máy chủ",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "member",
          description: "Thành viên cần trục xuất",
          type: discord_js_1.ApplicationCommandOptionType.User,
          required: !0,
        },
        {
          name: "reason",
          description: "Lý do trục xuất",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
      ],
    },
    {
      name: "remove",
      description: "Xóa án phạt trục xuất khỏi lịch sử",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "case",
          description: "Số mã Case cần xóa",
          type: discord_js_1.ApplicationCommandOptionType.Integer,
          required: !0,
        },
        {
          name: "reason",
          description: "Lý do xóa lịch sử trục xuất",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
      ],
    },
    {
      name: "list",
      description: "Liệt kê lịch sử trục xuất của thành viên hoặc toàn bộ máy chủ",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "member",
          description: "Thành viên cần xem lịch sử trục xuất",
          type: discord_js_1.ApplicationCommandOptionType.User,
        },
      ],
    },
  ],
  run: ({ client: e, interaction: i }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      var o, s, d, t, r, n;
      const l = i.options.getString("reason"),
        a = i.options.getMember("member"),
        m = yield PunishModel_1.default.findOne({ guildId: i.guildId }),
        c = (null == m ? void 0 : m.kicks) || [],
        u = i.options.getSubcommand(!1);
      if ("add" === u) {
        if (!i.memberPermissions.has("KickMembers"))
          return i.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle(
                  "❌ Bạn không có quyền sử dụng lệnh này",
                )
                .setColor("Red"),
            ],
          });
        if (a.id === e.user.id)
          return i.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle(
                  "🤖 Không thể kick bot — bạn sẽ làm gì thiếu tôi?",
                )
                .setColor("Red"),
            ],
          });
        if (a && i.member.roles.highest.position <= a.roles.highest.position)
          return i.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle(
                  "❌ Bạn không có quyền trục xuất thành viên có vai trò cao hơn hoặc bằng bạn",
                )
                .setColor("Red"),
            ],
          });
        if (a && !a.kickable)
          return i.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle(
                  "🤖 Bot không đủ quyền hạn (vị trí vai trò) để trục xuất thành viên này",
                )
                .setColor("Red"),
            ],
          });
        const o = (null == m ? void 0 : m.cases) + 1 || 1,
          s = (e) => ({
            userId: a.id,
            reason: l,
            date: new Date(),
            staff: i.member.id,
            caseNumber: e,
            removeReason: null,
          });
        if (m) {
          const e = [...c, s(o)];
          yield PunishModel_1.default.updateOne(
            { guildId: i.guildId },
            { $set: { kicks: e, cases: o } },
          );
        } else
          yield PunishModel_1.default.create({
            guildId: i.guildId,
            kicks: [s(1)],
            cases: 1,
          });
        yield a
          .kick(l)
          .then(() => {
            i.reply({
              embeds: [
                new discord_js_1.EmbedBuilder()
                  .setTitle("Đã trục xuất thành công")
                  .setDescription(
                    `✅ \`Case #${o}\` ${a} đã bị trục xuất vì lý do \`${l}\``,
                  )
                  .setColor(e.config.GeneralSettings.EmbedColor),
              ],
            });
          })
          .catch((e) => {
            i.reply({
              embeds: [
                new discord_js_1.EmbedBuilder()
                  .setTitle("Trục xuất thành viên thất bại")
                  .setDescription(`📕 ${e.message}`)
                  .setColor("Red"),
              ],
            });
          });
      }
      if ("remove" === u) {
        const o = i.options.getInteger("case"),
          s = c.find((e) => e.caseNumber === o);
        if (!s)
          return i.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("Trục xuất thành viên thất bại")
                .setDescription(
                  `📕 \`Case #${o}\` không tồn tại hoặc đã bị xóa trước đó`,
                )
                .setColor("Red"),
            ],
          });
        const d = c.map(
          (e) => (
            (null == e ? void 0 : e.caseNumber) === o && (e.removeReason = l),
            e
          ),
        );
        return (
          yield PunishModel_1.default.updateOne(
            { guildId: i.guildId },
            { $set: { kicks: d } },
          ),
          i.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("Đã xóa án phạt trục xuất")
                .setDescription(
                  `✅ \`Case #${o}\` đã xóa khỏi lịch sử trục xuất đối với <@!${s.userId}> vì \`${l}\``,
                )
                .setColor(e.config.GeneralSettings.EmbedColor),
            ],
          })
        );
      }
      if ("list" === u) {
        const l = (null == a ? void 0 : a.id)
          ? c.filter((e) => (null == e ? void 0 : e.userId) === a.id)
          : c;
        if (!l.length)
          return i.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("Không tìm thấy lịch sử trục xuất nào")
                .setDescription(
                  `📕 \`${ (null == a ? void 0 : a.id) ? a.user.tag : "Tất cả thành viên"}\` chưa có lịch sử trục xuất nào`,
                )
                .setColor("Red"),
            ],
          });
        const m = [];
        for (let c = 0; c < l.length; c++) {
          const u = l[c],
            p = new discord_js_1.EmbedBuilder()
              .setTitle(
                `Lịch sử Trục Xuất — ${(null === (o = null == a ? void 0 : a.user) || void 0 === o ? void 0 : o.tag) || i.guild.name}`,
              )
              .setDescription(
                `**🦵 Case #${u.caseNumber}${u.removeReason ? "** __**[Đã xoá]**__" : "**"}`,
              )
              .addFields(
                {
                  name: "📦 | Mã Trường Hợp",
                  value: `Số: ${u.caseNumber}`,
                  inline: !0,
                },
                {
                  name: "👥 | Người Dùng",
                  value:
                    null !==
                      (d =
                        null === (s = i.guild.members.cache.get(u.userId)) ||
                        void 0 === s
                          ? void 0
                          : s.user.tag) && void 0 !== d
                      ? d
                      : `<@!${u.userId}>`,
                  inline: !0,
                },
                {
                  name: "📆 | Ngày",
                  value: `<t:${Math.floor(u.date.getTime() / 1e3)}> (<t:${Math.floor(u.date.getTime() / 1e3)}:R>)`,
                  inline: !0,
                },
                { name: "📃 | Lý Do", value: u.reason, inline: !0 },
                {
                  name: "👮 | Quản Trị Viên",
                  value:
                    null !==
                      (r =
                        null === (t = i.guild.members.cache.get(u.staff)) ||
                        void 0 === t
                          ? void 0
                          : t.user.tag) && void 0 !== r
                      ? r
                      : `<@!${u.moderator}>`,
                  inline: !0,
                },
              )
              .setColor(e.config.GeneralSettings.EmbedColor)
              .setFooter({
                text: `Trang ${c + 1}/${l.length} - ${i.guild.name}`,
                iconURL: e.user.displayAvatarURL(),
              });
          (u.removeReason &&
            p.addFields({
              name: "🔑 | Đã Xoá Án",
              value:
                null !== (n = u.removeReason) && void 0 !== n ? n : "Không có lý do",
              inline: !0,
            }),
            m.push(p));
        }
        (0, pagination_1.default)({ interaction: i, embeds: m, time: 12e4 });
      }
    }),
});
