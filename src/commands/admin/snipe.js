"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  pagination_1 = tslib_1.__importDefault(require("../../helpers/pagination")),
  snipeManager_1 = tslib_1.__importDefault(
    require("../../helpers/snipeManager"),
  ),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll"));
exports.default = new Command_1.Command({
  name: "snipe",
  description: "Xem các tin nhắn đã bị xóa gần đây trong một kênh",
  options: [
    {
      name: "channel",
      description: "Kênh muốn xem các tin nhắn đã bị xóa",
      type: discord_js_1.ApplicationCommandOptionType.Channel,
      channelTypes: [discord_js_1.ChannelType.GuildText],
      required: !1,
    },
  ],
  run: ({ client: e, interaction: t }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
      const n = t.options.getChannel("channel") || t.channel,
        a = yield snipeManager_1.default.getSnipes(n.id),
        i = [];
      for (const t of a)
        i.push(
          (0, replaceAll_1.default)(e.messages.Embeds.SnipeListEmbed, {
            "{author-username}": t.author.username,
            "{author-tag}": t.author.tag,
            "{author-pfp}": t.author.displayAvatarURL(),
            "{message-timestamp}": t.createdAt.toISOString(),
            "{message-content}": t.content,
            "{message-id}": t.id,
            "{channel-id}": t.channelId,
            "{attachments}":
              t.attachments.map((e) => e.url).join("\n") || "N/A",
            "{current-page}": i.length + 1,
            "{total-pages}": a.length,
          }),
        );
      return (0, pagination_1.default)({
        interaction: t,
        embeds: i,
        time: 12e4,
        ephemeral: !0,
      });
      } catch (error) {
        console.error("[snipe] Error:", error);
        const errorEmbed = new discord_js_1.EmbedBuilder()
          .setTitle("❌ Đã xảy ra lỗi")
          .setDescription("Có lỗi xảy ra khi thực thi lệnh này. Vui lòng thử lại sau.")
          .setColor("Red");
        if (t.replied || t.deferred) {
          t.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        } else {
          t.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        }
      }
    }),
});
