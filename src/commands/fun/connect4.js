"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  Command_1 = require("../../structures/Command"),
  messageUtils_1 = require("../../helpers/messageUtils"),
  BOARD_SIZE = 7,
  BOARD_HEIGHT = 6,
  EMPTY_CELL = "⚪",
  PLAYER_1 = "🔴",
  PLAYER_2 = "🟡";
function createEmptyBoard() {
  return Array.from({ length: 6 }, () => Array(7).fill("⚪"));
}
function getBoardAsString(e) {
  return `${e.map((e) => e.join("")).join("\n")}\n1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣`;
}
function generateComponentsBoard(e = !1) {
  const t = [];
  for (let n = 0; n < 7; n++)
    t.push(
      new discord_js_1.ButtonBuilder()
        .setEmoji(getEmojiForColumn(n))
        .setCustomId(`connect4-${n}`)
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(e),
    );
  const n = [];
  for (let e = 0; e < t.length; e += 5) {
    const o = new discord_js_1.ActionRowBuilder().addComponents(
      ...t.slice(e, e + 5),
    );
    n.push(o);
  }
  return n;
}
function getEmojiForColumn(e) {
  return 0 === e
    ? "1️⃣"
    : 1 === e
      ? "2️⃣"
      : 2 === e
        ? "3️⃣"
        : 3 === e
          ? "4️⃣"
          : 4 === e
            ? "5️⃣"
            : 5 === e
              ? "6️⃣"
              : 6 === e
                ? "7️⃣"
                : "";
}
function isColumnFull(e, t) {
  return "⚪" !== e[0][t];
}
function dropDisc(e, t, n) {
  for (let o = 5; o >= 0; o--) if ("⚪" === e[o][t]) return ((e[o][t] = n), o);
}
function checkWin(e, t, n) {
  const o = e[t][n];
  let r = 1,
    s = t - 1;
  for (; s >= 0 && e[s][n] === o; ) (r++, s--);
  for (s = t + 1; s < 6 && e[s][n] === o; ) (r++, s++);
  if (r >= 4) return !0;
  r = 1;
  let i = n - 1;
  for (; i >= 0 && e[t][i] === o; ) (r++, i--);
  for (i = n + 1; i < 7 && e[t][i] === o; ) (r++, i++);
  if (r >= 4) return !0;
  for (r = 1, s = t - 1, i = n + 1; s >= 0 && i < 7 && e[s][i] === o; )
    (r++, s--, i++);
  for (s = t + 1, i = n - 1; s < 6 && i >= 0 && e[s][i] === o; )
    (r++, s++, i--);
  if (r >= 4) return !0;
  for (r = 1, s = t - 1, i = n - 1; s >= 0 && i >= 0 && e[s][i] === o; )
    (r++, s--, i--);
  for (s = t + 1, i = n + 1; s < 6 && i < 7 && e[s][i] === o; ) (r++, s++, i++);
  return r >= 4;
}
function checkDraw(e) {
  for (let t = 0; t < 6; t++)
    for (let n = 0; n < 7; n++) if ("⚪" === e[t][n]) return !1;
  return !0;
}
function getPlayerDisc(e, t) {
  return t === e.user.id ? "🔴" : "🟡";
}
exports.default = new Command_1.Command({
  name: "connect4",
  description: "Chơi game nối 4 (Connect 4) với bạn bè",
  options: [
    {
      name: "user",
      description: "Thành viên bạn muốn thách đấu",
      type: discord_js_1.ApplicationCommandOptionType.User,
      required: !0,
    },
  ],
  run: ({ client: e, interaction: t }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
        const n = t.options.getUser("user"),
          o = yield (0, messageUtils_1.approve)({
            author: t.user,
            game: "Trò chơi Cờ Connect 4",
            interaction: t,
            user: n,
          });
        if (!o)
          return t.editReply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle(`Trận đấu đã bị từ chối bởi ${n.username}`)
                .setColor("Red"),
            ],
            components: [],
          });
        const r = createEmptyBoard();
        let s = t.user,
          i = !1;
        yield o.deferUpdate();
        const d = (yield t.editReply({
          content: `Đến lượt của ${s.toString()}`,
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle("Trò chơi Cờ Connect 4")
              .setDescription(getBoardAsString(r))
              .addFields({
                name: "Trạng thái",
                value: `${getPlayerDisc(t, s.id)} | Đến lượt của ${s.toString()}`,
              })
              .setColor(e.config.GeneralSettings.EmbedColor),
          ],
          components: generateComponentsBoard(),
        })).createMessageComponentCollector({
          componentType: discord_js_1.ComponentType.Button,
          time: 6e4,
        });
        (d.on("collect", (o) =>
          tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            d.resetTimer();
            const { customId: a } = o;
            if (o.user.id !== s.id)
              return void o.reply({
                content: "❌ Bạn không thể đi nước cờ này, đang là lượt của đối thủ.",
                ephemeral: !0,
              });
            if (i)
              return void o.reply({
                content: "❌ Trò chơi đã kết thúc.",
                ephemeral: !0,
              });
            const l = parseInt(a.split("connect4-")[1]);
            if (isNaN(l) || l < 0 || l >= 7)
              return void o.reply({
                content: "❌ Nước đi không hợp lệ. Vui lòng chọn một cột phù hợp.",
                ephemeral: !0,
              });
            if (isColumnFull(r, l))
              return void o.reply({
                content:
                  "❌ Cột này đã đầy. Vui lòng chọn cột khác.",
                ephemeral: !0,
              });
            const c = dropDisc(r, l, s.id === t.user.id ? "🔴" : "🟡");
            return checkWin(r, c, l)
              ? ((i = !0),
                yield o.update({
                  content: `🎉 ${s.toString()} đã chiến thắng!`,
                  embeds: [
                    new discord_js_1.EmbedBuilder()
                      .setTitle("Trò chơi Cờ Connect 4")
                      .setDescription(getBoardAsString(r))
                      .addFields({
                        name: "Trạng thái",
                        value: `${getPlayerDisc(t, s.id)} | ${s.toString()} đã thắng trò chơi Connect 4`,
                      })
                      .setColor(e.config.GeneralSettings.EmbedColor),
                  ],
                  components: generateComponentsBoard(!0),
                }),
                d.stop())
              : checkDraw(r)
                ? ((i = !0),
                  yield o.update({
                    content: "Kết quả hòa!",
                    embeds: [
                      new discord_js_1.EmbedBuilder()
                        .setTitle("Trò chơi Cờ Connect 4")
                        .setDescription(getBoardAsString(r))
                        .addFields({
                          name: "Trạng thái",
                          value: "Trận đấu hòa! Không ai giành chiến thắng!",
                        })
                        .setColor(e.config.GeneralSettings.EmbedColor),
                    ],
                    components: generateComponentsBoard(!0),
                  }),
                  d.stop())
                : ((s = s.id === t.user.id ? n : t.user),
                  void (yield o.update({
                    content: `Đến lượt của ${s.toString()}`,
                    embeds: [
                      new discord_js_1.EmbedBuilder()
                        .setTitle("Trò chơi Cờ Connect 4")
                        .setDescription(getBoardAsString(r))
                        .addFields({
                          name: "Trạng thái",
                          value: `${getPlayerDisc(t, s.id)} | Đến lượt của ${s.toString()}`,
                        })
                        .setColor(e.config.GeneralSettings.EmbedColor),
                    ],
                    components: generateComponentsBoard(),
                  })));
          }),
        ),
          d.on("end", () => {
            i ||
              t.editReply({
                content: "Trò chơi đã kết thúc do quá thời gian chờ.",
                embeds: [
                  new discord_js_1.EmbedBuilder()
                    .setTitle("Trò chơi Cờ Connect 4")
                    .setDescription(getBoardAsString(r))
                    .setColor(e.config.GeneralSettings.EmbedColor),
                ],
                components: generateComponentsBoard(!0),
              });
          }));
      } catch (error) {
        console.error("[connect4] Error:", error);
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
