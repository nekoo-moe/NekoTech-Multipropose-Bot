"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  pagination_1 = tslib_1.__importDefault(require("../../helpers/pagination")),
  messageUtils_1 = require("../../helpers/messageUtils"),
  PunishModel_1 = tslib_1.__importDefault(require("../../models/PunishModel")),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll"));

// ─── Subcommand option definitions ──────────────────────────────────────────
const memberOpt = (desc) => ({
  name: "member",
  description: desc,
  type: discord_js_1.ApplicationCommandOptionType.User,
  required: true,
});
const reasonOpt = (desc = "Lý do") => ({
  name: "reason",
  description: desc,
  type: discord_js_1.ApplicationCommandOptionType.String,
  required: true,
});
const caseStrOpt = (desc) => ({
  name: "case",
  description: desc,
  type: discord_js_1.ApplicationCommandOptionType.String,
  required: true,
});
const caseIntOpt = (desc) => ({
  name: "case",
  description: desc,
  type: discord_js_1.ApplicationCommandOptionType.Integer,
  required: true,
});
const memberOptional = (desc) => ({
  name: "member",
  description: desc,
  type: discord_js_1.ApplicationCommandOptionType.User,
  required: false,
});

exports.default = new Command_1.Command({
  name: "moderation",
  description: "Các lệnh kiểm duyệt máy chủ",
  options: [
    // ── ban group ────────────────────────────────────────────────────────────
    {
      name: "ban",
      description: "Quản lý danh sách cấm thành viên",
      type: discord_js_1.ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "add",
          description: "Cấm thành viên khỏi máy chủ",
          type: discord_js_1.ApplicationCommandOptionType.Subcommand,
          options: [
            memberOpt("Thành viên cần cấm"),
            reasonOpt("Lý do cấm thành viên"),
            {
              name: "duration",
              description: "Số ngày tin nhắn cần xóa (1-7)",
              type: discord_js_1.ApplicationCommandOptionType.Integer,
              minValue: 1, maxValue: 7, required: false,
            },
          ],
        },
        {
          name: "remove",
          description: "Gỡ lệnh cấm cho thành viên",
          type: discord_js_1.ApplicationCommandOptionType.Subcommand,
          options: [caseStrOpt("Số Case hoặc ID người dùng cần gỡ cấm"), reasonOpt("Lý do gỡ cấm")],
        },
        {
          name: "list",
          description: "Danh sách cấm của một hoặc tất cả thành viên",
          type: discord_js_1.ApplicationCommandOptionType.Subcommand,
          options: [memberOptional("Thành viên cần liệt kê lịch sử cấm")],
        },
      ],
    },
    // ── softban ──────────────────────────────────────────────────────────────
    {
      name: "softban",
      description: "Cấm rồi gỡ cấm ngay để xóa tin nhắn của thành viên",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        memberOpt("Thành viên cần softban"),
        reasonOpt("Lý do softban"),
        {
          name: "days",
          description: "Số ngày tin nhắn cần xóa (1-7, mặc định 7)",
          type: discord_js_1.ApplicationCommandOptionType.Integer,
          minValue: 1, maxValue: 7, required: false,
        },
      ],
    },
    // ── kick group ───────────────────────────────────────────────────────────
    {
      name: "kick",
      description: "Quản lý trục xuất thành viên",
      type: discord_js_1.ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "add",
          description: "Trục xuất thành viên khỏi máy chủ",
          type: discord_js_1.ApplicationCommandOptionType.Subcommand,
          options: [memberOpt("Thành viên cần trục xuất"), reasonOpt("Lý do trục xuất")],
        },
        {
          name: "remove",
          description: "Xóa án phạt trục xuất khỏi lịch sử",
          type: discord_js_1.ApplicationCommandOptionType.Subcommand,
          options: [caseIntOpt("Số mã Case cần xóa"), reasonOpt("Lý do xóa lịch sử")],
        },
        {
          name: "list",
          description: "Liệt kê lịch sử trục xuất",
          type: discord_js_1.ApplicationCommandOptionType.Subcommand,
          options: [memberOptional("Thành viên cần xem lịch sử trục xuất")],
        },
      ],
    },
    // ── warn group ───────────────────────────────────────────────────────────
    {
      name: "warn",
      description: "Quản lý cảnh cáo thành viên",
      type: discord_js_1.ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "add",
          description: "Cảnh cáo một thành viên",
          type: discord_js_1.ApplicationCommandOptionType.Subcommand,
          options: [memberOpt("Thành viên cần cảnh cáo"), reasonOpt("Lý do cảnh cáo")],
        },
        {
          name: "remove",
          description: "Gỡ cảnh cáo cho thành viên",
          type: discord_js_1.ApplicationCommandOptionType.Subcommand,
          options: [caseIntOpt("Số mã Case cần gỡ"), reasonOpt("Lý do gỡ cảnh cáo")],
        },
        {
          name: "list",
          description: "Liệt kê danh sách cảnh cáo",
          type: discord_js_1.ApplicationCommandOptionType.Subcommand,
          options: [memberOptional("Thành viên cần xem lịch sử cảnh cáo")],
        },
      ],
    },
    // ── clear ────────────────────────────────────────────────────────────────
    {
      name: "clear",
      description: "Xóa một số lượng tin nhắn trong kênh chat",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [{
        name: "amount",
        description: "Số lượng tin nhắn cần xóa (1-100)",
        type: discord_js_1.ApplicationCommandOptionType.Integer,
        required: true, minValue: 1, maxValue: 100,
      }],
    },
    // ── nuke ─────────────────────────────────────────────────────────────────
    {
      name: "nuke",
      description: "Xóa sạch toàn bộ tin nhắn bằng cách tạo lại kênh chat",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [{
        name: "channel",
        description: "Kênh chat cần dọn dẹp (mặc định kênh hiện tại)",
        type: discord_js_1.ApplicationCommandOptionType.Channel,
        channelTypes: [discord_js_1.ChannelType.GuildText],
        required: false,
      }],
    },
    // ── announce ─────────────────────────────────────────────────────────────
    {
      name: "announce",
      description: "Gửi tin nhắn hoặc mã embed tới một kênh chat",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "code",
          description: "Mã JSON của tin nhắn hoặc embed cần gửi",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "channel",
          description: "Kênh chat để gửi tin nhắn tới",
          type: discord_js_1.ApplicationCommandOptionType.Channel,
          channelTypes: [discord_js_1.ChannelType.GuildText, discord_js_1.ChannelType.GuildNews],
          required: false,
        },
      ],
    },
  ],

  run: ({ interaction: e, client: s }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
        const group = e.options.getSubcommandGroup(false);
        const sub   = e.options.getSubcommand(false);

        // ════════════════════════════════════════════════════════════════════
        // BAN group
        // ════════════════════════════════════════════════════════════════════
        if (group === "ban") {
          const reason = e.options.getString("reason") || "Không có lý do.";
          const target = e.options.getUser("member");
          const punish = yield PunishModel_1.default.findOne({ guildId: e.guildId });
          const bans   = (punish?.bans) || [];

          if (sub === "add") {
            const days = e.options.getInteger("duration");
            if (!e.memberPermissions.has("BanMembers"))
              return e.reply({ embeds: [(0, replaceAll_1.default)(s.messages.Embeds.BanBadPermissionsEmbed)] });
            if (target.id === s.user.id)
              return e.reply({ embeds: [(0, replaceAll_1.default)(s.messages.Embeds.BanBotEmbed)] });
            const mem = e.guild.members.cache.get(target.id);
            if (mem && e.member.roles.highest.position <= mem.roles.highest.position)
              return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("❌ Bạn không có quyền cấm thành viên này do vai trò bằng hoặc cao hơn bạn").setColor("Red")] });
            if (mem && !mem.bannable)
              return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("🤖 Bot không đủ quyền hạn để cấm thành viên này").setColor("Red")] });
            const caseNum = (punish?.cases ?? 0) + 1;
            const entry = (n) => ({ userId: target.id, reason, date: new Date(), moderator: e.member.id, caseNumber: n, removeReason: null });
            if (punish) yield PunishModel_1.default.updateOne({ guildId: e.guildId }, { $set: { bans: [...bans, entry(caseNum)], cases: caseNum } });
            else yield PunishModel_1.default.create({ guildId: e.guildId, bans: [entry(1)], cases: 1 });
            yield e.guild.members.ban(target, { reason: `${e.user.tag} : ${reason}`, deleteMessageSeconds: days }).catch((err) =>
              e.reply({ embeds: [(0, replaceAll_1.default)(s.messages.Embeds.BanFailedEmbed, { "{error}": err })] })
            );
            return e.reply({ embeds: [(0, replaceAll_1.default)(s.messages.Embeds.BanSuccessfullyEmbed, { "{case}": caseNum, "{member-id}": target.id, "{member-tag}": target.tag, "{reason}": reason })] });
          }

          if (sub === "remove") {
            const caseNum = parseInt(e.options.getString("case"));
            const found   = bans.find((b) => b?.caseNumber === caseNum);
            const updated = bans.map((b) => { if (b?.caseNumber === caseNum) b.removeReason = reason; return b; });
            if (!found) {
              const unbanned = yield e.guild.members.unban(e.options.getString("case"), `${e.user.tag} : ${reason}`).catch(() => {
                e.reply({ embeds: [(0, replaceAll_1.default)(s.messages.Embeds.BanRemovalFailedEmbed, { "{case}": e.options.getString("case") })] });
              });
              if (!unbanned) return;
              yield PunishModel_1.default.updateOne({ guildId: e.guildId }, { $set: { bans: updated } });
              return e.reply({ embeds: [(0, replaceAll_1.default)(s.messages.Embeds.BanRemovalSuccessfullyEmbed, { "{member-id}": unbanned.id, "{member-tag}": unbanned.tag, "{reason}": reason })] });
            }
            yield PunishModel_1.default.updateOne({ guildId: e.guildId }, { $set: { bans: updated } });
            const unbanned = yield e.guild.members.unban(found.userId, `${e.user.tag} : ${reason}`).catch((err) => {
              e.reply({ embeds: [(0, replaceAll_1.default)(s.messages.Embeds.BanRemovalFailedEmbed, { "{error}": err.message.replace("Unknown Ban", "Lệnh cấm đã được gỡ trước đó") })] });
            });
            if (!unbanned) return;
            return e.reply({ embeds: [(0, replaceAll_1.default)(s.messages.Embeds.BanRemovalSuccessfullyEmbed, { "{member-id}": found.userId, "{member-tag}": unbanned.tag, "{reason}": reason })] });
          }

          if (sub === "list") {
            const list = target?.id ? bans.filter((b) => b?.userId === target.id) : bans;
            if (!list.length) return e.reply({ embeds: [(0, replaceAll_1.default)(s.messages.Embeds.BansNoFoundEmbed, { "{members}": target?.id ? target.tag : "Tất cả thành viên" })] });
            const pages = list.map((u, idx) => {
              const rmMsg = (0, replaceAll_1.default)(s.messages.Strings.BanRemovedMessage, { "{reason}": u.removeReason });
              return (0, replaceAll_1.default)(s.messages.Embeds.BannListEmbed, {
                "{name}": target?.tag || e.guild.name,
                "{case}": u.caseNumber,
                "{reason-remove}": u.removeReason ? rmMsg : "",
                "{user}": e.guild.members.cache.get(u.userId)?.user.tag ?? `<@!${u.userId}>`,
                "{time-d}": `<t:${Math.floor(u.date.getTime() / 1e3)}>`,
                "{time-r}": `<t:${Math.floor(u.date.getTime() / 1e3)}:R>`,
                "{reason}": u.reason,
                "{moderator}": e.guild.members.cache.get(u.moderator)?.user.tag ?? `<@!${u.moderator}>`,
                "{current-page}": idx + 1,
                "{total-pages}": list.length,
              });
            });
            return (0, pagination_1.default)({ interaction: e, embeds: pages, time: 12e4 });
          }
        }

        // ════════════════════════════════════════════════════════════════════
        // SOFTBAN
        // ════════════════════════════════════════════════════════════════════
        if (sub === "softban") {
          const target = e.options.getUser("member");
          const reason = e.options.getString("reason") || "Không có lý do.";
          const days   = e.options.getInteger("days") ?? 7;
          if (!e.memberPermissions.has("BanMembers"))
            return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("❌ Bạn không có quyền sử dụng lệnh này").setColor("Red")] });
          if (target.id === s.user.id)
            return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("🤖 Không thể softban bot").setColor("Red")] });
          const mem = e.guild.members.cache.get(target.id);
          if (mem && e.member.roles.highest.position <= mem.roles.highest.position)
            return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("❌ Bạn không có quyền softban thành viên này do vai trò bằng hoặc cao hơn bạn").setColor("Red")] });
          if (mem && !mem.bannable)
            return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("🤖 Bot không đủ quyền hạn để softban thành viên này").setColor("Red")] });
          yield e.guild.members.ban(target, {
            reason: `[Softban] ${e.user.tag} : ${reason}`,
            deleteMessageSeconds: days * 86400,
          });
          yield e.guild.members.unban(target.id, `[Softban] ${e.user.tag} : ${reason}`);
          return e.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("🔨 Softban Thành Công")
                .setDescription(`✅ <@!${target.id}> (**${target.tag}**) đã bị softban.\nTin nhắn trong **${days} ngày** đã bị xóa.\n**Lý do:** ${reason}`)
                .setColor(s.config.GeneralSettings.EmbedColor)
                .setThumbnail(target.displayAvatarURL({ extension: "png", forceStatic: true }))
                .setTimestamp(),
            ],
          });
        }

        // ════════════════════════════════════════════════════════════════════
        // KICK group
        // ════════════════════════════════════════════════════════════════════
        if (group === "kick") {
          const reason = e.options.getString("reason") || "Không có lý do.";
          const member = e.options.getMember("member");
          const punish = yield PunishModel_1.default.findOne({ guildId: e.guildId });
          const kicks  = (punish?.kicks) || [];

          if (sub === "add") {
            if (!e.memberPermissions.has("KickMembers"))
              return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("❌ Bạn không có quyền sử dụng lệnh này").setColor("Red")] });
            if (member.id === s.user.id)
              return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("🤖 Không thể kick bot").setColor("Red")] });
            if (member && e.member.roles.highest.position <= member.roles.highest.position)
              return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("❌ Bạn không có quyền trục xuất thành viên có vai trò cao hơn hoặc bằng bạn").setColor("Red")] });
            if (member && !member.kickable)
              return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("🤖 Bot không đủ quyền hạn để trục xuất thành viên này").setColor("Red")] });
            const caseNum = (punish?.cases ?? 0) + 1;
            const entry = (n) => ({ userId: member.id, reason, date: new Date(), staff: e.member.id, caseNumber: n, removeReason: null });
            if (punish) yield PunishModel_1.default.updateOne({ guildId: e.guildId }, { $set: { kicks: [...kicks, entry(caseNum)], cases: caseNum } });
            else yield PunishModel_1.default.create({ guildId: e.guildId, kicks: [entry(1)], cases: 1 });
            yield member.kick(reason).then(() => {
              e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("Đã trục xuất thành công").setDescription(`✅ \`Case #${caseNum}\` ${member} đã bị trục xuất vì lý do \`${reason}\``).setColor(s.config.GeneralSettings.EmbedColor)] });
            }).catch((err) => {
              e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("Trục xuất thành viên thất bại").setDescription(`📕 ${err.message}`).setColor("Red")] });
            });
            return;
          }

          if (sub === "remove") {
            const caseNum = e.options.getInteger("case");
            const found   = kicks.find((k) => k.caseNumber === caseNum);
            if (!found) return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("Trục xuất thành viên thất bại").setDescription(`📕 \`Case #${caseNum}\` không tồn tại hoặc đã bị xóa trước đó`).setColor("Red")] });
            const updated = kicks.map((k) => { if (k?.caseNumber === caseNum) k.removeReason = reason; return k; });
            yield PunishModel_1.default.updateOne({ guildId: e.guildId }, { $set: { kicks: updated } });
            return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("Đã xóa án phạt trục xuất").setDescription(`✅ \`Case #${caseNum}\` đã xóa khỏi lịch sử trục xuất đối với <@!${found.userId}> vì \`${reason}\``).setColor(s.config.GeneralSettings.EmbedColor)] });
          }

          if (sub === "list") {
            const list = member?.id ? kicks.filter((k) => k?.userId === member.id) : kicks;
            if (!list.length) return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("Không tìm thấy lịch sử trục xuất nào").setDescription(`📕 \`${member?.id ? member.user.tag : "Tất cả thành viên"}\` chưa có lịch sử trục xuất nào`).setColor("Red")] });
            const pages = list.map((u, idx) =>
              new discord_js_1.EmbedBuilder()
                .setTitle(`Lịch sử Trục Xuất — ${member?.user?.tag || e.guild.name}`)
                .setDescription(`**🦵 Case #${u.caseNumber}${u.removeReason ? "** __**[Đã xoá]**__" : "**"}`)
                .addFields(
                  { name: "📦 | Mã Trường Hợp", value: `Số: ${u.caseNumber}`, inline: true },
                  { name: "👥 | Người Dùng", value: e.guild.members.cache.get(u.userId)?.user.tag ?? `<@!${u.userId}>`, inline: true },
                  { name: "📆 | Ngày", value: `<t:${Math.floor(u.date.getTime() / 1e3)}> (<t:${Math.floor(u.date.getTime() / 1e3)}:R>)`, inline: true },
                  { name: "📃 | Lý Do", value: u.reason, inline: true },
                  { name: "👮 | Quản Trị Viên", value: e.guild.members.cache.get(u.staff)?.user.tag ?? `<@!${u.staff}>`, inline: true },
                  ...(u.removeReason ? [{ name: "🔑 | Đã Xoá Án", value: u.removeReason || "Không có lý do", inline: true }] : [])
                )
                .setColor(s.config.GeneralSettings.EmbedColor)
                .setFooter({ text: `Trang ${idx + 1}/${list.length} - ${e.guild.name}`, iconURL: s.user.displayAvatarURL() })
            );
            return (0, pagination_1.default)({ interaction: e, embeds: pages, time: 12e4 });
          }
        }

        // ════════════════════════════════════════════════════════════════════
        // WARN group
        // ════════════════════════════════════════════════════════════════════
        if (group === "warn") {
          const reason = e.options.getString("reason") || "Không có lý do.";
          const member = e.options.getMember("member");
          const punish = yield PunishModel_1.default.findOne({ guildId: e.guildId });
          const warns  = (punish?.warns) || [];

          if (sub === "add") {
            if (!member)
              return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("❌ Người dùng không còn trong server").setDescription("Thành viên này đã rời khỏi server hoặc không tồn tại.").setColor("Red")], ephemeral: true });
            if (member.id === s.user.id)
              return e.reply({ embeds: [(0, replaceAll_1.default)(s.messages.Embeds.WarnBotEmbed)] });
            if (e.member.roles.highest.position <= member.roles.highest.position)
              return e.reply({ embeds: [(0, replaceAll_1.default)(s.messages.Embeds.WarnBadPermissionsEmbed)] });
            const caseNum = (punish?.cases ?? 0) + 1;
            const entry = (n) => ({ userId: member.id, reason, date: new Date(), moderator: e.member.id, caseNumber: n, removeReason: null });
            if (punish) yield PunishModel_1.default.updateOne({ guildId: e.guildId }, { $set: { warns: [...warns, entry(caseNum)], cases: caseNum } });
            else yield PunishModel_1.default.create({ guildId: e.guildId, warns: [entry(1)], cases: 1 });
            return e.reply({ embeds: [(0, replaceAll_1.default)(s.messages.Embeds.WarnSuccessfullyEmbed, { "{case}": caseNum, "{member-id}": member.id, "{member-tag}": member.user.tag, "{reason}": reason })] });
          }

          if (sub === "remove") {
            const caseNum = e.options.getInteger("case");
            const found   = warns.find((w) => w?.caseNumber === caseNum);
            if (!found || found.removeReason)
              return e.reply({ embeds: [(0, replaceAll_1.default)(s.messages.Embeds.WarnRemovalFailedEmbed, { "{case}": caseNum })] });
            const updated = warns.map((w) => { if (w?.caseNumber === caseNum) w.removeReason = reason; return w; });
            yield PunishModel_1.default.updateOne({ guildId: e.guildId }, { $set: { warns: updated } });
            return e.reply({ embeds: [(0, replaceAll_1.default)(s.messages.Embeds.WarnRemovalSuccessfullyEmbed, { "{case}": caseNum, "{member-id}": found.userId, "{reason}": reason })] });
          }

          if (sub === "list") {
            const list = member?.id ? warns.filter((w) => w?.userId === member.id) : warns;
            if (!list.length) return e.reply({ embeds: [(0, replaceAll_1.default)(s.messages.Embeds.WarnsNoFoundEmbed, { "{members}": member?.id ? member.user.tag : "Tất cả thành viên" })] });
            const pages = list.map((u, idx) => {
              const rmMsg = (0, replaceAll_1.default)(s.messages.Strings.WarnRemovedMessage, { "{reason}": u.removeReason });
              return (0, replaceAll_1.default)(s.messages.Embeds.WarnListEmbed, {
                "{name}": member?.user?.tag || e.guild.name,
                "{case}": u.caseNumber,
                "{reason-remove}": u.removeReason ? rmMsg : "",
                "{user}": e.guild.members.cache.get(u.userId)?.user.tag ?? `<@!${u.userId}>`,
                "{time-d}": `<t:${Math.floor(u.date.getTime() / 1e3)}>`,
                "{time-r}": `<t:${Math.floor(u.date.getTime() / 1e3)}:R>`,
                "{reason}": u.reason,
                "{moderator}": e.guild.members.cache.get(u.moderator)?.user.tag ?? `<@!${u.moderator}>`,
                "{current-page}": idx + 1,
                "{total-pages}": list.length,
              });
            });
            return (0, pagination_1.default)({ interaction: e, embeds: pages, time: 12e4 });
          }
        }

        // ════════════════════════════════════════════════════════════════════
        // CLEAR
        // ════════════════════════════════════════════════════════════════════
        if (sub === "clear") {
          const amount = e.options.getInteger("amount");
          try {
            const deleted = yield e.channel.bulkDelete(amount, true);
            return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle(`✅ Đã xóa thành công ${deleted.size} tin nhắn`).setColor(s.config.GeneralSettings.EmbedColor)] });
          } catch (err) {
            return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle(err?.message || "❌ Đã xảy ra lỗi khi xóa tin nhắn").setColor("Red")] });
          }
        }

        // ════════════════════════════════════════════════════════════════════
        // NUKE
        // ════════════════════════════════════════════════════════════════════
        if (sub === "nuke") {
          const channel = e.options.getChannel("channel", false, [discord_js_1.ChannelType.GuildText]) || e.channel;
          if (!(yield (0, messageUtils_1.confirmAction)({ message: (0, replaceAll_1.default)(s.messages.Embeds.NukeConfirmEmbed), interaction: e })))
            return e.editReply({ embeds: [(0, replaceAll_1.default)(s.messages.Embeds.NukeCancelEmbed)], components: [] });
          const cloned = yield channel.clone();
          yield cloned.setPosition(channel.position);
          yield channel.delete();
          return cloned.send({ embeds: [(0, replaceAll_1.default)(s.messages.Embeds.NukeSuccessEmbed, { "{user-tag}": e.user.tag })] });
        }

        // ════════════════════════════════════════════════════════════════════
        // ANNOUNCE
        // ════════════════════════════════════════════════════════════════════
        if (sub === "announce") {
          const dest = e.options.getChannel("channel") || e.channel;
          try {
            const payload = JSON.parse(e.options.getString("code"));
            if (payload?.embed?.color && typeof payload.embed.color === "string")
              payload.embed.color = (0, discord_js_1.resolveColor)(payload.embed.color);
            if (payload?.embed) { payload.embeds = [payload.embed]; delete payload.embed; }
            yield dest.send(payload);
          } catch (err) {
            return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("Lỗi khi gửi tin nhắn").setDescription(err.message).setColor("Red")], ephemeral: true });
          }
          return e.reply({ embeds: [new discord_js_1.EmbedBuilder().setTitle("Tin nhắn đã được gửi thành công!").setDescription(`✅ Tin nhắn đã được gửi đến ${dest.toString()}`).setColor(s.config.GeneralSettings.EmbedColor)], ephemeral: true });
        }

      } catch (error) {
        console.error("[moderation] Error:", error);
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
