"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  pagination_1 = tslib_1.__importDefault(require("../../helpers/pagination")),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll")),
  querys_1 = require("../../helpers/querys"),
  styles = { 1: "Primary", 2: "Secondary", 3: "Success", 4: "Danger" };
exports.default = new Command_1.Command({
  name: "reaction-roles",
  description: "Quản lý hệ thống reaction roles",
  options: [
    {
      name: "add",
      description: "Thêm một vai trò (role) vào panel reaction-roles",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "category",
          description:
            "Danh mục để thêm vai trò vào, ví dụ: countries, notifications",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
        {
          name: "role",
          description: "Vai trò muốn thêm",
          type: discord_js_1.ApplicationCommandOptionType.Role,
          required: !0,
        },
        {
          name: "emoji",
          description: "Emoji đại diện cho nút bấm",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
        {
          name: "label",
          description: "Nhãn hiển thị trên nút bấm",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
        {
          name: "style",
          description: "Kiểu nút bấm (màu sắc)",
          type: discord_js_1.ApplicationCommandOptionType.String,
          choices: [
            { name: "Primary", value: "1" },
            { name: "Danger", value: "4" },
            { name: "Success", value: "3" },
            { name: "Secondary", value: "2" },
          ],
          required: !0,
        },
      ],
    },
    {
      name: "list",
      description: "Danh sách tất cả các reaction roles",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "send",
      description: "Gửi bảng điều khiển reaction roles vào kênh",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "category",
          description: "Danh mục reaction roles cần gửi",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
        {
          name: "title",
          description: "Tiêu đề của khung tin nhắn (embed)",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
        {
          name: "description",
          description: "Mô tả của khung tin nhắn (embed)",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
        {
          name: "channel",
          description: "Kênh gửi bảng điều khiển reaction roles",
          type: discord_js_1.ApplicationCommandOptionType.Channel,
          channelTypes: [discord_js_1.ChannelType.GuildText],
        },
        {
          name: "display-label",
          description: "Hiển thị nhãn tên trên nút bấm (True/False)",
          type: discord_js_1.ApplicationCommandOptionType.Boolean,
        },
      ],
    },
    {
      name: "delete",
      description: "Xóa một reaction role",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "role",
          description: "Vai trò của reaction role cần xóa",
          type: discord_js_1.ApplicationCommandOptionType.Role,
          required: !0,
        },
      ],
    },
  ],
  run: ({ interaction: e, client: o }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
      var t, i, n;
      const l = e.options.getString("category"),
        s = e.options.getSubcommand();
      if ("add" === s) {
        const t = e.options.getRole("role"),
          i = e.options.getString("emoji"),
          n = e.options.getString("label"),
          s = parseInt(e.options.getString("style")) || 1,
          d = { role: t, emoji: i, label: n, style: s, category: l },
          r = yield (0, querys_1.guilds)().get(e.guildId);
        return (
          yield r.updateOne({ $set: { rolesConfig: [...r.rolesConfig, d] } }),
          e.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("✅ Đã thêm Reaction Role thành công")
                .setColor(o.config.GeneralSettings.EmbedColor)
                .addFields({
                  name: "• Thông tin Panel:",
                  value: `>>> Vai trò: **${t.name}**\nEmoji: ${i}\nNhãn: **${n}**\nKiểu: **${styles[s]}**`,
                })
                .setTimestamp(),
            ],
          })
        );
      }
      if ("delete" === s) {
        const i = e.options.getRole("role"),
          n = yield (0, querys_1.guilds)().get(e.guildId);
        if (
          !(null === (t = null == n ? void 0 : n.rolesConfig) || void 0 === t
            ? void 0
            : t.length)
        )
          return e.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("❌ Server chưa có panel reaction role nào.")
                .setColor("Red"),
            ],
          });
        return n.rolesConfig.find((e) => e.role === i.id)
          ? (yield n.updateOne({ $pull: { rolesConfig: { role: i.id } } }),
            e.reply({
              embeds: [
                new discord_js_1.EmbedBuilder()
                  .setTitle(
                    `✅ Đã xóa vai trò ${i.name} khỏi reaction-roles`,
                  )
                  .setColor(o.config.GeneralSettings.EmbedColor),
              ],
            }))
          : e.followUp({
              embeds: [
                new discord_js_1.EmbedBuilder()
                  .setTitle("❌ Reaction role này không tồn tại")
                  .setColor("Red"),
              ],
            });
      }
      if ("list" === s) {
        const t = yield (0, querys_1.guilds)().get(e.guildId);
        if (
          !(null === (i = null == t ? void 0 : t.rolesConfig) || void 0 === i
            ? void 0
            : i.length)
        )
          return e.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("❌ Server chưa có panel reaction role nào.")
                .setColor("Red"),
            ],
          });
        const n = [];
        for (const e of t.rolesConfig)
          n.push(
            new discord_js_1.EmbedBuilder()
              .setAuthor({
                name: `Tổng số Panels: ${t.rolesConfig.length}`,
                iconURL: o.user.displayAvatarURL(),
              })
              .setColor(o.config.GeneralSettings.EmbedColor)
              .addFields({
                name: "• Thông tin Panel:",
                value: `>>> Vai trò: <@&${e.role}>\nDanh mục: **${e.category}**\nNhãn: **${e.label}**\nKiểu: **${styles[e.style]}**\nEmoji: ${e.emoji}`,
              })
              .setTimestamp()
              .setFooter({
                text: `Page ${n.length + 1} of ${t.rolesConfig.length}`,
              }),
          );
        return (0, pagination_1.default)({
          interaction: e,
          embeds: n,
          time: 6e4,
        });
      }
      if ("send" === s) {
        const t = e.options.getChannel("channel") || e.channel,
          i = e.options.getBoolean("display-label"),
          s = e.options.getString("description"),
          d = e.options.getString("title");
        yield e.deferReply({ ephemeral: !0 });
        const r = yield (0, querys_1.guilds)().get(e.guildId);
        if (
          !(null === (n = null == r ? void 0 : r.rolesConfig) || void 0 === n
            ? void 0
            : n.length)
        )
          return e.followUp({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("Máy chủ này chưa cấu hình panel reaction role nào.")
                .setColor("Red"),
            ],
          });
        const a = [];
        let p = new discord_js_1.ActionRowBuilder();
        const c = r.rolesConfig.filter((e) => e.category === l);
        for (const e of c) {
          const o = new discord_js_1.ButtonBuilder()
            .setCustomId(`rct-${e.role}`)
            .setStyle(e.style)
            .setEmoji(e.emoji);
          (i && o.setLabel(e.label),
            p.addComponents(o),
            5 === p.components.length &&
              (a.push(p), (p = new discord_js_1.ActionRowBuilder())));
        }
        p.components.length > 0 && a.push(p);
        const m = (0, replaceAll_1.default)(
          o.messages.Embeds.SelectReactionRoleEmbed,
          {
            "{panels}": c
              .map((e) =>
                (0, replaceAll_1.default)(
                  o.messages.Embeds.SelectReactionRoleEmbed.panelsFormat,
                  {
                    "{emoji}": e.emoji,
                    "{name}": e.label,
                    "{role}": `<@&${e.role}>`,
                  },
                ),
              )
              .join("\n"),
            "{title}": d,
            "{description}": s,
          },
        );
        (yield t.send({ embeds: [m], components: a }),
          yield e.followUp({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle(
                  "✅ Panel reaction roles đã được gửi tới kênh",
                )
                .setColor(o.config.GeneralSettings.EmbedColor),
            ],
          }));
      }
      } catch (error) {
        console.error("[reaction-roles] Error:", error);
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
