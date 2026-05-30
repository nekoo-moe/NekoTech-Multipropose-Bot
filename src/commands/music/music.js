"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  isVoiceChannel_1 = tslib_1.__importDefault(
    require("../../helpers/isVoiceChannel"),
  ),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll"));

exports.default = new Command_1.Command({
  name: "music",
  description: "Các lệnh phát nhạc",
  options: [
    {
      name: "play",
      description: "Thêm một bài hát vào hàng đợi và phát nhạc",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "song",
          description: "Tên bài hát hoặc liên kết (link) nhạc cần phát",
          type: discord_js_1.ApplicationCommandOptionType.String,
          required: !0,
        },
      ],
    },
    {
      name: "skip",
      description: "Bỏ qua bài hát đang phát",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "stop",
      description: "Dừng phát nhạc và xóa sạch hàng đợi",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "pause",
      description: "Tạm dừng phát nhạc",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "resume",
      description: "Tiếp tục phát nhạc",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "join",
      description: "Yêu cầu bot tham gia vào kênh thoại của bạn",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "leave",
      description: "Yêu cầu bot rời khỏi kênh thoại hiện tại",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "nowplaying",
      description: "Xem thông tin bài hát đang phát",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "volume",
      description: "Điều chỉnh âm lượng của bot",
      type: discord_js_1.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "level",
          description: "Mức âm lượng cần thiết lập (0-100)",
          type: discord_js_1.ApplicationCommandOptionType.Integer,
          required: !0,
          minValue: 0,
          maxValue: 100,
        },
      ],
    },
  ],
  run: ({ client: e, interaction: i }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
        const sub = i.options.getSubcommand();

        // ── play ──────────────────────────────────────────────────────────────
        if (sub === "play") {
          const n = i.options.getString("song");
          if (!(0, isVoiceChannel_1.default)(i)) return;
          yield i.deferReply();
          yield e.distube.play(i.member.voice.channel, n, {
            member: i.member,
            textChannel: i.channel,
            metadata: i,
          });
          return;
        }

        // ── join ──────────────────────────────────────────────────────────────
        if (sub === "join") {
          if (!(0, isVoiceChannel_1.default)(i)) return;
          yield e.distube.voices.join(i.member.voice.channel);
          return i.reply({
            embeds: [(0, replaceAll_1.default)(e.messages.Embeds.MusicJoinEmbed)],
          });
        }

        // ── leave ─────────────────────────────────────────────────────────────
        if (sub === "leave") {
          if (!(0, isVoiceChannel_1.default)(i)) return;
          const q = e.distube.getQueue(i.guildId);
          if (q) yield q.stop();
          e.distube.voices.leave(i.guild);
          return i.reply({
            embeds: [(0, replaceAll_1.default)(e.messages.Embeds.MusicLeaveEmbed)],
          });
        }

        // ── nowplaying ────────────────────────────────────────────────────────
        if (sub === "nowplaying") {
          const q = e.distube.getQueue(i.guildId);
          if (!q || !q.songs.length)
            return i.reply({
              embeds: [(0, replaceAll_1.default)(e.messages.Embeds.MusicNoSongEmbed)],
            });
          const u = q.songs[0],
            s = q.paused ? "🔴" : "🟢",
            a = Math.floor((q.currentTime / u.duration) * 30);
          return i.reply({
            embeds: [
              (0, replaceAll_1.default)(e.messages.Embeds.MusicNowPlayingEmbed, {
                "{name}": u.name,
                "{url}": u.url,
                "{thumbnail}": u.thumbnail,
                "{volume}": q.volume,
                "{queue}": q.songs.length,
                "{user-tag}": u.user.tag,
                "{uploader-name}": u.uploader.name,
                "{uploader-url}": u.uploader.url,
                "{likes}": u.likes,
                "{views}": u.views,
                "{emoji}": s,
                "{duration}": "─".repeat(a) + "🔘" + "─".repeat(30 - a),
              }),
            ],
          });
        }

        // ── volume ────────────────────────────────────────────────────────────
        if (sub === "volume") {
          if (!(0, isVoiceChannel_1.default)(i)) return;
          const level = i.options.getInteger("level");
          const q = e.distube.getQueue(i.guildId);
          if (!q || !q.songs.length)
            return i.reply({
              embeds: [(0, replaceAll_1.default)(e.messages.Embeds.MusicNoSongEmbed)],
            });
          q.setVolume(level);
          return i.reply({
            embeds: [
              (0, replaceAll_1.default)(e.messages.Embeds.MusicVolumeSet, {
                "{volume}": level,
              }),
            ],
          });
        }

        // ── skip / stop / pause / resume — require queue ──────────────────────
        if (!(0, isVoiceChannel_1.default)(i)) return;
        const q = e.distube.getQueue(i.guildId);
        if (!q || !q.songs.length)
          return i.reply({
            embeds: [(0, replaceAll_1.default)(e.messages.Embeds.MusicNoSongEmbed)],
          });

        if (sub === "skip") {
          yield q.skip();
          return i.reply({
            embeds: [(0, replaceAll_1.default)(e.messages.Embeds.MusicSkipEmbed)],
          });
        }

        if (sub === "stop") {
          yield q.stop();
          return i.reply({
            embeds: [(0, replaceAll_1.default)(e.messages.Embeds.MusicStopEmbed)],
          });
        }

        if (sub === "pause") {
          q.pause();
          return i.reply({
            embeds: [(0, replaceAll_1.default)(e.messages.Embeds.MusicPauseEmbed)],
          });
        }

        if (sub === "resume") {
          q.resume();
          return i.reply({
            embeds: [(0, replaceAll_1.default)(e.messages.Embeds.MusicResumeEmbed)],
          });
        }

      } catch (error) {
        console.error("[music] Error:", error);
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
