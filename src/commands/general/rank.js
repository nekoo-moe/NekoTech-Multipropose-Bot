"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  Command_1 = require("../../structures/Command"),
  UserModel_1 = tslib_1.__importDefault(require("../../models/UserModel")),
  canvacord_1 = require("canvacord");
exports.default = new Command_1.Command({
  name: "rank",
  description: "Xem thẻ cấp độ (rank card) của bạn hoặc thành viên khác",
  options: [
    {
      name: "user",
      description: "Thành viên bạn muốn xem cấp độ",
      type: discord_js_1.ApplicationCommandOptionType.User,
      required: !1,
    },
  ],
  run: ({ interaction: e }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
      yield e.deferReply();
      const r = e.options.getUser("user") || e.user;
      let d = yield UserModel_1.default.findOne({
        ownerId: r.id,
        guildId: e.guildId,
      });
      d ||
        (d = yield UserModel_1.default.create({
          ownerId: r.id,
          guildId: e.guildId,
          xp: 0,
          level: 0,
          messages: 1,
        }));
      const i = yield UserModel_1.default.find({ guildId: e.guildId }),
        s = new canvacord_1.Rank()
          .setRank(
            i.sort((e, r) => r.xp - e.xp).findIndex((e) => e.ownerId === r.id) +
              1,
          )
          .setRequiredXP((d.level + 1) * (d.level + 1) * 100)
          .setAvatar(r.displayAvatarURL({ extension: "png" }))
          .setProgressBar("#FFFFFF", "COLOR", !0)
          .setDiscriminator("0" === r.discriminator ? "0001" : r.discriminator)
          .setUsername(r.username)
          .setCurrentXP(d.xp)
          .setLevel(d.level)
          .setStatus("online");
      let t;
      try {
        t = yield s.build();
      } catch (renderError) {
        console.error("[rank] Canvas render error:", renderError);
        return e.followUp({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle("❌ Lỗi tạo ảnh rank card")
              .setDescription("Không thể tạo ảnh rank card. Vui lòng thử lại sau.")
              .setColor("Red"),
          ],
          ephemeral: true,
        });
      }
      e.followUp({
        files: [new discord_js_1.AttachmentBuilder(t, { name: "rank.png" })],
        content: `> **Thẻ cấp độ của • [**  ${r.tag}  **] •**`,
      });
      } catch (error) {
        console.error("[rank] Error:", error);
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
