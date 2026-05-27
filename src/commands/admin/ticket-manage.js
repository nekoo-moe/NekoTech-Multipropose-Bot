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
      name: "setup",
      description: "Thiết lập một panel ticket mới",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
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
      var s, o, d, i, n, l;
      const r = e.options.getSubcommand();
      if ("setup" === r) {
        const s = {
            customId: new mongoose_1.default.Types.ObjectId().toString(),
            name: null,
            emoji: null,
            category: null,
            roles: [],
            style: 1,
            label: true,
            questions: [],
          },
          o = yield (0, querys_1.guilds)().get(e.guildId),
          d = (e = !1) => {
            const {
                name: t,
                emoji: o,
                category: d,
                roles: i,
                style: n,
                label: l,
                questions: r,
              } = s,
              a = [
                new discord_js_1.ActionRowBuilder().addComponents(
                  new discord_js_1.ButtonBuilder()
                    .setStyle(
                      t
                        ? discord_js_1.ButtonStyle.Primary
                        : discord_js_1.ButtonStyle.Secondary,
                    )
                    .setDisabled(e)
                    .setCustomId("name")
                    .setLabel("Tên")
                    .setEmoji("👤"),
                  new discord_js_1.ButtonBuilder()
                    .setStyle(
                      o
                        ? discord_js_1.ButtonStyle.Primary
                        : discord_js_1.ButtonStyle.Secondary,
                    )
                    .setDisabled(e)
                    .setCustomId("emoji")
                    .setLabel("Emoji")
                    .setEmoji("🥭"),
                  new discord_js_1.ButtonBuilder()
                    .setStyle(
                      d
                        ? discord_js_1.ButtonStyle.Primary
                        : discord_js_1.ButtonStyle.Secondary,
                    )
                    .setDisabled(e)
                    .setCustomId("category")
                    .setLabel("Danh mục")
                    .setEmoji("🎹"),
                  new discord_js_1.ButtonBuilder()
                    .setStyle(
                      n
                        ? discord_js_1.ButtonStyle.Primary
                        : discord_js_1.ButtonStyle.Secondary,
                    )
                    .setDisabled(e)
                    .setCustomId("style")
                    .setLabel("Kiểu")
                    .setEmoji("💅"),
                  new discord_js_1.ButtonBuilder()
                    .setStyle(
                      i.length
                        ? discord_js_1.ButtonStyle.Primary
                        : discord_js_1.ButtonStyle.Secondary,
                    )
                    .setDisabled(e)
                    .setCustomId("roles")
                    .setLabel("Vai trò")
                    .setEmoji("🕵️"),
                ),
                new discord_js_1.ActionRowBuilder().addComponents(
                  new discord_js_1.ButtonBuilder()
                    .setStyle(
                      null !== l
                        ? discord_js_1.ButtonStyle.Primary
                        : discord_js_1.ButtonStyle.Secondary,
                    )
                    .setEmoji("🪐")
                    .setCustomId("label")
                    .setDisabled(e)
                    .setLabel("Hiển thị tên"),
                  new discord_js_1.ButtonBuilder()
                    .setStyle(
                      r.length
                        ? discord_js_1.ButtonStyle.Primary
                        : discord_js_1.ButtonStyle.Secondary,
                    )
                    .setLabel(
                      r.length ? `Câu hỏi (${r.length})` : "Câu hỏi",
                    )
                    .setEmoji("⁉️")
                    .setCustomId("questions")
                    .setDisabled(e),
                ),
              ];
            return (
              t &&
                o &&
                d &&
                n &&
                i.length &&
                null !== l &&
                a[1].addComponents(
                  new discord_js_1.ButtonBuilder()
                    .setStyle(discord_js_1.ButtonStyle.Success)
                    .setCustomId("finish")
                    .setDisabled(e)
                    .setEmoji("✔️")
                    .setLabel("Lưu Panel"),
                ),
              a
            );
          },
          i = (e = !0) => ({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("⚙️ Thiết Lập Panel Ticket")
                .setDescription(
                  "Nhấn nút tương ứng với thuộc tính bạn muốn chỉnh sửa.",
                )
                .setColor(t.config.GeneralSettings.EmbedColor),
            ],
            components: d(),
            fetchReply: e,
          }),
          n = (e = !1) => [
            new discord_js_1.ActionRowBuilder().addComponents(
              new discord_js_1.ButtonBuilder()
                .setCustomId("modal-add")
                .setStyle(discord_js_1.ButtonStyle.Success)
                .setDisabled(s.questions.length >= 25 || e)
                .setEmoji("🧩")
                .setLabel("Thêm"),
              new discord_js_1.ButtonBuilder()
                .setCustomId("modal-remove")
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setDisabled(s.questions.length <= 0 || e)
                .setEmoji("🗑️")
                .setLabel("Xóa"),
              new discord_js_1.ButtonBuilder()
                .setCustomId("modal-list")
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setDisabled(s.questions.length <= 0 || e)
                .setEmoji("🖼️")
                .setLabel("Danh sách"),
              new discord_js_1.ButtonBuilder()
                .setCustomId("modal-back")
                .setStyle(discord_js_1.ButtonStyle.Secondary)
                .setDisabled(e)
                .setEmoji("⬅️")
                .setLabel("Back"),
            ),
          ],
          l = (yield e.reply(i(!0))).createMessageComponentCollector({
            filter: (t) => t.user.id === e.user.id,
            componentType: discord_js_1.ComponentType.Button,
          });
        (l.on("collect", (r) =>
          tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const { customId: a } = r;
            if ((l.resetTimer(), a.startsWith("ml"))) return;
            if ("modal-add" === a) {
              const o = Date.now();
              yield r.showModal(
                new discord_js_1.ModalBuilder()
                  .setCustomId(`add-${o}`)
                  .setTitle("Tạo Câu Hỏi Ticket")
                  .setComponents(
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.TextInputBuilder()
                        .setStyle(discord_js_1.TextInputStyle.Short)
                        .setCustomId("modal-name")
                        .setPlaceholder("Nhập tên câu hỏi")
                        .setLabel("✍ Tên câu hỏi")
                        .setRequired(!0)
                        .setMaxLength(44)
                        .setMinLength(0),
                    ),
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.TextInputBuilder()
                        .setStyle(discord_js_1.TextInputStyle.Short)
                        .setCustomId("modal-type")
                        .setPlaceholder('Nhập "Short" hoặc "Paragraph"')
                        .setLabel("📌 Loại (Short/Paragraph)")
                        .setRequired(!0)
                        .setMaxLength(9)
                        .setMinLength(5),
                    ),
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.TextInputBuilder()
                        .setStyle(discord_js_1.TextInputStyle.Short)
                        .setCustomId("modal-required")
                        .setPlaceholder('Nhập "Yes" hoặc "No"')
                        .setLabel("🎯 Bắt buộc (Yes/No)")
                        .setRequired(!0)
                        .setMaxLength(3)
                        .setMinLength(2),
                    ),
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.TextInputBuilder()
                        .setStyle(discord_js_1.TextInputStyle.Short)
                        .setCustomId("modal-description")
                        .setPlaceholder("Tùy chọn (*)")
                        .setLabel("📃 Mô tả")
                        .setRequired(!1)
                        .setMaxLength(100),
                    ),
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.TextInputBuilder()
                        .setStyle(discord_js_1.TextInputStyle.Short)
                        .setCustomId("modal-regex")
                        .setPlaceholder("Tùy chọn (*)")
                        .setLabel("👮‍♂️ Regex")
                        .setRequired(!1),
                    ),
                  ),
              );
              const d = yield e.awaitModalSubmit({
                filter: (t) =>
                  t.user.id === e.user.id && t.customId === `add-${o}`,
                time: 3e5,
              });
              if (!d) return;
              const i = d.fields
                  .getTextInputValue("modal-required")
                  .toLowerCase(),
                l = d.fields.getTextInputValue("modal-type").toLowerCase(),
                a = d.fields.getTextInputValue("modal-description"),
                u = d.fields.getTextInputValue("modal-name"),
                c = {
                  name: u,
                  regex: null,
                  description: a,
                  type:
                    "paragraph" === l
                      ? discord_js_1.TextInputStyle.Paragraph
                      : discord_js_1.TextInputStyle.Short,
                  required: "yes" === i,
                };
              try {
                c.regex = new RegExp(d.fields.getTextInputValue("modal-regex"));
              } catch (e) {
                c.regex = null;
              }
              return (
                s.questions.push(c),
                yield d.reply({
                  content: `✅ Câu hỏi **${u}** đã được thêm thành công.`,
                  ephemeral: !0,
                }),
                void (yield e.editReply({
                  embeds: [
                    new discord_js_1.EmbedBuilder(r.message.embeds[0])
                      .setColor(t.config.GeneralSettings.EmbedColor)
                      .setTitle("⚙️ Chọn tuỳ chọn câu hỏi")
                      .setDescription(
                        "Dùng các nút bên dưới để thêm hoặc xóa câu hỏi.",
                      ),
                  ],
                  components: n(),
                }))
              );
            }
            if ((yield r.deferUpdate(), "finish" === a))
              return (
                yield o.updateOne({ $push: { "ticketConfig.panels": s } }),
                l.stop()
              );
            if ("modal-back" === a) return void e.editReply(i());
            if ("modal-list" === a)
              return void (yield e.editReply({
                embeds: [
                  new discord_js_1.EmbedBuilder()
                    .setTitle("🖼️ Danh sách Câu Hỏi Ticket")
                    .setColor(t.config.GeneralSettings.EmbedColor)
                    .setDescription(
                      s.questions
                        .map(
                          (e) =>
                            `**${e.name}** • ${e.description} • **${e.required ? "Bắt buộc" : "Không bắt buộc"}** • ${1 === e.type ? "Ngắn (Short)" : "Dài (Paragraph)"}`,
                        )
                        .join("\n"),
                    ),
                ],
                components: [
                  new discord_js_1.ActionRowBuilder().addComponents(
                    new discord_js_1.ButtonBuilder()
                      .setCustomId("back")
                      .setStyle(discord_js_1.ButtonStyle.Secondary)
                      .setLabel("Quay lại")
                      .setEmoji("⬅️"),
                  ),
                ],
              }));
            if ("modal-remove" === a) {
              yield e.editReply({
                embeds: [
                  i()
                    .embeds[0].setTitle("❔ Tên câu hỏi muốn xóa?")
                    .setDescription(
                      "Nhập tên của câu hỏi bạn muốn xóa.",
                    ),
                ],
                components: n(!0),
              });
              const o = yield e.channel.awaitMessages({
                filter: (t) => t.author.id === e.user.id,
                max: 1,
              });
              yield o.first().delete().catch();
              const d = s.questions.find(
                (e) => e.name.toLowerCase() === o.first().content.toLowerCase(),
              );
              return (
                d
                  ? s.questions.splice(
                      s.questions.findIndex((e) => e.name === d.name),
                      1,
                    )
                  : yield r.followUp({
                      content: `⛔ Không tìm thấy câu hỏi **${o.first().content}** trong panel ticket này`,
                      ephemeral: !0,
                    }),
                void (yield e.editReply({
                  embeds: [
                    new discord_js_1.EmbedBuilder(r.message.embeds[0])
                      .setColor(t.config.GeneralSettings.EmbedColor)
                      .setTitle("⚙️ Chọn tuỳ chọn câu hỏi")
                      .setDescription(
                        "Dùng các nút bên dưới để thêm hoặc xóa câu hỏi.",
                      ),
                  ],
                  components: n(),
                }))
              );
            }
            if ("questions" === a || "back" === a)
              return void (yield e.editReply({
                embeds: [
                  new discord_js_1.EmbedBuilder(r.message.embeds[0])
                    .setColor(t.config.GeneralSettings.EmbedColor)
                    .setTitle("Chọn tùy chọn cấu hình câu hỏi")
                    .setDescription(
                      "Sử dụng các nút bên dưới để thêm hoặc xóa câu hỏi trong bảng câu hỏi.",
                    ),
                ],
                components: n(),
              }));
            if (["1", "2", "3", "4"].find((e) => e === a))
              return ((s.style = parseInt(a)), void r.editReply(i()));
            if (["yes", "no"].find((e) => e === a))
              return ((s.label = "yes" === a), void r.editReply(i()));
            if ("style" === a)
              return void (yield r.editReply({
                embeds: [
                  new discord_js_1.EmbedBuilder(r.message.embeds[0])
                    .setColor(t.config.GeneralSettings.EmbedColor)
                    .setTitle("⚙️ Chọn màu nút bấm")
                    .setDescription(
                      "Chọn màu cho nút ticket (4 lựa chọn).",
                    ),
                ],
                components: [
                  new discord_js_1.ActionRowBuilder().addComponents(
                    new discord_js_1.ButtonBuilder()
                      .setCustomId("1")
                      .setStyle(discord_js_1.ButtonStyle.Primary)
                      .setLabel("Primary"),
                    new discord_js_1.ButtonBuilder()
                      .setCustomId("2")
                      .setStyle(discord_js_1.ButtonStyle.Secondary)
                      .setLabel("Secondary"),
                    new discord_js_1.ButtonBuilder()
                      .setCustomId("3")
                      .setStyle(discord_js_1.ButtonStyle.Success)
                      .setLabel("Success"),
                    new discord_js_1.ButtonBuilder()
                      .setCustomId("4")
                      .setStyle(discord_js_1.ButtonStyle.Danger)
                      .setLabel("Danger"),
                  ),
                ],
              }));
            if ("label" === a)
              return void (yield r.editReply({
                embeds: [
                  new discord_js_1.EmbedBuilder(r.message.embeds[0])
                    .setColor(t.config.GeneralSettings.EmbedColor)
                    .setTitle("🎯 Hiển thị tên trên nút ticket")
                    .setDescription(
                      "Chọn **Có** để hiển thị tên panel trên nút tạo ticket.",
                    ),
                ],
                components: [
                  new discord_js_1.ActionRowBuilder().addComponents(
                    new discord_js_1.ButtonBuilder()
                      .setCustomId("yes")
                      .setStyle(discord_js_1.ButtonStyle.Success)
                      .setLabel("✅ Có"),
                    new discord_js_1.ButtonBuilder()
                      .setCustomId("no")
                      .setStyle(discord_js_1.ButtonStyle.Danger)
                      .setLabel("❌ Không"),
                  ),
                ],
              }));
            let u = null;
            if ("roles" === a) {
              const t = yield r.editReply({
                  embeds: [
                    i()
                      .embeds[0].setDescription(
                        "Bạn phải chọn tất cả vai trò có thể nhìn thấy ticket này khi được tạo",
                      )
                      .setColor("Red"),
                  ],
                  components: [
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.RoleSelectMenuBuilder()
                        .setCustomId("ml-select-roles")
                        .setMinValues(1)
                        .setMaxValues(10),
                    ),
                  ],
                }),
                s = yield t.awaitMessageComponent({
                  componentType: discord_js_1.ComponentType.RoleSelect,
                  filter: (t) => t.user.id === e.user.id,
                });
              (yield s.deferUpdate(), (u = s.values));
            }
            if ("category" === a) {
              const t = yield r.editReply({
                  embeds: [
                    i()
                      .embeds[0].setDescription(
                        "Bạn phải chọn danh mục nơi các ticket sẽ được tạo ra",
                      )
                      .setColor("Red"),
                  ],
                  components: [
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.ChannelSelectMenuBuilder()
                        .setCustomId("ml-select-category")
                        .setChannelTypes(discord_js_1.ChannelType.GuildCategory)
                        .setMaxValues(1),
                    ),
                  ],
                }),
                s = yield t.awaitMessageComponent({
                  componentType: discord_js_1.ComponentType.ChannelSelect,
                  filter: (t) => t.user.id === e.user.id,
                });
              (yield s.deferUpdate(), (u = s.values[0]));
            }
            if (u) return ((s[a] = u), void e.editReply(i()));
            yield r.editReply({ components: d(!0) });
            const c = yield e.channel.awaitMessages({
                filter: (t) => t.author.id === e.user.id,
                max: 1,
              }),
              m = c.first().content;
            if ((yield c.first().delete().catch(), "category" === a)) {
              const t = e.guild.channels.cache.get(m);
              if (
                ((u = null == t ? void 0 : t.id),
                !t || t.type !== discord_js_1.ChannelType.GuildCategory)
              )
                return void e.editReply({
                  embeds: [
                    i()
                      .embeds[0].setDescription(
                        "Bạn phải gửi ID của danh mục nơi tạo ticket",
                      )
                      .setColor("Red"),
                  ],
                  components: d(),
                });
            }
            "emoji" !== a ||
            /<:[^:\s]+:\d+>|<a:[^:\s]+:\d+>|(©|®|[ -㌀]|[퀀-]|[퀀-]|[퀀-]|️)/g.test(
              m,
            )
              ? (null === u && (u = m), (s[a] = u), r.editReply(i()))
              : r.editReply({
                  embeds: [
                    i()
                      .embeds[0].setDescription(
                        `Bạn phải gửi một biểu tượng cảm xúc Discord hoặc emoji, **${m}** không phải là emoji hợp lệ.`,
                      )
                      .setColor("Red"),
                  ],
                  components: d(),
                });
          }),
        ),
          l.on("end", (o, n) => {
            "time" !== n
              ? e.editReply({
                  embeds: [
                    new discord_js_1.EmbedBuilder()
                      .setTitle(`✅ Panel ticket '${s.name}' đã được tạo.`)
                      .setColor(t.config.GeneralSettings.EmbedColor),
                  ],
                  components: d(!0),
                })
              : e.editReply({
                  embeds: [
                    i()
                      .embeds[0].setTitle("Đã hết thời gian chờ")
                      .setDescription(
                        "Đã quá thời gian chờ (5 phút). Vui lòng gõ lại lệnh.",
                      )
                      .setColor("Red"),
                  ],
                  components: d(!0),
                });
          }));
      }
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
    }),
});
