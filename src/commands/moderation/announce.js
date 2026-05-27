"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  Command_1 = require("../../structures/Command");
module.exports = new Command_1.Command({
  name: "announce",
  description: "Gửi tin nhắn hoặc mã embed tới một kênh chat",
  options: [
    {
      name: "code",
      description: "Mã JSON của tin nhắn hoặc mã nhúng (embed) cần gửi",
      type: discord_js_1.ApplicationCommandOptionType.String,
      required: !0,
    },
    {
      name: "channel",
      description: "Kênh chat để gửi tin nhắn tới",
      type: discord_js_1.ApplicationCommandOptionType.Channel,
      channelTypes: [
        discord_js_1.ChannelType.GuildText,
        discord_js_1.ChannelType.GuildNews,
      ],
      required: !1,
    },
  ],
  run: ({ client: e, interaction: o }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      var n, s;
      const d = o.options.getChannel("channel") || o.channel;
      try {
        const e = JSON.parse(o.options.getString("code"));
        ((null === (n = null == e ? void 0 : e.embed) || void 0 === n
          ? void 0
          : n.color) &&
          "string" ==
            typeof (null === (s = null == e ? void 0 : e.embed) || void 0 === s
              ? void 0
              : s.color) &&
          (e.embed.color = (0, discord_js_1.resolveColor)(e.embed.color)),
          (null == e ? void 0 : e.embed) && (e.embeds = [e.embed]),
          delete e.embed,
          yield d.send(e));
      } catch (e) {
        return o.reply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle("Lỗi khi gửi tin nhắn")
              .setDescription(e.message)
              .setColor("Red"),
          ],
          ephemeral: !0,
        });
      }
      yield o.reply({
        embeds: [
          new discord_js_1.EmbedBuilder()
            .setTitle("Tin nhắn đã được gửi thành công!")
            .setDescription(`✅ Tin nhắn đã được gửi đến ${d.toString()}`)
            .setColor(e.config.GeneralSettings.EmbedColor),
        ],
        ephemeral: !0,
      });
    }),
});
