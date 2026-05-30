"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll"));
exports.default = new Command_1.Command({
  name: "addemoji",
  description: "Thêm emoji vào máy chủ",
  options: [
    {
      name: "emoji",
      description: "Emoji bạn muốn thêm",
      type: discord_js_1.ApplicationCommandOptionType.String,
      required: !0,
    },
    {
      name: "name",
      description: "Tên của emoji",
      type: discord_js_1.ApplicationCommandOptionType.String,
    },
  ],
  run: ({ client: e, interaction: i }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
        const t = i.options.getString("name"),
          r = i.options.getString("emoji"),
          o = (0, discord_js_1.parseEmoji)(r);
        if (!(null == o ? void 0 : o.id))
          return i.reply({
            embeds: [(0, replaceAll_1.default)(e.messages.Embeds.InvalidEmoji)],
          });
        const s = o.animated ? ".gif" : ".png",
          d = `https://cdn.discordapp.com/emojis/${o.id}${s}`;
        try {
          return (
            yield i.guild.emojis.create({ name: t || o.name, attachment: d }),
            i.reply({
              embeds: [(0, replaceAll_1.default)(e.messages.Embeds.EmojiCreated)],
            })
          );
        } catch (t) {
          return i.reply({
            embeds: [
              (0, replaceAll_1.default)(e.messages.Embeds.EmojiCreatingError, {
                "{error}": t,
              }),
            ],
          });
        }
      } catch (error) {
        console.error("[addemoji] Error:", error);
        const errorEmbed = new discord_js_1.EmbedBuilder()
          .setTitle("❌ Đã xảy ra lỗi")
          .setDescription("Có lỗi xảy ra khi thực thi lệnh này. Vui lòng thử lại sau.")
          .setColor("Red");
        if (i.replied || i.deferred) {
          i.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        } else {
          i.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        }
      }
    }),
});
