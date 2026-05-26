"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  pagination_1 = tslib_1.__importDefault(require("../../helpers/pagination")),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll")),
  discord_backup_1 = tslib_1.__importDefault(require("discord-backup")),
  messageUtils_1 = require("../../helpers/messageUtils");
exports.default = new Command_1.Command({
  name: "backup",
  description: "Quản lý hệ thống sao lưu máy chủ",
  options: [
    {
      name: "create",
      description: "Tạo một bản sao lưu mới tinh",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "list",
      description: "Danh sách các bản sao lưu hiện có",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "load",
      description: "Khôi phục máy chủ từ một bản sao lưu",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "id",
          description: "ID chính xác của bản sao lưu",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
      ],
    },
    {
      name: "delete",
      description: "Xóa một bản sao lưu đã tạo",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "id",
          description: "ID chính xác của bản sao lưu",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
      ],
    },
  ],
  run: ({ interaction: e, client: i }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      var t, d, o, s;
      const a = e.options.getSubcommand();
      if ("load" === a) {
        const t = e.options.getString("id");
        if (
          !(yield (0, messageUtils_1.confirmAction)({
            interaction: e,
            message: new discord_js_1.EmbedBuilder()
              .setTitle("Bạn có chắc chắn không?")
              .setDescription("Tất cả các kênh chat/thoại hiện tại sẽ bị xóa và thay thế bằng bản sao lưu này")
              .setColor(i.config.GeneralSettings.EmbedColor),
          }))
        )
          return e.editReply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("Yêu cầu khôi phục bản sao lưu đã bị hủy")
                .setColor("Red"),
            ],
            components: [],
          });
        (yield discord_backup_1.default.load(t, e.guild),
          e.editReply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("Bản sao lưu đã được khôi phục thành công!")
                .setColor("Red"),
            ],
            components: [],
          }));
      }
      if ("create" === a) {
        yield e.deferReply();
        try {
          const t = yield discord_backup_1.default.create(e.guild, {
            doNotBackup: ["messages"],
          });
          e.followUp({
            embeds: [
              (0, replaceAll_1.default)(i.messages.Embeds.BackupCreatedEmbed, {
                "{backup-id}": t.id,
                "{channels}":
                  t.channels.categories.length + t.channels.others.length,
                "{emojis}": t.emojis.length,
              }),
            ],
          });
        } catch (t) {
          return (
            i.logger.error(t),
            e.followUp({
              embeds: [
                new discord_js_1.EmbedBuilder()
                  .setTitle("Đã xảy ra lỗi, vui lòng kiểm tra console của bot")
                  .setColor("Red"),
              ],
              ephemeral: !0,
            })
          );
        }
      }
      if ("list" === a) {
        const a = yield discord_backup_1.default.list();
        if (!(null == a ? void 0 : a.length))
          return e.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("Máy chủ này chưa có bản sao lưu nào được tạo")
                .setColor("Red"),
            ],
            ephemeral: !0,
          });
        const n = [];
        for (const e of a) {
          const l = yield discord_backup_1.default.fetch(e),
            r =
              null !==
                (s =
                  null ===
                    (o =
                      null ===
                        (d =
                          null === (t = null == l ? void 0 : l.data) ||
                          void 0 === t
                            ? void 0
                            : t.channels) || void 0 === d
                        ? void 0
                        : d.categories) || void 0 === o
                    ? void 0
                    : o
                        .map((e) => {
                          const i = e.children
                            .map((e) => `  # ${e.name}`)
                            .join("\n");
                          return `˅ ${e.name}\n${i}`;
                        })
                        .join("\n\n")) && void 0 !== s
                ? s
                : "No channels found.";
          n.push(
            (0, replaceAll_1.default)(i.messages.Embeds.BackupListEmbed, {
              "{channels-format}": r.slice(0, 1016),
              "{backup-id}": e,
              "{timestamp}": Math.floor(l.data.createdTimestamp / 1e3),
              "{emojis-count}": l.data.emojis.length || "0",
              "{current-page}": n.length + 1,
              "{total-pages}": a.length,
            }),
          );
        }
        (0, pagination_1.default)({ embeds: n, interaction: e, time: 12e4 });
      }
      if ("delete" == a) {
        const t = e.options.getString("id");
        try {
          (yield discord_backup_1.default.remove(t),
            e.reply({
              embeds: [
                (0, replaceAll_1.default)(
                  i.messages.Embeds.BackupDeletedEmbed,
                  { "{backup-id}": t },
                ),
              ],
            }));
        } catch (i) {
          return e.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("Không tìm thấy bản sao lưu nào với ID này")
                .setColor("Red"),
            ],
            ephemeral: !0,
          });
        }
      }
    }),
});
