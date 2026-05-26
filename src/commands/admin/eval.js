"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  Command_1 = require("../../structures/Command"),
  discord_js_1 = require("discord.js");
exports.default = new Command_1.Command({
  name: "eval",
  description: "Execute a code using the discord bot",
  run: ({ interaction: interaction, client: client }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      yield interaction.reply({
        embeds: [
          new discord_js_1.EmbedBuilder()
            .setTitle("Hãy gửi mã code JavaScript bạn cần thực thi")
            .setColor("Orange"),
        ],
      });
      const collector = interaction.channel.createMessageCollector({
        filter: (e) => e.author.id === interaction.user.id,
        max: 1,
      });
      collector.on("collect", (message) =>
        tslib_1.__awaiter(void 0, void 0, void 0, function* () {
          try {
            yield message.delete().catch((e) => e);
            const output = eval(message.content);
            yield interaction.editReply({
              embeds: [
                new discord_js_1.EmbedBuilder()
                  .setTitle("💻 Bảng điều khiển lệnh Discord")
                  .addFields(
                    {
                      name: "📥 • Input",
                      value: "```" + message.content + "```",
                    },
                    { name: "📤 • Output", value: "```js\n" + output + "```" },
                    {
                      name: "🛠️ • Type",
                      value: "```js\n" + (typeof output || "Unknown") + "```",
                    },
                  )
                  .setColor("Green"),
              ],
            });
          } catch (e) {
            return (
              client.logger.error(e),
              void interaction.editReply({
                embeds: [
                  new discord_js_1.EmbedBuilder()
                    .setTitle(e || "Đã xảy ra lỗi hệ thống, vui lòng kiểm tra console")
                    .setColor("Red"),
                ],
              })
            );
          }
        }),
      );
    }),
});
