"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  pagination_1 = tslib_1.__importDefault(require("../../helpers/pagination")),
  CommandModel_1 = tslib_1.__importDefault(
    require("../../models/CommandModel"),
  ),
  Command_1 = require("../../structures/Command"),
  fs_1 = require("fs"),
  js_yaml_1 = require("js-yaml");
function format(e) {
  const t = (e) =>
      (null == e ? void 0 : e.charAt(0).toUpperCase()) +
        (null == e ? void 0 : e.slice(1)) || "",
    [o, s] = e.split("-");
  return t(o) + t(s);
}
exports.default = new Command_1.Command({
  name: "custom-commands",
  description: "Make custom commands for your server",
  options: [
    {
      name: "create",
      description: "Create a custom command",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "delete",
      description: "Delete a custom command",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "name",
          description: "The name of the command",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
      ],
    },
    {
      name: "list",
      description: "List all custom commands",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
  ],
  run: ({ interaction: e, client: t }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      const o = e.options.getSubcommand(),
        s = yield CommandModel_1.default.findOne({ guildId: e.guildId }),
        i = (null == s ? void 0 : s.commands) || [];
      if ("create" === o) {
        let o = [];
        const i = {
            name: "",
            description: null,
            response: null,
            permission: null,
          },
          n = (e = !1) => {
            const { name: t, description: s, response: n } = i,
              d = [
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
                      s
                        ? discord_js_1.ButtonStyle.Primary
                        : discord_js_1.ButtonStyle.Secondary,
                    )
                    .setDisabled(e)
                    .setCustomId("description")
                    .setLabel("Mô tả")
                    .setEmoji("📰"),
                  new discord_js_1.ButtonBuilder()
                    .setStyle(
                      n
                        ? discord_js_1.ButtonStyle.Primary
                        : discord_js_1.ButtonStyle.Secondary,
                    )
                    .setDisabled(e)
                    .setCustomId("response")
                    .setLabel("Nội dung phản hồi")
                    .setEmoji("✏️"),
                  new discord_js_1.ButtonBuilder()
                    .setStyle(
                      o.length
                        ? discord_js_1.ButtonStyle.Primary
                        : discord_js_1.ButtonStyle.Secondary,
                    )
                    .setDisabled(e)
                    .setCustomId("permission")
                    .setLabel("Quyền")
                    .setEmoji("🕵️"),
                ),
              ];
            return (
              t &&
                s &&
                n &&
                o.length &&
                d[0].addComponents(
                  new discord_js_1.ButtonBuilder()
                    .setStyle(discord_js_1.ButtonStyle.Success)
                    .setCustomId("finish")
                    .setDisabled(e)
                    .setEmoji("✔️"),
                ),
              d
            );
          },
          d = () => ({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("Cài đặt lệnh tùy chỉnh cá nhân")
                .setDescription(
                  "Nhấn nút tương ứng với thuộc tính bạn muốn chỉnh sửa.",
                )
                .setColor(t.config.GeneralSettings.EmbedColor),
            ],
            components: n(),
            fetchReply: !0,
          }),
          m = (yield e.reply(d())).createMessageComponentCollector({
            componentType: discord_js_1.ComponentType.Button,
            filter: (t) => t.user.id === e.user.id,
            time: 12e4,
          });
        (m.on("collect", (r) =>
          tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            (m.resetTimer(), yield r.deferUpdate());
            const { customId: a } = r;
            if ("finish" === a)
              return (
                (i.name = i.name.toLowerCase()),
                (t.commandsConfig[format(i.name)] = {
                  Enabled: !0,
                  Permissions: o,
                }),
                (0, fs_1.writeFileSync)(
                  "config/commands.yml",
                  (0, js_yaml_1.dump)(t.commandsConfig),
                  "utf-8",
                ),
                s
                  ? ((s.commands = [...s.commands, i]), yield s.save())
                  : yield CommandModel_1.default.create({
                      guildId: e.guildId,
                      commands: [i],
                    }),
                t.commands.set(i.name, {
                  name: i.name,
                  description: i.description,
                  permission: i.permission,
                  directory: "general",
                  run: ({ interaction: e }) => e.reply(i.response),
                }),
                yield e.guild.commands.create({
                  name: i.name,
                  description: i.description,
                }),
                m.stop("finish")
              );
            yield e.editReply({ components: n(!0) });
            const l = yield e.channel.awaitMessages({
              filter: (t) => t.author.id === e.user.id,
              max: 1,
            });
            let c = l.first().content;
            if ((yield l.first().delete().catch(), "response" === a))
              try {
                const e = JSON.parse(c);
                (e.embed && ((e.embeds = [e.embed]), delete e.embed), (c = e));
              } catch (t) {
                return void e.editReply({
                  embeds: [
                    d()
                      .embeds[0].setDescription(
                        "Tạo câu trả lời bạn muốn bot gửi tại [embedbuilder](https://glitchii.github.io/embedbuilder).",
                      )
                      .setColor("Red"),
                  ],
                  components: n(),
                });
              }
            "permission" === a &&
            ((o = [...o, ...l.first().mentions.roles.map((e) => e.id)]),
            (c = format(i.name)),
            o.length <= 0)
              ? e.editReply({
                  embeds: [
                    d()
                      .embeds[0].setDescription(
                        "Bạn phải mention các vai trò có thể sử dụng lệnh này.",
                      )
                      .setColor("Red"),
                  ],
                  components: n(),
                })
              : ((i[a] = c), e.editReply(d()));
          }),
        ),
          m.once("end", (o, s) => {
            "time" !== s
              ? e.editReply({
                  embeds: [
                    d()
                      .embeds[0].setTitle("Lệnh tùy chỉnh đã được tạo thành công!")
                      .setDescription(
                        `✅ Lệnh đã tạo thành công! Dùng **/${i.name}** để sử dụng.`,
                      )
                      .setColor(t.config.GeneralSettings.EmbedColor),
                  ],
                  components: n(!0),
                })
              : e.editReply({
                  embeds: [
                    d()
                      .embeds[0].setTitle("Đã hết thời gian chờ")
                      .setDescription(
                        "Đã quá thời gian chờ (2 phút). Vui lòng gõ lại lệnh.",
                      )
                      .setColor("Red"),
                  ],
                  components: n(!0),
                });
          }));
      }
      if ("delete" === o) {
        const o = e.options.getString("name"),
          n = i.find((e) => e.name === o);
        return n
          ? (delete t.commandsConfig[n.permission],
            (0, fs_1.writeFileSync)(
              "config/commands.yml",
              (0, js_yaml_1.dump)(t.commandsConfig),
              "utf-8",
            ),
            i.splice(i.indexOf(n), 1),
            (s.commands = i),
            yield s.save(),
            e.reply({
              embeds: [
                new discord_js_1.EmbedBuilder()
                  .setTitle("Đã xóa lệnh tùy chỉnh")
                  .setDescription(
                    `✅ Đã xóa lệnh **/${o}**. Nhớ khởi động lại bot!`,
                  )
                  .setColor(t.config.GeneralSettings.EmbedColor),
              ],
            }))
          : e.reply({
              embeds: [
                new discord_js_1.EmbedBuilder()
                  .setTitle("Lỗi khi xóa lệnh tùy chỉnh")
                  .setDescription("❌ Không tìm thấy lệnh với tên này.")
                  .setColor("Red"),
              ],
            });
      }
      if ("list" === o) {
        if (!i.length)
          return e.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("❌ Không có lệnh tùy chỉnh nào")
                .setDescription("⚠️ Chưa có lệnh tùy chỉnh nào. Hãy tạo lệnh bằng /custom-commands create.")
                .setColor("Red"),
            ],
          });
        const o = [];
        for (const e of i) {
          const s = t.commandsConfig[e.permission].Permissions;
          o.push(
            new discord_js_1.EmbedBuilder()
              .setTitle(`Lệnh tùy chỉnh: ${e.name}`)
              .addFields(
                {
                  name: "• Thông tin lệnh:",
                  value: `>>> Tên: **${e.name}**\nMô tả: **${e.description}**`,
                },
                {
                  name: "• Thông tin quyền:",
                  value: `>>> ${s.map((e) => `<@&${e}>`).join("\n")}`,
                },
              )
              .setColor(t.config.GeneralSettings.EmbedColor)
              .setFooter({
                text: `Lệnh ${o.length + 1} / ${i.length}`,
                iconURL: t.user.displayAvatarURL(),
              }),
          );
        }
        (0, pagination_1.default)({ interaction: e, embeds: o, time: 12e4 });
      }
    }),
});
