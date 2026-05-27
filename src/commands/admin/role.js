"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  pagination_1 = tslib_1.__importDefault(require("../../helpers/pagination")),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll")),
  RolesModel_1 = tslib_1.__importDefault(require("../../models/RolesModel")),
  ms_1 = tslib_1.__importDefault(require("ms"));
exports.default = new Command_1.Command({
  name: "role",
  description: "Quản lý hệ thống vai trò (role) tạm thời",
  options: [
    {
      name: "add",
      description: "Gán vai trò tạm thời cho một thành viên",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "Thành viên sẽ được gán vai trò",
          type: discord_js_1.ApplicationCommandOptionType.User,
          required: !0,
        },
        {
          name: "role",
          description: "Vai trò muốn gán cho thành viên",
          type: discord_js_1.ApplicationCommandOptionType.Role,
          required: !0,
        },
        {
          name: "time",
          description:
            "Thời hạn giữ vai trò của thành viên (Ví dụ: 10m, 1h, 1d)",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
      ],
    },
    {
      name: "remove",
      description: "Gỡ bỏ vai trò tạm thời của một thành viên",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "Thành viên muốn gỡ bỏ vai trò",
          type: discord_js_1.ApplicationCommandOptionType.User,
          required: !0,
        },
        {
          name: "role",
          description: "Vai trò tạm thời muốn gỡ bỏ",
          type: discord_js_1.ApplicationCommandOptionType.Role,
          required: !0,
        },
        {
          name: "remove",
          description: "Có thực sự gỡ vai trò đó khỏi thành viên ngay lập tức không?",
          type: discord_js_1.ApplicationCommandOptionType.Boolean,
          required: !1,
        },
      ],
    },
    {
      name: "list",
      description: "Danh sách các vai trò tạm thời đang được áp dụng",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
  ],
  run: ({ client: e, interaction: r }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      var o, i;
      const t = r.options.getSubcommand();
      if ("add" === t) {
        const o = (0, ms_1.default)(r.options.getString("time")),
          i = r.options.getUser("user"),
          t = r.options.getRole("role");
        if (!o || isNaN(o))
          return r.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("❌ Vui lòng nhập thời gian hợp lệ (ví dụ: 10m, 1h, 1d)")
                .setColor("Red"),
            ],
            ephemeral: !0,
          });
        const d = yield r.guild.members.fetch(i.id);
        if (d.roles.cache.has(t.id))
          return r.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("❌ Thành viên này đã có vai trò đó rồi")
                .setColor("Red"),
            ],
            ephemeral: !0,
          });
        try {
          const l = new Date();
          (l.setSeconds(l.getSeconds() + o / 1e3),
            yield RolesModel_1.default.create({
              memberId: d.id,
              guildId: r.guildId,
              role: t.id,
              expireAt: l.getTime(),
            }),
            yield d.roles.add(t.id),
            r.reply({
              embeds: [
                (0, replaceAll_1.default)(
                  e.messages.Embeds.TemporalRankAddEmbed,
                  {
                    "{role-id}": t.id,
                    "{user-tag}": i.tag,
                    "{user-id}": i.id,
                    "{timestamp}": Math.floor(l.getTime() / 1e3),
                  },
                ),
              ],
            }));
        } catch (o) {
          return (
            e.logger.error(o),
            r.reply({
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
      if ("list" === t) {
        const t = yield RolesModel_1.default.find({ guildId: r.guildId }),
          s = [];
        try {
          for (
            var d, l = tslib_1.__asyncValues(t);
            !(d = yield l.next()).done;
          ) {
            const o = d.value,
              i = r.guild.members.cache.get(o.memberId);
            s.push(
              (0, replaceAll_1.default)(
                e.messages.Embeds.TemporalRankListEmbed,
                {
                  "{user-id}": i.id,
                  "{user-tag}": i.user.tag,
                  "{role-id}": o.role,
                  "{timestamp}": Math.floor(o.expireAt / 1e3),
                  "{current-page}": s.length + 1,
                  "{total-pages}": t.length,
                },
              ),
            );
          }
        } catch (e) {
          o = { error: e };
        } finally {
          try {
            d && !d.done && (i = l.return) && (yield i.call(l));
          } finally {
            if (o) throw o.error;
          }
        }
        (0, pagination_1.default)({ embeds: s, interaction: r, time: 12e4 });
      }
      if ("remove" === t) {
        const o = r.options.getBoolean("remove"),
          i = r.options.getUser("user"),
          t = r.options.getRole("role"),
          d = yield RolesModel_1.default.findOne({
            guildId: r.guildId,
            memberId: i.id,
            role: t.id,
          });
        if (!d)
          return r.reply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("❌ Thành viên này không có vai trò tạm thời đó")
                .setColor("Red"),
            ],
            ephemeral: !0,
          });
        (yield d.deleteOne(),
          o &&
            (yield r.guild.members.fetch(i.id)).roles
              .remove(t.id)
              .catch((e) => e),
          yield r.reply({
            embeds: [
              (0, replaceAll_1.default)(
                e.messages.Embeds.TemporalRankRemoveEmbed,
                {
                  "{role-id}": t.id,
                  "{user-tag}": i.tag,
                  "{user-id}": i.id,
                  "{timestamp}": Math.floor(d.expireAt / 1e3),
                },
              ),
            ],
          }));
      }
    }),
});
