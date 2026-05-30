"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  messageUtils_1 = require("../../helpers/messageUtils"),
  Command_1 = require("../../structures/Command");
function generateComponentsBoard(e = !1) {
  return [
    new discord_js_1.ActionRowBuilder().addComponents(
      new discord_js_1.ButtonBuilder()
        .setCustomId("rps-rock")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(e)
        .setLabel("Đá")
        .setEmoji("🪨"),
      new discord_js_1.ButtonBuilder()
        .setCustomId("rps-paper")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(e)
        .setLabel("Báo")
        .setEmoji("🧻"),
      new discord_js_1.ButtonBuilder()
        .setCustomId("rps-scissors")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(e)
        .setLabel("Kéo")
        .setEmoji("✂️"),
    ),
  ];
}
function determineRPSResult(e, s) {
  return e === s
    ? 0
    : ("rock" === e && "scissors" === s) ||
        ("paper" === e && "rock" === s) ||
        ("scissors" === e && "paper" === s)
      ? 1
      : 2;
}
function getRPSChoiceEmoji(e) {
  return "rock" === e
    ? "🪨"
    : "paper" === e
      ? "🧻"
      : "scissors" === e
        ? "✂️"
        : "❔";
}
exports.default = new Command_1.Command({
  name: "rps",
  description: "Chơi kéo búa bao (oẳn tù tì) với bạn bè",
  options: [
    {
      name: "user",
      description: "Thành viên bạn muốn thách đấu oẳn tù tì",
      type: discord_js_1.ApplicationCommandOptionType.User,
      required: !0,
    },
  ],
  run: ({ client: e, interaction: s }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
        const t = s.options.getUser("user"),
          o = yield (0, messageUtils_1.approve)({
            author: s.user,
            game: "Trò chơi Kéo Búa Bao",
            interaction: s,
            user: t,
          });
        if (!o)
          return s.editReply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle(`Trò chơi đã bị ${t.username} từ chối`)
                .setColor("Red"),
            ],
            components: [],
          });
        const r = [null, null];
        yield o.deferUpdate();
        const i = (yield s.editReply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle("Trò chơi Kéo Búa Bao")
              .setDescription("➡️ Nhấn một nút bên dưới để chọn")
              .setColor(e.config.GeneralSettings.EmbedColor)
              .addFields(
                { name: s.user.username, value: "❔", inline: !0 },
                { name: "VS", value: "⚡", inline: !0 },
                { name: t.username, value: "❔", inline: !0 },
              ),
          ],
          components: generateComponentsBoard(!1),
        })).createMessageComponentCollector({
          componentType: discord_js_1.ComponentType.Button,
          time: 6e4,
        });
        (i.on("collect", (o) =>
          tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            i.resetTimer();
            const { customId: n } = o;
            if (o.user.id !== s.user.id && o.user.id !== t.id)
              return void o.reply({
                content: "❌ | Bạn không tham gia trò chơi này.",
                ephemeral: !0,
              });
            if (r[0] && r[1])
              return void o.reply({
                content: "❌ | Cả hai người đã chọn xong rồi.",
                ephemeral: !0,
              });
            let d;
            if (((d = o.user.id === s.user.id ? 0 : 1), r[d]))
              return void o.reply({
                content: "❌ | Bạn đã chọn rồi.",
                ephemeral: !0,
              });
            const a = n.split("rps-")[1];
            if (
              ((r[d] = a),
              yield o.reply({
                content: "✅ Lựa chọn của bạn đã được ghi nhận.",
                ephemeral: !0,
              }),
              r[0] && r[1])
            ) {
              const o = determineRPSResult(r[0], r[1]),
                n = 1 === o ? s.user : t;
              return (
                yield s.editReply({
                  embeds: [
                    new discord_js_1.EmbedBuilder()
                      .setTitle("Trò chơi Kéo Búa Bao")
                      .setColor(e.config.GeneralSettings.EmbedColor)
                      .setDescription(
                        0 === o
                          ? "🤝 Hòa! Không ai thắng!"
                          : `🎉 ${n.toString()} thắng! Chúc mừng bạn!`,
                      )
                      .addFields(
                        {
                          name: s.user.username,
                          value: getRPSChoiceEmoji(r[0]),
                          inline: !0,
                        },
                        { name: "VS", value: "⚡", inline: !0 },
                        {
                          name: t.username,
                          value: getRPSChoiceEmoji(r[1]),
                          inline: !0,
                        },
                      ),
                  ],
                  components: generateComponentsBoard(!0),
                }),
                i.stop()
              );
            }
            s.editReply({
              embeds: [
                new discord_js_1.EmbedBuilder()
                  .setTitle("Trò chơi Kéo Búa Bao")
                  .setDescription(
                    `${o.user.toString()} vừa chọn xong\n\t\t\t\t\t\t\t➡️ Nhấn một nút bên dưới để chọn.`,
                  )
                  .setColor(e.config.GeneralSettings.EmbedColor)
                  .addFields(
                    { name: s.user.username, value: "❔", inline: !0 },
                    { name: "VS", value: "⚡", inline: !0 },
                    { name: t.username, value: "❔", inline: !0 },
                  ),
              ],
            });
          }),
        ),
          i.on("end", () => {
            (r[0] && r[1]) ||
              s.editReply({
                embeds: [
                  new discord_js_1.EmbedBuilder()
                    .setTitle("Trò chơi Kéo Búa Bao")
                    .setDescription("⏰ Trò chơi đã kết thúc do không hoạt động.")
                    .setColor("Red")
                    .setFooter({ text: "⚠️ Cả hai người cần phải chọn." }),
                ],
                components: generateComponentsBoard(!0),
              });
          }));
      } catch (error) {
        console.error("[rps] Error:", error);
        const errorEmbed = new discord_js_1.EmbedBuilder()
          .setTitle("❌ Đã xảy ra lỗi")
          .setDescription("Có lỗi xảy ra khi thực thi lệnh này. Vui lòng thử lại sau.")
          .setColor("Red");
        if (s.replied || s.deferred) {
          s.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        } else {
          s.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        }
      }
    }),
});
