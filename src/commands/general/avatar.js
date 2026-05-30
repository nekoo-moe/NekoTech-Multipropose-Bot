"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll"));
exports.default = new Command_1.Command({
  name: "avatar",
  description: "Lấy ảnh đại diện (avatar) của thành viên",
  options: [
    {
      name: "user",
      description: "Thành viên bạn muốn xem ảnh đại diện",
      type: discord_js_1.ApplicationCommandOptionType.User,
    },
  ],
  run: ({ interaction: e, client: t }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
      const s = e.options.getUser("user") || e.user;
      yield e.reply({
        embeds: [
          (0, replaceAll_1.default)(t.messages.Embeds.UserAvatarEmbed, {
            "{user-avatar}": s.displayAvatarURL({ size: 4096 }),
            "{user-name}": s.username,
            "{user-tag}": s.tag,
            "{user-id}": s.id,
          }),
        ],
        components: [
          new discord_js_1.ActionRowBuilder().addComponents(
            new discord_js_1.ButtonBuilder()
              .setStyle(discord_js_1.ButtonStyle.Link)
              .setURL(
                s.displayAvatarURL({
                  extension: "png",
                  size: 4096,
                  forceStatic: !0,
                }),
              )
              .setLabel("PNG")
              .setEmoji("🔗"),
            new discord_js_1.ButtonBuilder()
              .setStyle(discord_js_1.ButtonStyle.Link)
              .setURL(
                s.displayAvatarURL({
                  extension: "jpg",
                  size: 4096,
                  forceStatic: !0,
                }),
              )
              .setLabel("JPG")
              .setEmoji("🔗"),
            new discord_js_1.ButtonBuilder()
              .setStyle(discord_js_1.ButtonStyle.Link)
              .setDisabled(
                !s.displayAvatarURL({ forceStatic: !1 }).includes("gif"),
              )
              .setURL(s.displayAvatarURL({ extension: "gif" }))
              .setLabel("GIF")
              .setEmoji("🔗"),
          ),
        ],
      });
      } catch (error) {
        console.error("[avatar] Error:", error);
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
