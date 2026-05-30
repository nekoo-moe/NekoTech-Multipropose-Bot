    "use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll")),
  parseStyle_1 = tslib_1.__importDefault(require("../../helpers/parseStyle")),
  TicketModel_1 = tslib_1.__importDefault(require("../../models/TicketModel")),
  Command_1 = require("../../structures/Command");

exports.default = new Command_1.Command({
  name: "ticket",
  description: "Quản lý vé hỗ trợ (ticket)",
  options: [
    {
      name: "add",
      description: "Thêm một người dùng vào kênh hỗ trợ (ticket)",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "Người dùng cần thêm vào kênh hỗ trợ",
          type: discord_js_1.ApplicationCommandOptionType.User,
          required: !0,
        },
      ],
    },
    {
      name: "remove",
      description: "Xóa một người dùng khỏi vé hỗ trợ (ticket)",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "Người dùng cần xóa khỏi vé hỗ trợ",
          type: discord_js_1.ApplicationCommandOptionType.User,
          required: !0,
        },
      ],
    },
    {
      name: "close",
      description: "Đóng vé hỗ trợ (ticket) hiện tại",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "open",
      description: "Mở lại vé hỗ trợ (ticket) đã đóng",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "claim",
      description: "Nhận giải quyết/hỗ trợ vé này",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "alert",
      description: "Cảnh báo/Nhắc nhở người dùng về vé hỗ trợ của họ",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "rename",
      description: "Đổi tên kênh hỗ trợ (ticket)",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "name",
          description: "Tên mới cho kênh hỗ trợ",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
      ],
    },
  ],
  run: ({ interaction: e, client: s }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
        const sub = e.options.getSubcommand();

        // ── add ───────────────────────────────────────────────────────────────
        if (sub === "add") {
          if (e.channel.type !== discord_js_1.ChannelType.GuildText) return;
          const i = e.options.getUser("user");
          const d = yield TicketModel_1.default.findOne({
            guildId: e.guildId,
            channelId: e.channelId,
          });
          if (!d)
            return e.reply({
              embeds: [(0, replaceAll_1.default)(s.messages.Embeds.ChannelIsNotATicketEmbed)],
            });
          if (d.usersInTicket.includes(i.id))
            return e.reply({
              embeds: [(0, replaceAll_1.default)(s.messages.Embeds.UserAlreadyInTicket)],
            });
          yield e.channel.permissionOverwrites.edit(i.id, {
            ViewChannel: !0,
            SendMessages: !0,
            AttachFiles: !0,
          });
          d.usersInTicket.push(i.id);
          yield d.save();
          return e.reply({
            embeds: [
              (0, replaceAll_1.default)(s.messages.Embeds.TicketUserAdded, {
                "{user}": i.toString(),
                "{user-id}": i.id,
                "{user-tag}": i.tag,
              }),
            ],
          });
        }

        // ── remove ────────────────────────────────────────────────────────────
        if (sub === "remove") {
          if (e.channel.type !== discord_js_1.ChannelType.GuildText) return;
          const i = e.options.getUser("user");
          const r = yield TicketModel_1.default.findOne({
            guildId: e.guildId,
            channelId: e.channelId,
          });
          if (!r)
            return e.reply({
              embeds: [(0, replaceAll_1.default)(s.messages.Embeds.ChannelIsNotATicketEmbed)],
            });
          if (!r.usersInTicket.includes(i.id))
            return e.reply({
              embeds: [
                (0, replaceAll_1.default)(s.messages.Embeds.TicketUserIsNotAdded, {
                  "{user}": i.toString(),
                  "{user-id}": i.id,
                  "{user-tag}": i.tag,
                }),
              ],
            });
          yield e.channel.permissionOverwrites.delete(i.id);
          r.usersInTicket.splice(r.usersInTicket.indexOf(i.id), 1);
          yield r.save();
          return e.reply({
            embeds: [
              (0, replaceAll_1.default)(s.messages.Embeds.TicketUserRemoved, {
                "{user}": i.toString(),
                "{user-id}": i.id,
                "{user-tag}": i.tag,
              }),
            ],
          });
        }

        // ── close ─────────────────────────────────────────────────────────────
        if (sub === "close") {
          if (e.channel.type !== discord_js_1.ChannelType.GuildText) return;
          const t = yield TicketModel_1.default.findOne({
            guildId: e.guildId,
            channelId: e.channelId,
          });
          if (!t)
            return e.reply({
              embeds: [(0, replaceAll_1.default)(s.messages.Embeds.ChannelIsNotATicketEmbed)],
            });
          if (t.isClosed)
            return e.reply({
              embeds: [(0, replaceAll_1.default)(s.messages.Embeds.TicketAlreadyClosed)],
            });
          for (const u of t.usersInTicket)
            yield e.channel.permissionOverwrites.edit(u, { ViewChannel: !1 });
          const l = yield e.reply({
            embeds: [
              (0, replaceAll_1.default)(s.messages.Embeds.TicketClosedEmbed, {
                "{user}": e.user.toString(),
                "{user-id}": e.user.id,
                "{user-tag}": e.user.tag,
              }),
            ],
            components: [
              new discord_js_1.ActionRowBuilder().addComponents(
                new discord_js_1.ButtonBuilder()
                  .setEmoji(s.messages.Buttons.TicketTranscript.Emoji)
                  .setLabel(s.messages.Buttons.TicketTranscript.Label)
                  .setStyle((0, parseStyle_1.default)(s.messages.Buttons.TicketTranscript.Style))
                  .setCustomId("tka-transcript"),
                new discord_js_1.ButtonBuilder()
                  .setEmoji(s.messages.Buttons.TicketOpen.Emoji)
                  .setLabel(s.messages.Buttons.TicketOpen.Label)
                  .setStyle((0, parseStyle_1.default)(s.messages.Buttons.TicketOpen.Style))
                  .setCustomId("tka-open"),
                new discord_js_1.ButtonBuilder()
                  .setEmoji(s.messages.Buttons.TicketDelete.Emoji)
                  .setLabel(s.messages.Buttons.TicketDelete.Label)
                  .setStyle((0, parseStyle_1.default)(s.messages.Buttons.TicketDelete.Style))
                  .setCustomId("tka-delete"),
              ),
            ],
            fetchReply: !0,
          });
          t.messageControl = l.id;
          t.isClosed = !0;
          yield t.save();
          (yield e.channel.messages.fetchPinned()).first().edit({
            components: [
              new discord_js_1.ActionRowBuilder().addComponents(
                new discord_js_1.ButtonBuilder()
                  .setEmoji(s.messages.Buttons.TicketClose.Emoji)
                  .setLabel(s.messages.Buttons.TicketClose.Label)
                  .setStyle((0, parseStyle_1.default)(s.messages.Buttons.TicketClose.Style))
                  .setCustomId("tka-close")
                  .setDisabled(!0),
                new discord_js_1.ButtonBuilder()
                  .setEmoji(s.messages.Buttons.TicketClaim.Emoji)
                  .setLabel(s.messages.Buttons.TicketClaim.Label)
                  .setStyle((0, parseStyle_1.default)(s.messages.Buttons.TicketClaim.Style))
                  .setCustomId("tka-claim")
                  .setDisabled(t.isClaimed),
              ),
            ],
          });
          return;
        }

        // ── open ──────────────────────────────────────────────────────────────
        if (sub === "open") {
          if (e.channel.type !== discord_js_1.ChannelType.GuildText) return;
          const t = yield TicketModel_1.default.findOne({
            guildId: e.guildId,
            channelId: e.channelId,
          });
          if (!t)
            return e.reply({
              embeds: [(0, replaceAll_1.default)(s.messages.Embeds.ChannelIsNotATicketEmbed)],
            });
          if (!t.isClosed)
            return e.reply({
              embeds: [(0, replaceAll_1.default)(s.messages.Embeds.TicketIsNotClosed)],
            });
          for (const u of t.usersInTicket)
            yield e.channel.permissionOverwrites.edit(u, { ViewChannel: !0 }).catch((e) => e);
          yield e.reply({
            embeds: [
              (0, replaceAll_1.default)(s.messages.Embeds.TicketOpenedEmbed, {
                "{user-tag}": e.user.tag,
              }),
            ],
          });
          t.isClosed = !1;
          yield t.save();
          const l = yield e.channel.messages.fetch(t.messageControl);
          if (l) yield l.delete();
          return (yield e.channel.messages.fetchPinned()).first().edit({
            components: [
              new discord_js_1.ActionRowBuilder().addComponents(
                new discord_js_1.ButtonBuilder()
                  .setEmoji(s.messages.Buttons.TicketClose.Emoji)
                  .setLabel(s.messages.Buttons.TicketClose.Label)
                  .setStyle((0, parseStyle_1.default)(s.messages.Buttons.TicketClose.Style))
                  .setCustomId("tka-close")
                  .setDisabled(!1),
                new discord_js_1.ButtonBuilder()
                  .setEmoji(s.messages.Buttons.TicketClaim.Emoji)
                  .setLabel(s.messages.Buttons.TicketClaim.Label)
                  .setStyle((0, parseStyle_1.default)(s.messages.Buttons.TicketClaim.Style))
                  .setCustomId("tka-claim")
                  .setDisabled(t.isClaimed),
              ),
            ],
          });
        }

        // ── claim ─────────────────────────────────────────────────────────────
        if (sub === "claim") {
          if (e.channel.type !== discord_js_1.ChannelType.GuildText) return;
          const i = yield TicketModel_1.default.findOne({
            guildId: e.guildId,
            channelId: e.channelId,
          });
          if (!i)
            return e.reply({
              embeds: [(0, replaceAll_1.default)(s.messages.Embeds.ChannelIsNotATicketEmbed)],
            });
          if (i.isClaimed) {
            var t;
            return e.reply({
              embeds: [
                (0, replaceAll_1.default)(s.messages.Embeds.TicketAlreadyClaimed, {
                  "{user-tag}":
                    (null === (t = s.users.cache.get(i.staffClaimed)) || void 0 === t
                      ? void 0
                      : t.tag) || "Unknown#000",
                }),
              ],
            });
          }
          yield e.channel.permissionOverwrites.edit(e.user.id, {
            ViewChannel: !0,
            ManageChannels: !0,
          });
          for (const r of i.staffRoles)
            yield e.channel.permissionOverwrites.edit(r, { ViewChannel: !1 }).catch((e) => e);
          i.isClaimed = !0;
          i.staffClaimed = e.user.id;
          yield i.save();
          (yield e.channel.messages.fetchPinned()).first().edit({
            components: [
              new discord_js_1.ActionRowBuilder().addComponents(
                new discord_js_1.ButtonBuilder()
                  .setEmoji(s.messages.Buttons.TicketClose.Emoji)
                  .setLabel(s.messages.Buttons.TicketClose.Label)
                  .setStyle((0, parseStyle_1.default)(s.messages.Buttons.TicketClose.Style))
                  .setCustomId("tka-close")
                  .setDisabled(i.isClosed),
                new discord_js_1.ButtonBuilder()
                  .setEmoji(s.messages.Buttons.TicketClaim.Emoji)
                  .setLabel(s.messages.Buttons.TicketClaim.Label)
                  .setStyle((0, parseStyle_1.default)(s.messages.Buttons.TicketClaim.Style))
                  .setCustomId("tka-claim")
                  .setDisabled(i.isClaimed),
              ),
            ],
          });
          return e.reply({
            embeds: [
              (0, replaceAll_1.default)(s.messages.Embeds.TicketClaimedEmbed, {
                "{user}": e.user.toString(),
                "{user-id}": e.user.id,
                "{user-tag}": e.user.tag,
              }),
            ],
          });
        }

        // ── alert ─────────────────────────────────────────────────────────────
        if (sub === "alert") {
          const t = yield TicketModel_1.default.findOne({
            guildId: e.guildId,
            channelId: e.channelId,
          });
          if (!t)
            return e.reply({
              embeds: [(0, replaceAll_1.default)(s.messages.Embeds.ChannelIsNotATicketEmbed)],
            });
          const r = yield e.guild.members.fetch(t.ownerId);
          try {
            yield r.send({
              embeds: [
                (0, replaceAll_1.default)(s.messages.Embeds.TicketAlertUserEmbed, {
                  "{user-tag}": r.user.tag,
                  "{user-id}": r.id,
                  "{user-pfp}": r.user.displayAvatarURL(),
                  "{channel-name}": e.channel.name,
                  "{channel-url}": e.channel.url,
                }),
              ],
            });
            return e.reply({
              embeds: [
                (0, replaceAll_1.default)(s.messages.Embeds.TicketAlertCorrectEmbed, {
                  "{user-tag}": r.user.tag,
                }),
              ],
            });
          } catch (_) {
            return e.reply({
              embeds: [(0, replaceAll_1.default)(s.messages.Embeds.TicketAlertWrongEmbed)],
            });
          }
        }

        // ── rename ────────────────────────────────────────────────────────────
        if (sub === "rename") {
          if (e.channel.type !== discord_js_1.ChannelType.GuildText) return;
          const i = e.options.getString("name");
          const t = yield TicketModel_1.default.findOne({
            guildId: e.guildId,
            channelId: e.channelId,
          });
          if (!t)
            return e.reply({
              embeds: [(0, replaceAll_1.default)(s.messages.Embeds.ChannelIsNotATicketEmbed)],
            });
          yield e.channel.edit({ name: i });
          t.channelName = i;
          yield t.save();
          return e.reply({
            embeds: [
              (0, replaceAll_1.default)(s.messages.Embeds.TicketChannelRenamed, {
                "{name}": i,
              }),
            ],
          });
        }

      } catch (error) {
        console.error("[ticket] Error:", error);
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
