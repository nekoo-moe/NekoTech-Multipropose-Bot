"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  isVoiceChannel_1 = tslib_1.__importDefault(
    require("../../helpers/isVoiceChannel"),
  ),
  Command_1 = require("../../structures/Command");
exports.default = new Command_1.Command({
  name: "play",
  description: "Thêm một bài hát vào hàng đợi và phát nhạc",
  options: [
    {
      name: "song",
      description: "Tên bài hát hoặc liên kết (link) nhạc cần phát",
      type: discord_js_1.ApplicationCommandOptionType.String,
      required: !0,
    },
  ],
  run: ({ client: e, interaction: i }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      const n = i.options.getString("song");
      (0, isVoiceChannel_1.default)(i) &&
        (yield i.deferReply(),
        yield e.distube.play(i.member.voice.channel, n, {
          member: i.member,
          textChannel: i.channel,
          metadata: i,
        }));
    }),
});
