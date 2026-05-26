"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  SuggestModel_1 = tslib_1.__importDefault(
    require("../../models/SuggestModel"),
  ),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll")),
  querys_1 = require("../../helpers/querys");
exports.default = new Command_1.Command({
  name: "suggestion",
  description: "Quản lý góp ý",
  options: [
    {
      name: "accept",
      description: "Chấp thuận một góp ý",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "token",
          description: "Mã ID của góp ý",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
        {
          name: "reply",
          description: "Phản hồi của bạn với góp ý",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
      ],
    },
    {
      name: "decline",
      description: "Từ chối một góp ý",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "token",
          description: "Mã ID của góp ý",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
        {
          name: "reply",
          description: "Phản hồi của bạn với góp ý",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
      ],
    },
  ],
  run: ({ interaction: e, client: t }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      var o, i, n;
      const s =
          "accept" === e.options.getSubcommand(!1) ? "Accepted" : "Declined",
        d = e.options.getString("token"),
        r = e.options.getString("reply"),
        l = yield (0, querys_1.guilds)().get(e.guildId),
        u = e.guild.channels.cache.get(
          null === (o = null == l ? void 0 : l.suggestionConfig) || void 0 === o
            ? void 0
            : o.channel,
        );
      if (!u)
        return e.reply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle("Vui lòng cấu hình kênh góp ý bằng lệnh `/setup` trước")
              .setColor(t.config.GeneralSettings.EmbedColor),
          ],
        });
      const a = yield SuggestModel_1.default.findOne({
        guildId: e.guildId,
        suggestionId: d,
      });
      if (!a)
        return e.reply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle("❌ Không tìm thấy góp ý với ID này")
              .setColor(t.config.GeneralSettings.EmbedColor),
          ],
        });
      (e.reply({
        embeds: [
          new discord_js_1.EmbedBuilder()
            .setTitle(`✅ Góp ý đã được ${s === "Accepted" ? "chấp thuận" : "từ chối"}`)
            .setColor(t.config.GeneralSettings.EmbedColor),
        ],
        ephemeral: !0,
      }),
        (a.status = s),
        (a.staffResponse = r),
        (a.staffUsername = e.user.id),
        yield a.save());
      const g = yield u.messages.fetch(d),
        p = t.users.cache.get(a.ownerId),
        c = g.components[0].components.map((e) => {
          var t;
          return new discord_js_1.ButtonBuilder(e.data).setDisabled(
            null === (t = null == l ? void 0 : l.suggestionConfig) ||
              void 0 === t
              ? void 0
              : t.disable,
          );
        });
      g.edit({
        embeds: [
          (0, replaceAll_1.default)(
            t.messages.Embeds[`Suggest${a.status}Embed`],
            {
              "{updated-date}": new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              "{suggestion}": a.suggestion,
              "{upvote-emoji}":
                (null === (i = null == l ? void 0 : l.suggestionConfig) ||
                void 0 === i
                  ? void 0
                  : i.upvote) || "👍",
              "{downvote-emoji}":
                (null === (n = null == l ? void 0 : l.suggestionConfig) ||
                void 0 === n
                  ? void 0
                  : n.downvote) || "👎",
              "{upvote-count}": a.upvotes.length,
              "{downvote-count}": a.downvotes.length,
              "{user-tag}": p.tag,
              "{user-pfp}": p.displayAvatarURL(),
              "{message-id}": d,
              "{staff-username}": e.user.username,
              "{staff-tag}": e.user.tag,
              "{staff}": e.user.toString(),
              "{response}": r,
            },
          ),
        ],
        components: [new discord_js_1.ActionRowBuilder().addComponents(c)],
      });
    }),
});
