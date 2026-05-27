"use strict";
(Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.CategoryTypes = exports.Dashboard = void 0));
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  __1 = require("..");
var CategoryTypes;
(!(function (e) {
  ((e[(e.String = 0)] = "String"),
    (e[(e.Number = 1)] = "Number"),
    (e[(e.Channel = 2)] = "Channel"),
    (e[(e.Role = 3)] = "Role"),
    (e[(e.Roles = 4)] = "Roles"),
    (e[(e.Boolean = 5)] = "Boolean"),
    (e[(e.WebsiteEmbed = 6)] = "WebsiteEmbed"),
    (e[(e.Questions = 7)] = "Questions"));
})(CategoryTypes || (CategoryTypes = {})),
  (exports.CategoryTypes = CategoryTypes));
class Dashboard {
  constructor(e) {
    ((this.client = e.client),
      (this.options = []),
      (this.cache = { categoryOptions: {}, startEmbed: null }));
  }
  addOptions(e) {
    return ((this.options = this.options.concat(e)), this);
  }
  setup(e) {
    var t, s;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
      this.cache.startEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`🏠 Menu Cấu Hình ${this.client.user.username}`)
        .setDescription(
          `Chào mừng bạn đến với menu Cài đặt của **${this.client.user.username}**!\n\t\t\t\tHãy sử dụng menu lựa chọn bên dưới để tìm và định cấu hình các thiết lập của ${this.client.user.username}.`,
        )
        .setColor(this.client.config.GeneralSettings.EmbedColor)
        .addFields(
          this.options.map((e) => ({
            name: `${(null == e ? void 0 : e.emoji) || ""} ${e.name}`,
            value: `>>> ${e.description}`,
            inline: this.options.length >= 6,
          })),
        );
      try {
        for (
          var o, i = tslib_1.__asyncValues(this.options);
          !(o = yield i.next()).done;
        ) {
          const e = o.value,
            t = [];
          let s = new discord_js_1.ActionRowBuilder();
          const i = e.settings.map((t) =>
            new discord_js_1.ButtonBuilder()
              .setCustomId(`${e.name}_${t.name}`)
              .setStyle(t.style)
              .setEmoji(t.emoji || "🔎")
              .setLabel(t.name),
          );
          for (const e of i)
            (5 === s.components.length &&
              (t.push(s), (s = new discord_js_1.ActionRowBuilder())),
              s.addComponents(e));
          (s.components.length > 0 && t.push(s),
            (this.cache.categoryOptions[e.name] = {
              embed: () =>
                new discord_js_1.EmbedBuilder()
                  .setTitle(`${e.emoji || ""} ${e.name}`)
                  .setDescription(
                    e.description || "Danh mục này chưa có mô tả",
                  )
                  .setColor(__1.client.config.GeneralSettings.EmbedColor)
                  .addFields(
                    e.settings.map((e) => ({
                      name: `${(null == e ? void 0 : e.emoji) || ""} ${e.name}`,
                      value: `>>> ${e.description}`,
                    })),
                  ),
              buttons: (e = !1) =>
                t.map((t) => {
                  const s = t.components.map((t) => (t.setDisabled(e), t));
                  return t.setComponents(s);
                }),
              settings: e.settings,
            }));
        }
      } catch (e) {
        t = { error: e };
      } finally {
        try {
          o && !o.done && (s = i.return) && (yield s.call(i));
        } finally {
          if (t) throw t.error;
        }
      }
      const n = (e = !1) =>
          new discord_js_1.ActionRowBuilder().addComponents(
            new discord_js_1.StringSelectMenuBuilder()
              .setCustomId("category_select")
              .setPlaceholder("🔎 Chọn một danh mục để cấu hình")
              .setDisabled(e)
              .addOptions(
                this.options.map((e) => ({
                  label: e.name,
                  description: e.description.slice(0, 22) + "...",
                  value: e.name,
                  emoji: e.emoji || "❔",
                })),
              ),
          ),
        d = (yield e.reply({
          embeds: [this.cache.startEmbed],
          components: [n()],
          fetchReply: !0,
        })).createMessageComponentCollector({
          filter: (t) => t.user.id === e.user.id,
          time: 12e4,
        });
      d.on("collect", (t) =>
        tslib_1.__awaiter(this, void 0, void 0, function* () {
          var s, o;
          if ((d.resetTimer(), t.isStringSelectMenu())) {
            if ((yield t.deferUpdate(), "category_select" === t.customId)) {
              const e = this.cache.categoryOptions[t.values[0]],
                s = e.settings.filter((e) => e.fetch),
                o = [...e.buttons(), n()];
              return (
                s.length > 0 &&
                  o.push(
                    ((e, t, s = !1) =>
                      new discord_js_1.ActionRowBuilder().addComponents(
                        new discord_js_1.StringSelectMenuBuilder()
                          .setCustomId("category_select_preview")
                          .setPlaceholder("🔎 Chọn một tùy chọn để xem trước")
                          .setDisabled(s)
                          .addOptions(
                            e.map((e) => ({
                              label: e.name,
                              value: `${t}|>${e.name}`,
                              emoji: e.emoji,
                            })),
                          ),
                      ))(s, t.values[0]),
                  ),
                void (yield t.editReply({ embeds: [e.embed()], components: o }))
              );
            }
            if ("category_select_preview" === t.customId) {
              const [e, s] = t.values[0].split("|>"),
                o = this.cache.categoryOptions[e].settings.find(
                  (e) => e.name === s,
                );
              if (o.type === CategoryTypes.WebsiteEmbed) {
                const { data: e, attachments: s } = yield o.fetch();
                yield t.followUp(
                  Object.assign(Object.assign({}, e), {
                    files: s,
                    ephemeral: !0,
                  }),
                );
              } else
                yield t.editReply({
                  embeds: [this.cache.startEmbed],
                  components: [n()],
                });
              return;
            }
          }
          if (!t.isButton()) return;
          if (t.customId.startsWith("ex")) return;
          const [i, l] = t.customId.split("_"),
            r = this.cache.categoryOptions[i],
            a = null == r ? void 0 : r.settings.find((e) => e.name === l),
            c = (s) =>
              tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                  (yield a.save(s),
                    yield t.editReply({
                      embeds: [
                        r
                          .embed()
                          .setDescription(
                            `Giá trị **${a.name}** đã được cập nhật chính xác.`,
                          )
                          .setColor("Green"),
                      ],
                      components: [...r.buttons(), n()],
                    }));
                } catch (err) {
                  console.error("Dashboard update error:", err);
                  e.editReply({
                    embeds: [
                      r
                        .embed()
                        .setDescription(
                          `Không thể cập nhật giá trị ${a.name} một cách chính xác`,
                        )
                        .setColor("Red"),
                    ],
                  });
                }
              });
          let u = null;
          if ((yield t.deferUpdate(), a.type === CategoryTypes.Boolean)) {
            yield e.editReply({
              embeds: [
                r
                  .embed()
                  .setDescription(
                    "Sử dụng các nút bên dưới để chuyển đổi trạng thái Bật hoặc Tắt",
                  )
                  .setColor(__1.client.config.GeneralSettings.EmbedColor),
              ],
              components: [
                new discord_js_1.ActionRowBuilder().addComponents(
                  new discord_js_1.ButtonBuilder()
                    .setStyle(discord_js_1.ButtonStyle.Success)
                    .setCustomId("ex-yes")
                    .setLabel("Bật (Có)")
                    .setEmoji("☑️"),
                  new discord_js_1.ButtonBuilder()
                    .setStyle(discord_js_1.ButtonStyle.Danger)
                    .setCustomId("ex-no")
                    .setLabel("Tắt (Không)")
                    .setEmoji("🇽"),
                ),
              ],
            });
            const s = yield t.message.awaitMessageComponent({
              filter: (t) => t.user.id === e.user.id,
              componentType: discord_js_1.ComponentType.Button,
            });
            return (
              yield s.deferUpdate(),
              void (yield c("ex-yes" === s.customId))
            );
          }
          if (a.type === CategoryTypes.Questions) {
            yield e.editReply({
              embeds: [
                r
                  .embed()
                  .setDescription(
                    "Sử dụng các nút bên dưới để chọn một trong các tùy chọn",
                  )
                  .setColor(__1.client.config.GeneralSettings.EmbedColor),
              ],
              components: [
                new discord_js_1.ActionRowBuilder().addComponents(
                  a.choices.map((e) =>
                    new discord_js_1.ButtonBuilder()
                      .setStyle(e.style)
                      .setCustomId(`ex-${e.value}`)
                      .setLabel(e.name)
                      .setEmoji(e.emoji),
                  ),
                ),
              ],
            });
            const s = yield t.message.awaitMessageComponent({
              filter: (t) => t.user.id === e.user.id,
              componentType: discord_js_1.ComponentType.Button,
            });
            return (
              yield s.deferUpdate(),
              void (yield c(s.customId.replace("ex-", "")))
            );
          }
          if (a.type === CategoryTypes.Channel) {
            yield e.editReply({
              embeds: [
                r
                  .embed()
                  .setDescription(
                    "Sử dụng menu lựa chọn bên dưới để chọn kênh chat",
                  )
                  .setColor(__1.client.config.GeneralSettings.EmbedColor),
              ],
              components: [
                new discord_js_1.ActionRowBuilder().addComponents(
                  new discord_js_1.ChannelSelectMenuBuilder()
                    .setCustomId("ex-channel-select")
                    .setChannelTypes(
                      discord_js_1.ChannelType.GuildText,
                      discord_js_1.ChannelType.GuildAnnouncement,
                    )
                    .setMaxValues(1)
                    .setMinValues(1),
                ),
              ],
            });
            const s = yield t.message.awaitMessageComponent({
              filter: (t) => t.user.id === e.user.id,
              componentType: discord_js_1.ComponentType.ChannelSelect,
            });
            return (yield s.deferUpdate(), void (yield c(s.values[0])));
          }
          if (a.type === CategoryTypes.Role) {
            yield e.editReply({
              embeds: [
                r
                  .embed()
                  .setDescription(
                    "Sử dụng menu lựa chọn bên dưới để chọn vai trò (Role)",
                  )
                  .setColor(__1.client.config.GeneralSettings.EmbedColor),
              ],
              components: [
                new discord_js_1.ActionRowBuilder().addComponents(
                  new discord_js_1.RoleSelectMenuBuilder()
                    .setCustomId("ex-role-select")
                    .setMaxValues(1)
                    .setMinValues(1),
                ),
              ],
            });
            const s = yield t.message.awaitMessageComponent({
              filter: (t) => t.user.id === e.user.id,
              componentType: discord_js_1.ComponentType.RoleSelect,
            });
            return (yield s.deferUpdate(), void (yield c(s.values[0])));
          }
          if (a.type === CategoryTypes.Roles) {
            yield e.editReply({
              embeds: [
                r
                  .embed()
                  .setDescription(
                    "Sử dụng menu lựa chọn bên dưới để chọn các vai trò (Roles)",
                  )
                  .setColor(__1.client.config.GeneralSettings.EmbedColor),
              ],
              components: [
                new discord_js_1.ActionRowBuilder().addComponents(
                  new discord_js_1.RoleSelectMenuBuilder()
                    .setCustomId("ex-roles-select")
                    .setMinValues(0)
                    .setMaxValues(5),
                ),
                new discord_js_1.ActionRowBuilder().addComponents(
                  new discord_js_1.ButtonBuilder()
                    .setCustomId("ex-roles-select-none")
                    .setStyle(discord_js_1.ButtonStyle.Danger)
                    .setLabel("Không chọn vai trò nào")
                    .setEmoji("⛔"),
                ),
              ],
            });
            const s = yield t.message.awaitMessageComponent({
                filter: (t) => t.user.id === e.user.id,
              }),
              o = [];
            return (
              s.isRoleSelectMenu() && o.push(...s.values),
              yield s.deferUpdate(),
              void (yield c(o))
            );
          }
          yield t.editReply({ components: [...r.buttons(!0), n(!0)] });
          const m = (yield e.channel.awaitMessages({
            filter: (t) => t.author.id === e.user.id,
            max: 1,
          })).first();
          if (
            (yield m.delete(),
            a.type === CategoryTypes.Number &&
              ((u = parseInt(m.content)), isNaN(u) || u <= 0))
          )
            return (
              e.editReply({
                embeds: [
                  r
                    .embed()
                    .setDescription(`Giá trị ${a.name} phải là một số hợp lệ`)
                    .setColor("Red"),
                ],
              }),
              void (yield t.editReply({ components: [...r.buttons(), n()] }))
            );
          if (a.type === CategoryTypes.WebsiteEmbed)
            try {
              ((u = JSON.parse(m.content)),
                (null === (s = null == u ? void 0 : u.embed) || void 0 === s
                  ? void 0
                  : s.color) &&
                  "string" ==
                    typeof (null === (o = null == u ? void 0 : u.embed) ||
                    void 0 === o
                      ? void 0
                      : o.color) &&
                  (u.embed.color = (0, discord_js_1.resolveColor)(
                    u.embed.color,
                  )),
                (null == u ? void 0 : u.embed) && (u.embeds = [u.embed]),
                delete u.embed);
            } catch (s) {
              return (
                e.editReply({
                  embeds: [
                    r
                      .embed()
                      .setDescription(
                        "Không thể phân tích cú pháp mã nhúng (embed) bạn đã gửi, hãy đảm bảo rằng bạn đang sử dụng [trang web của chúng tôi](https://embed.strider.top)",
                      )
                      .setColor("Red"),
                  ],
                }),
                void (yield t.editReply({ components: [...r.buttons(), n()] }))
              );
            }
          (a.type === CategoryTypes.String && (u = m.content), yield c(u));
        }),
      );
    });
  }
}
exports.Dashboard = Dashboard;
