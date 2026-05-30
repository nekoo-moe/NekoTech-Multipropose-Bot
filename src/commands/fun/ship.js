"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  generateShipImage_1 = tslib_1.__importDefault(
    require("../../helpers/images/generateShipImage"),
  ),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll"));
function ship() {
  const e = Math.floor(110 * Math.random()) + 0,
    i = e / 10;
  return `${"🟥".repeat(i)}${"⬛".repeat(11 - i)} ${e}%`;
}
exports.default = new Command_1.Command({
  name: "ship",
  description: "Xem mức độ đẹp đôi, tình cảm giữa 2 thành viên",
  options: [
    {
      name: "one",
      description: "Thành viên thứ nhất",
      type: discord_js_1.ApplicationCommandOptionType.User,
      required: !0,
    },
    {
      name: "two",
      description: "Thành viên thứ hai (để trống để chọn bản thân bạn)",
      type: discord_js_1.ApplicationCommandOptionType.User,
      required: !1,
    },
  ],
  run: ({ interaction: e, client: i }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
        const t = e.options.getUser("one"),
          r = e.options.getUser("two") || e.user;
        if (t.id === r.id)
          return e.reply({
            embeds: [
              (0, replaceAll_1.default)(i.messages.Embeds.ShipWrongMentionEmbed),
            ],
          });
        const s = { extension: "png", size: 512 },
          o = yield (0, generateShipImage_1.default)(
            t.displayAvatarURL(s),
            r.displayAvatarURL(s),
          ),
          a = new discord_js_1.AttachmentBuilder(o, { name: "ship.png" });
        e.reply({
          files: [a],
          embeds: [
            (0, replaceAll_1.default)(i.messages.Embeds.ShipCorrectEmbed, {
              "{image}": "attachment://ship.png",
              "{user1-tag}": t.tag,
              "{user2-tag}": r.tag,
              "{user1-id}": t.id,
              "{user2-id}": r.id,
              "{ship}": ship(),
            }),
          ],
        });
      } catch (error) {
        console.error("[ship] Error:", error);
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
