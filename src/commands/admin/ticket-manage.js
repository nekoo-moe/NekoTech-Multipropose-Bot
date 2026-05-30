"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  pagination_1 = tslib_1.__importDefault(require("../../helpers/pagination")),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll")),
  querys_1 = require("../../helpers/querys"),
  mongoose_1 = tslib_1.__importDefault(require("../../helpers/sqliteDb"));
exports.default = new Command_1.Command({
  name: "ticket-manage",
  description: "Quản lý các panel ticket hỗ trợ",
  options: [
    {
      name: "list",
      description: "Danh sách tất cả các panel ticket",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "send",
      description: "Gửi panel ticket tới một kênh chat",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "Kênh gửi panel ticket",
          type: discord_js_1.ApplicationCommandOptionType.Channel,
          channelTypes: [discord_js_1.ChannelType.GuildText],
          required: !1,
        },
      ],
    },
    {
      name: "delete",
      description: "Xóa một panel ticket",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "edit",
      description: "Chỉnh sửa cấu hình của một panel ticket",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
  ],
  run: ({ interaction: e, client: t }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
      var s, o, d, i, n, l;
      const r = e.options.getSubcommand();
if ("send" === r) {
        const i = e.options.getChannel("channel") || e.channel;
        yield e.deferReply({ ephemeral: !0 });
        const n = yield (0, querys_1.guilds)().get(e.guildId);
        if (
          !(null ===
            (o =
              null === (s = null == n ? void 0 : n.ticketConfig) || void 0 === s
                ? void 0
                : s.panels) || void 0 === o
            ? void 0
            : o.length)
        )
          return e.followUp({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("❌ Server chưa có panel ticket nào.")
                .setColor("Red"),
            ],
          });
        const l = [];
        if (
          "buttons" ===
          (null === (d = null == n ? void 0 : n.ticketConfig) || void 0 === d
            ? void 0
            : d.messageType)
        ) {
          let e = new discord_js_1.ActionRowBuilder();
          for (const t of n.ticketConfig.panels) {
            const s = new discord_js_1.ButtonBuilder()
              .setCustomId(`tkt-${t.customId}`)
              .setStyle(t.style)
              .setEmoji(t.emoji);
            (t.label && s.setLabel(t.name),
              e.addComponents(s),
              5 === e.components.length &&
                (l.push(e), (e = new discord_js_1.ActionRowBuilder())));
          }
          e.components.length > 0 && l.push(e);
        } else
          l.push(
            new discord_js_1.ActionRowBuilder().addComponents(
              new discord_js_1.StringSelectMenuBuilder()
                .setCustomId("tkt-menu")
                .setOptions(
                  n.ticketConfig.panels.map((e) => ({
                    label: e.name,
                    value: e.customId,
                    emoji: e.emoji,
                  })),
                ),
            ),
          );
        let r;
        let c = null;
        if (n.ticketConfig.customEmbed) {
          const custom = n.ticketConfig.customEmbed;
          c = custom.content || null;
          const embedData = custom.embeds ? custom.embeds[0] : custom;
          r = (0, replaceAll_1.default)(embedData, {
            "{panels}": n.ticketConfig.panels
              .map((e) =>
                (0, replaceAll_1.default)(
                  t.messages.Embeds.CreateTicketEmbed.panelsFormat,
                  { "{emoji}": e.emoji, "{name}": e.name },
                ),
              )
              .join("\n"),
          });
        } else {
          r = (0, replaceAll_1.default)(
            t.messages.Embeds.CreateTicketEmbed,
            {
              "{panels}": n.ticketConfig.panels
                .map((e) =>
                  (0, replaceAll_1.default)(
                    t.messages.Embeds.CreateTicketEmbed.panelsFormat,
                    { "{emoji}": e.emoji, "{name}": e.name },
                  ),
                )
                .join("\n"),
            },
          );
        }
        (yield i.send({ content: c, embeds: [r], components: l }),
          yield e.followUp({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("✅ Panel ticket đã được gửi tới kênh")
                .setColor(t.config.GeneralSettings.EmbedColor),
            ],
          }));
      }
      if ("list" === r) {
        const s = yield (0, querys_1.guilds)().get(e.guildId),
          o =
            null === (i = null == s ? void 0 : s.ticketConfig) || void 0 === i
              ? void 0
              : i.panels;
        if (!(null == o ? void 0 : o.length))
          return e.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("❌ Server chưa có panel ticket nào.")
                .setColor("Red"),
            ],
          });
        const d = [],
          n = { 1: "Primary", 2: "Secondary", 3: "Success", 4: "Danger" };
        for (const e of o)
          d.push(
            new discord_js_1.EmbedBuilder()
              .setAuthor({
                name: `Tổng số Panel Ticket: ${o.length}`,
                iconURL: t.user.displayAvatarURL(),
              })
              .setColor(t.config.GeneralSettings.EmbedColor)
              .addFields(
                {
                  name: "• Thông tin Panel:",
                  value: `>>> ID: **${e.customId}**\nTên: **${e.name}**\nEmoji: ${e.emoji}\nDanh mục: <#${e.category}>\nKiểu: **${n[e.style]}**`,
                },
                {
                  name: "• Vai trò:",
                  value: `>>> ${e.roles.map((e) => `<@&${e}>`).join("\n")}`,
                },
              )
              .setTimestamp()
              .setFooter({ text: `Page ${d.length + 1} of ${o.length}` }),
          );
        yield (0, pagination_1.default)({
          interaction: e,
          embeds: d,
          time: 6e4,
        });
      }
      if ("delete" === r) {
        const s = yield (0, querys_1.guilds)().get(e.guildId);
        if (
          !(null === (n = null == s ? void 0 : s.ticketConfig) || void 0 === n
            ? void 0
            : n.panels.length)
        )
          return e.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("❌ Server chưa có panel ticket nào.")
                .setColor("Red"),
            ],
          });
        const o = yield e.reply({
            components: [
              new discord_js_1.ActionRowBuilder().addComponents(
                new discord_js_1.StringSelectMenuBuilder()
                  .setCustomId("select-panel")
                  .addOptions(
                    s.ticketConfig.panels.map((e) => ({
                      label: e.name,
                      emoji: e.emoji,
                      value: e.customId,
                    })),
                  ),
              ),
            ],
          }),
          d = (yield o.awaitMessageComponent({
            componentType: discord_js_1.ComponentType.StringSelect,
            filter: (t) => t.user.id === e.user.id,
          })).values[0];
        yield s.updateOne({
          $pull: { "ticketConfig.panels": { customId: d } },
        });
        const i = s.ticketConfig.panels.find((e) => e.customId === d);
        return e.editReply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle(`✅ Đã xóa panel '${i.name}' thành công`)
              .setColor(t.config.GeneralSettings.EmbedColor),
          ],
        });
      }
      if ("edit" === r) {
        const s = yield (0, querys_1.guilds)().get(e.guildId);
        if (
          !(null === (l = null == s ? void 0 : s.ticketConfig) || void 0 === l
            ? void 0
            : l.panels.length)
        )
          return e.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("Máy chủ này chưa cấu hình panel ticket nào.")
                .setColor("Red"),
            ],
          });
        const o = yield e.reply({
            components: [
              new discord_js_1.ActionRowBuilder().addComponents(
                new discord_js_1.StringSelectMenuBuilder()
                  .setCustomId("select-panel")
                  .addOptions(
                    s.ticketConfig.panels.map((e) => ({
                      label: e.name,
                      emoji: e.emoji,
                      value: e.customId,
                    })),
                  ),
              ),
            ],
          }),
          d = yield o.awaitMessageComponent({
            componentType: discord_js_1.ComponentType.StringSelect,
            filter: (t) => t.user.id === e.user.id,
          }),
          i = d.values[0],
          n = s.ticketConfig.panels.find((e) => e.customId === i),
          r = (e = !1, s) => {
            var o;
            return {
              embeds: [
                new discord_js_1.EmbedBuilder()
                  .setTitle(s || "Chọn thuộc tính bạn muốn chỉnh sửa")
                  .setColor(t.config.GeneralSettings.EmbedColor),
              ],
              components: [
                new discord_js_1.ActionRowBuilder().setComponents(
                  new discord_js_1.ButtonBuilder()
                    .setCustomId("name")
                    .setStyle(discord_js_1.ButtonStyle.Secondary)
                    .setDisabled(e)
                    .setLabel("Tên")
                    .setEmoji("✏"),
                  new discord_js_1.ButtonBuilder()
                    .setCustomId("emoji")
                    .setStyle(discord_js_1.ButtonStyle.Secondary)
                    .setDisabled(e)
                    .setLabel("Emoji")
                    .setEmoji(n.emoji || "🥭"),
                  new discord_js_1.ButtonBuilder()
                    .setCustomId("category")
                    .setStyle(discord_js_1.ButtonStyle.Secondary)
                    .setDisabled(e)
                    .setLabel("Danh mục")
                    .setEmoji("🏷️"),
                  new discord_js_1.ButtonBuilder()
                    .setCustomId("style")
                    .setStyle(discord_js_1.ButtonStyle.Secondary)
                    .setDisabled(e)
                    .setLabel("Kiểu")
                    .setEmoji("🎨"),
                  new discord_js_1.ButtonBuilder()
                    .setCustomId("roles")
                    .setStyle(discord_js_1.ButtonStyle.Secondary)
                    .setDisabled(e)
                    .setLabel("Vai trò")
                    .setEmoji("🎭"),
                ),
                new discord_js_1.ActionRowBuilder().setComponents(
                  new discord_js_1.ButtonBuilder()
                    .setCustomId("questions")
                    .setStyle(discord_js_1.ButtonStyle.Secondary)
                    .setDisabled(
                      (null === (o = null == n ? void 0 : n.questions) ||
                      void 0 === o
                        ? void 0
                        : o.length) < 0 || e,
                    )
                    .setLabel("Câu hỏi")
                    .setEmoji("📝"),
                ),
              ],
            };
          };
        (yield d.deferUpdate(), yield e.editReply(r()));
        const a = o.createMessageComponentCollector({
          filter: (t) => t.user.id === e.user.id,
          componentType: discord_js_1.ComponentType.Button,
          time: 12e4,
        });
        a.on("collect", (o) =>
          tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            let d = null;
            if (!o.customId.startsWith("ex")) {
              if ("name" === o.customId || "emoji" === o.customId) {
                yield o.showModal(
                  new discord_js_1.ModalBuilder()
                    .setTitle(`Sửa ${n.name}`)
                    .setCustomId(`edit-${n.customId}`)
                    .addComponents(
                      new discord_js_1.ActionRowBuilder().addComponents(
                        new discord_js_1.TextInputBuilder()
                          .setPlaceholder(
                            `Nhập ${o.customId} mới cho panel`,
                          )
                          .setLabel(o.customId.toUpperCase())
                          .setStyle(discord_js_1.TextInputStyle.Short)
                          .setValue(n[o.customId])
                          .setCustomId(o.customId)
                          .setRequired(!0),
                      ),
                    ),
                );
                const t = yield o.awaitModalSubmit({
                  filter: (t) =>
                    t.user.id === e.user.id &&
                    t.customId === `edit-${n.customId}`,
                  time: 12e4,
                });
                (yield t.deferUpdate(),
                  (d = t.fields.getTextInputValue(o.customId)));
              } else yield o.deferUpdate();
              if ("category" === o.customId) {
                const s = yield o.editReply({
                    embeds: [
                      new discord_js_1.EmbedBuilder()
                        .setTitle("Chọn danh mục mới cho panel")
                        .setColor(t.config.GeneralSettings.EmbedColor),
                    ],
                    components: [
                      new discord_js_1.ActionRowBuilder().addComponents(
                        new discord_js_1.ChannelSelectMenuBuilder()
                          .setChannelTypes(
                            discord_js_1.ChannelType.GuildCategory,
                          )
                          .setCustomId("select-category")
                          .setMaxValues(1),
                      ),
                    ],
                  }),
                  i = yield s.awaitMessageComponent({
                    filter: (t) => t.user.id === e.user.id,
                    componentType: discord_js_1.ComponentType.ChannelSelect,
                    time: 12e4,
                  });
                (yield i.deferUpdate(), (d = i.values[0]));
              }
              if ("roles" === o.customId) {
                const s = yield o.editReply({
                    embeds: [
                      new discord_js_1.EmbedBuilder()
                        .setTitle("Chọn vai trò mới cho panel")
                        .setColor(t.config.GeneralSettings.EmbedColor),
                    ],
                    components: [
                      new discord_js_1.ActionRowBuilder().addComponents(
                        new discord_js_1.RoleSelectMenuBuilder()
                          .setCustomId("select-roles")
                          .setMaxValues(1),
                      ),
                    ],
                  }),
                  i = yield s.awaitMessageComponent({
                    filter: (t) => t.user.id === e.user.id,
                    componentType: discord_js_1.ComponentType.RoleSelect,
                    time: 12e4,
                  });
                (yield i.deferUpdate(), (d = i.values[0]));
              }
              if ("style" === o.customId) {
                const s = yield o.editReply({
                    embeds: [
                      new discord_js_1.EmbedBuilder()
                        .setTitle("Chọn kiểu màu mới cho nút ticket")
                        .setColor(t.config.GeneralSettings.EmbedColor),
                    ],
                    components: [
                      new discord_js_1.ActionRowBuilder().addComponents(
                        new discord_js_1.ButtonBuilder()
                          .setCustomId("ex-1")
                          .setStyle(discord_js_1.ButtonStyle.Primary)
                          .setLabel("Primary"),
                        new discord_js_1.ButtonBuilder()
                          .setCustomId("ex-2")
                          .setStyle(discord_js_1.ButtonStyle.Secondary)
                          .setLabel("Secondary"),
                        new discord_js_1.ButtonBuilder()
                          .setCustomId("ex-3")
                          .setStyle(discord_js_1.ButtonStyle.Success)
                          .setLabel("Success"),
                        new discord_js_1.ButtonBuilder()
                          .setCustomId("ex-4")
                          .setStyle(discord_js_1.ButtonStyle.Danger)
                          .setLabel("Danger"),
                      ),
                    ],
                  }),
                  i = yield s.awaitMessageComponent({
                    filter: (t) => t.user.id === e.user.id,
                    componentType: discord_js_1.ComponentType.Button,
                    time: 24e4,
                  });
                (yield i.deferUpdate(),
                  (d = parseInt(i.customId.replace("ex-", ""))));
              }
              if ("questions" === o.customId) {
                const i = yield o.editReply({
                    embeds: [
                      new discord_js_1.EmbedBuilder()
                        .setTitle("Chọn câu hỏi ticket bạn muốn chỉnh sửa")
                        .setColor(t.config.GeneralSettings.EmbedColor),
                    ],
                    components: [
                      new discord_js_1.ActionRowBuilder().addComponents(
                        new discord_js_1.StringSelectMenuBuilder()
                          .setCustomId("select-question")
                          .setMaxValues(1)
                          .addOptions(
                            n.questions.map((e) => ({
                              label: e.name,
                              value: e.name,
                            })),
                          ),
                      ),
                    ],
                  }),
                  l = yield i.awaitMessageComponent({
                    filter: (t) => t.user.id === e.user.id,
                    componentType: discord_js_1.ComponentType.StringSelect,
                    time: 12e4,
                  });
                yield l.deferUpdate();
                const u = n.questions.find((e) => e.name === l.values[0]);
                yield l.editReply({
                  embeds: [
                    new discord_js_1.EmbedBuilder()
                      .setTitle("Chọn thuộc tính câu hỏi muốn chỉnh sửa")
                      .setColor(t.config.GeneralSettings.EmbedColor),
                  ],
                  components: [
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.ButtonBuilder()
                        .setCustomId("ex-name")
                        .setStyle(discord_js_1.ButtonStyle.Secondary)
                        .setLabel("Tên")
                        .setEmoji("✏️"),
                      new discord_js_1.ButtonBuilder()
                        .setCustomId("ex-type")
                        .setStyle(discord_js_1.ButtonStyle.Secondary)
                        .setLabel("Loại")
                        .setEmoji("📝"),
                      new discord_js_1.ButtonBuilder()
                        .setCustomId("ex-required")
                        .setStyle(discord_js_1.ButtonStyle.Secondary)
                        .setLabel("Bắt buộc")
                        .setEmoji("✅"),
                      new discord_js_1.ButtonBuilder()
                        .setCustomId("ex-description")
                        .setStyle(discord_js_1.ButtonStyle.Secondary)
                        .setLabel("Mô tả")
                        .setEmoji("📝"),
                      new discord_js_1.ButtonBuilder()
                        .setCustomId("ex-back")
                        .setStyle(discord_js_1.ButtonStyle.Secondary)
                        .setLabel("Quay lại")
                        .setEmoji("🔙"),
                    ),
                  ],
                });
                const c = yield i.awaitMessageComponent({
                  filter: (t) => t.user.id === e.user.id,
                  componentType: discord_js_1.ComponentType.Button,
                  time: 12e4,
                });
                if (
                  ((c.customId = c.customId.replace("ex-", "")),
                  "back" === c.customId)
                )
                  return (o.editReply(r()), a.resetTimer());
                if (["name", "type", "description"].includes(c.customId)) {
                  yield c.showModal(
                    new discord_js_1.ModalBuilder()
                      .setCustomId(`question-${u.name}`)
                      .setTitle(`Sửa câu hỏi ${u.name}`)
                      .addComponents(
                        new discord_js_1.ActionRowBuilder().addComponents(
                          new discord_js_1.TextInputBuilder()
                            .setPlaceholder(
                              `Nhập ${c.customId} mới cho câu hỏi`,
                            )
                            .setLabel(c.customId.toUpperCase())
                            .setValue(u[c.customId])
                            .setStyle(discord_js_1.TextInputStyle.Short)
                            .setCustomId("name")
                            .setRequired(!0),
                        ),
                      ),
                  );
                  const t = yield c.awaitModalSubmit({
                    filter: (t) =>
                      t.user.id === e.user.id &&
                      t.customId === `question-${u.name}`,
                    time: 12e4,
                  });
                  ((d = t.fields.getTextInputValue(c.customId)),
                    "type" === c.customId && (d = parseInt(d)),
                    yield t.deferUpdate());
                } else yield c.deferUpdate();
                if ("required" === c.customId) {
                  yield o.editReply({
                    components: [
                      new discord_js_1.ActionRowBuilder().addComponents(
                        new discord_js_1.ButtonBuilder()
                          .setCustomId("true")
                          .setStyle(discord_js_1.ButtonStyle.Success)
                          .setLabel("Có")
                          .setEmoji("✅"),
                        new discord_js_1.ButtonBuilder()
                          .setCustomId("false")
                          .setStyle(discord_js_1.ButtonStyle.Danger)
                          .setLabel("Không")
                          .setEmoji("❌"),
                      ),
                    ],
                  });
                  d =
                    "true" ===
                    (yield i.awaitMessageComponent({
                      filter: (t) => t.user.id === e.user.id,
                      componentType: discord_js_1.ComponentType.Button,
                      time: 12e4,
                    })).customId;
                }
                return (
                  (u[c.customId] = d),
                  yield s.save(),
                  o.editReply(r(!1, "Câu hỏi đã được cập nhật thành công")),
                  a.resetTimer()
                );
              }
              ((n[o.customId] = d),
                yield s.save(),
                yield e.editReply(r(!1, "Panel ticket đã được cập nhật thành công")));
            }
          }),
        );
      }
      } catch (error) {
        console.error("[ticket-manage] Error:", error);
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
