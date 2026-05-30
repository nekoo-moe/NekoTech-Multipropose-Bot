"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll")),
  defaultEmojis = {
    tickets: "🎫",
    general: "📚",
    music: "🎧",
    moderation: "🔒",
    admin: "🕵️‍♀️",
    fun: "🥳",
    economy: "💰",
  };
exports.default = new Command_1.Command({
  name: "help",
  description: "Xem menu hướng dẫn và danh sách các lệnh của bot",
  run: ({ interaction: e, client: t }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
      const o = {},
        s = t.commands.toJSON(),
        n = (e = "") => {
          const t = [];
          let s = new discord_js_1.ActionRowBuilder();
          for (const n of Object.keys(o)) {
            const o = e === n || "all" === e,
              l =
                n === e || "all" === e
                  ? discord_js_1.ButtonStyle.Danger
                  : discord_js_1.ButtonStyle.Secondary;
            (s.addComponents(
              new discord_js_1.ButtonBuilder()
                .setLabel(n[0].toUpperCase() + n.slice(1))
                .setCustomId(`${n}`)
                .setEmoji(defaultEmojis[n] || "🔍")
                .setStyle(l)
                .setDisabled(o),
            ),
              5 === s.components.length &&
                (t.push(s), (s = new discord_js_1.ActionRowBuilder())));
          }
          return (s.components.length > 0 && t.push(s), t);
        };
      for (const e of s)
        (o[e.directory] || (o[e.directory] = []), o[e.directory].push(e));
      const l = yield e.reply({
          embeds: [
            (0, replaceAll_1.default)(t.messages.Embeds.HelpMainEmbed, {
              "{total-commands}": s.length,
            }),
          ],
          components: n(),
          fetchReply: !0,
        }),
        d = l.createMessageComponentCollector({
          filter: (t) =>
            t.user.id === e.user.id ||
            (t.reply({
              content: ":x: | Bạn không thể tương tác với menu hướng dẫn của người khác.",
              ephemeral: !0,
            }),
            !1),
          componentType: discord_js_1.ComponentType.Button,
          time: 6e4,
        });
      (d.on("collect", (e) =>
        tslib_1.__awaiter(void 0, void 0, void 0, function* () {
          yield e.deferUpdate();
          const s = e.customId,
            l = `\`${defaultEmojis[s] || "🔍"}\``;
          d.resetTimer();
          const i = o[s].map((e) =>
            (0, replaceAll_1.default)(t.messages.Strings.HelpCommandName, {
              "{name}": e.name,
            }),
          );
          yield e.editReply({
            embeds: [
              (0, replaceAll_1.default)(t.messages.Embeds.HelpCategoryEmbed, {
                "{emoji}": l,
                "{name}": s[0].toUpperCase() + s.slice(1),
                "{commands}": i.join(t.messages.Strings.HelpCommandJoin),
              }),
            ],
            components: n(s),
          });
        }),
      ),
        d.on("end", () => {
          l.edit({
            embeds: [
              (0, replaceAll_1.default)(t.messages.Embeds.HelpTimeOutEmbed),
            ],
            components: n("all"),
          });
        }));
      } catch (error) {
        console.error("[help] Error:", error);
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
