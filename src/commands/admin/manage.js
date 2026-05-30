"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  messageUtils_1 = require("../../helpers/messageUtils"),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll")),
  querys_1 = require("../../helpers/querys");
function manageVoiceChannelsCategory({ client: e, interaction: n }) {
  return tslib_1.__awaiter(this, void 0, void 0, function* () {
    const t = n.options.getSubcommand();
    if ("send" === t) {
      const t =
        n.options.getChannel("channel", !1, [
          discord_js_1.ChannelType.GuildText,
        ]) || n.channel;
      yield t.send((0, messageUtils_1.generateInterfaceEmbed)(e));
    }
    if ("setup" === t) {
      const t = yield (0, querys_1.guilds)().get(n.guildId);
      if (t.generatorChannel)
        return n.reply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle("❌ Đã có kênh generator tồn tại")
              .setDescription("Dùng lệnh /manage voice-channels delete để xóa trước")
              .setColor("Red"),
          ],
          ephemeral: !0,
        });
      const s = yield n.guild.channels.create({
          name: "voice channels",
          type: discord_js_1.ChannelType.GuildCategory,
        }),
        i = yield n.guild.channels.create({
          name: "interface",
          type: discord_js_1.ChannelType.GuildText,
          parent: s.id,
        }),
        o = yield n.guild.channels.create({
          name: "➕ Generator",
          type: discord_js_1.ChannelType.GuildVoice,
          parent: s.id,
        });
      ((t.generatorChannel = o.id),
        yield t.save(),
        yield i.send((0, messageUtils_1.generateInterfaceEmbed)(e)),
        yield n.reply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setColor(e.config.GeneralSettings.EmbedColor)
              .setTitle("✅ Tất cả các kênh đã được tạo thành công"),
          ],
        }));
    }
    if ("delete" === t) {
      const t = yield (0, querys_1.guilds)().get(n.guildId),
        s = n.guild.channels.cache.get(t.generatorChannel);
      (s && s.delete().catch((e) => e),
        (t.generatorChannel = null),
        yield t.save(),
        yield n.reply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setColor(e.config.GeneralSettings.EmbedColor)
              .setTitle("Kênh đã được xóa thành công"),
          ],
        }));
    }
  });
}
function manageStatsChannels({ client: e, interaction: n }) {
  var t, s;
  return tslib_1.__awaiter(this, void 0, void 0, function* () {
    const i = n.options.getSubcommand();
    if ("setup" === i) {
      yield n.deferReply();
      const t = n.options.getInteger("channel"),
        s = yield (0, querys_1.guilds)().get(n.guildId);
      if (!s)
        return n.followUp({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle(
                "Không tìm thấy máy chủ này trong cơ sở dữ liệu, vui lòng dùng lệnh /setup",
              )
              .setColor("Red"),
          ],
          ephemeral: !0,
        });
      const i = [],
        o = yield n.guild.channels.create({
          name: "📊 Server Stats 📊",
          type: discord_js_1.ChannelType.GuildCategory,
          permissionOverwrites: [
            {
              id: n.guildId,
              allow: [discord_js_1.PermissionFlagsBits.ViewChannel],
              deny: [
                discord_js_1.PermissionFlagsBits.SendMessages,
                discord_js_1.PermissionFlagsBits.Connect,
              ],
            },
          ],
          position: 0,
        }),
        d = (e) =>
          tslib_1.__awaiter(this, void 0, void 0, function* () {
            const s = yield n.guild.channels.create({
              name: (0, replaceAll_1.default)(e, {
                "{all-members}": n.guild.memberCount,
                "{members}": n.guild.members.cache.filter((e) => !e.user.bot)
                  .size,
                "{bots}": n.guild.members.cache.filter((e) => e.user.bot).size,
              }),
              parent: o.id,
              type: t,
            });
            i.push({ id: s.id, name: e });
          });
      try {
        (yield d("All Members: {all-members}"),
          yield d("Members: {members}"),
          yield d("Bots: {bots}"),
          yield s.updateOne({ $set: { statsChannels: i } }),
          yield n.followUp({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("📊 Kênh Thống Kê Máy Chủ")
                .setDescription("Đã tạo các kênh thống kê mặc định")
                .setColor(e.config.GeneralSettings.EmbedColor),
            ],
          }));
      } catch (t) {
        return (
          e.logger.error(t),
          n.followUp({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("Đã xảy ra lỗi hệ thống, vui lòng kiểm tra console")
                .setColor("Red"),
            ],
            ephemeral: !0,
          })
        );
      }
    }
    if ("edit" === i) {
      const t = n.options.getChannel("channel"),
        s = n.options.getString("name"),
        i = yield (0, querys_1.guilds)().get(n.guildId),
        o = i.statsChannels.find((e) => e.id === t.id);
      return o
        ? ((o.name = s),
          yield i.updateOne({ $set: { statsChannels: i.statsChannels } }),
          n.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("✅ Tên kênh thống kê đã được cập nhật")
                .setColor(e.config.GeneralSettings.EmbedColor),
            ],
          }))
        : n.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("❌ Không tìm thấy kênh này trong cơ sở dữ liệu")
                .setColor("Red"),
            ],
            ephemeral: !0,
          });
    }
    if ("delete" === i) {
      const s =
          null === (t = n.options.getChannel("channel")) || void 0 === t
            ? void 0
            : t.id,
        i = yield (0, querys_1.guilds)().get(n.guildId),
        o = i.statsChannels.findIndex((e) => e.id === s);
      if (o < 0)
        return n.reply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle("❌ Kênh này không phải là kênh thống kê")
              .setColor("Red"),
          ],
        });
      const d = i.statsChannels.filter((e, n) => n !== o);
      return (
        yield i.updateOne({ $set: { statsChannels: d } }),
        n.reply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle("✅ Kênh đã được xóa thành công")
              .setColor(e.config.GeneralSettings.EmbedColor),
          ],
        })
      );
    }
    if ("check" === i) {
      const t = yield (0, querys_1.guilds)().get(n.guildId);
      if (!(null === (s = t.statsChannels) || void 0 === s ? void 0 : s.length))
        return n.reply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle("❌ Không có kênh thống kê nào")
              .setColor("Red"),
          ],
          ephemeral: !0,
        });
      const i = [],
        o = [];
      for (const e of t.statsChannels) {
        n.guild.channels.cache.get(e.id) ||
          (i.push(`Kênh ${e.name} không tồn tại trong server`), o.push(e.id));
      }
      return (
        yield t.updateOne({
          $set: {
            statsChannels: t.statsChannels.filter((e) => !o.includes(e.id)),
          },
        }),
        n.reply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle("✅ Kênh Thống Kê Đã Được Kiểm Tra")
              .setDescription(i.length ? i.join("\n") : "ÔK, không có lỗi nào")
              .setColor(e.config.GeneralSettings.EmbedColor),
          ],
        })
      );
    }
  });
}
exports.default = new Command_1.Command({
  name: "manage",
  description: "Quản lý cấu hình của Discord bot",
  options: [
    {
      name: "voice-channels",
      description: "Quản lý các kênh thoại tạm thời",
      type: discord_js_1.ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "send",
          description: "Gửi bảng điều khiển kênh thoại tạm thời",
          type: discord_js_1.ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "Kênh muốn gửi bảng điều khiển",
              type: discord_js_1.ApplicationCommandOptionType.Channel,
              channelTypes: [discord_js_1.ChannelType.GuildText],
              required: !1,
            },
          ],
        },
        {
          name: "setup",
          description: "Tạo kênh Generator và kênh giao diện",
          type: discord_js_1.ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "delete",
          description: "Xóa kênh generator hiện tại",
          type: discord_js_1.ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
    {
      name: "stats",
      description: "Quản lý hệ thống kênh thống kê",
      type: discord_js_1.ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "setup",
          description: "Thiết lập các kênh thống kê đếm số lượng cơ bản",
          type: discord_js_1.ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description:
                "Loại kênh bạn muốn sử dụng để hiển thị số lượng thống kê",
              type: discord_js_1.ApplicationCommandOptionType.Integer,
              choices: [
                { name: "Kênh thoại (Khuyên dùng)", value: 2 },
                { name: "Kênh chữ", value: 0 },
              ],
              required: !0,
            },
          ],
        },
        {
          name: "edit",
          description: "Chỉnh sửa tên kênh để dùng các biến đếm mới",
          type: discord_js_1.ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "Kênh cần chỉnh sửa",
              type: discord_js_1.ApplicationCommandOptionType.Channel,
              required: !0,
            },
            {
              name: "name",
              description:
                "Tên kênh mới ({all-members}, {members}, {bots})",
              type: discord_js_1.ApplicationCommandOptionType.String,
              required: !0,
            },
          ],
        },
        {
          name: "delete",
          description: "Xóa một kênh thống kê khỏi cơ sở dữ liệu",
          type: discord_js_1.ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "Kênh thống kê muốn xóa",
              type: discord_js_1.ApplicationCommandOptionType.Channel,
              required: !0,
            },
          ],
        },
        {
          name: "check",
          description: "Kiểm tra và sửa các lỗi thường gặp của kênh thống kê",
          type: discord_js_1.ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
  ],
  run: ({ client: e, interaction: n }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
      ({
        "voice-channels": manageVoiceChannelsCategory,
        stats: manageStatsChannels,
      })[n.options.getSubcommandGroup()]({ client: e, interaction: n });
      } catch (error) {
        console.error("[manage] Error:", error);
        const errorEmbed = new discord_js_1.EmbedBuilder()
          .setTitle("❌ Đã xảy ra lỗi")
          .setDescription("Có lỗi xảy ra khi thực thi lệnh này. Vui lòng thử lại sau.")
          .setColor("Red");
        if (n.replied || n.deferred) {
          n.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        } else {
          n.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        }
      }
    }),
});
