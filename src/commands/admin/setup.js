"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  Dashboard_1 = require("../../structures/Dashboard"),
  discord_js_1 = require("discord.js"),
  welcomeCard_1 = tslib_1.__importDefault(
    require("../../helpers/images/welcomeCard"),
  ),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll")),
  querys_1 = require("../../helpers/querys");
exports.default = new Command_1.Command({
  name: "setup",
  description: "Thiết lập cấu hình các tính năng của bot cho máy chủ",
  run: ({ interaction: e, client: t }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      let i = yield (0, querys_1.guilds)().get(e.guildId);
      const s = new Dashboard_1.Dashboard({ client: t }).addOptions([
        {
          name: "Cài đặt chung",
          description: "Cấu hình các tùy chọn chung của bot",
          emoji: "🛠️",
          settings: [
            {
              name: "Kênh Nhật Ký",
              description:
                "Kênh gửi toàn bộ nhật ký (logs) mà bot ghi nhận được",
              type: Dashboard_1.CategoryTypes.Channel,
              style: discord_js_1.ButtonStyle.Secondary,
              emoji: "📜",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { logChannel: e } });
                }),
            },
            {
              name: "Kênh Boost",
              description:
                "Kênh gửi tin nhắn khi có thành viên nâng cấp (boost) máy chủ",
              type: Dashboard_1.CategoryTypes.Channel,
              style: discord_js_1.ButtonStyle.Primary,
              emoji: "✨",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { boostChannel: e } });
                }),
            },
          ],
        },
        {
          name: "Cài đặt Vé (Ticket)",
          description: "Thay đổi kênh lưu bản ghi và giới hạn số lượng vé hỗ trợ",
          emoji: "🎫",
          settings: [
            {
              name: "Số vé tối đa mỗi người",
              description:
                "Cấu hình số lượng vé tối đa mà một thành viên có thể mở cùng lúc",
              type: Dashboard_1.CategoryTypes.Number,
              style: discord_js_1.ButtonStyle.Primary,
              emoji: "👥",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "ticketConfig.maxTickets": e } });
                }),
            },
            {
              name: "Kênh Bản Ghi (Transcript)",
              description:
                "Kênh lưu lịch sử đoạn chat của các vé hỗ trợ sau khi đóng",
              type: Dashboard_1.CategoryTypes.Channel,
              style: discord_js_1.ButtonStyle.Secondary,
              emoji: "📰",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({
                    $set: { "ticketConfig.transcriptChannel": e },
                  });
                }),
            },
            {
              name: "Lưu bản ghi khi đóng",
              description:
                "Tự động lưu và gửi bản ghi đoạn chat khi vé hỗ trợ bị xóa",
              type: Dashboard_1.CategoryTypes.Boolean,
              style: discord_js_1.ButtonStyle.Success,
              emoji: "🥤",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({
                    $set: { "ticketConfig.autoSaveTranscript": e },
                  });
                }),
            },
            {
              name: "Gửi bản ghi cho người dùng",
              description:
                "Bạn có muốn bot gửi bản ghi lịch sử chat trực tiếp vào tin nhắn riêng (DM) của thành viên không?",
              type: Dashboard_1.CategoryTypes.Boolean,
              style: discord_js_1.ButtonStyle.Danger,
              emoji: "🔊",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({
                    $set: {
                      "ticketConfig.transcriptType": e ? "user" : "channel",
                    },
                  });
                }),
            },
            {
              name: "Loại Tin Nhắn",
              description: "Loại giao diện vé sử dụng nút bấm hay thanh chọn danh mục (dropdown menu)?",
              type: Dashboard_1.CategoryTypes.Questions,
              choices: [
                {
                  name: "Nút bấm",
                  value: "buttons",
                  emoji: "✅",
                  style: discord_js_1.ButtonStyle.Secondary,
                },
                {
                  name: "Thanh chọn (Menu)",
                  value: "menus",
                  emoji: "📁",
                  style: discord_js_1.ButtonStyle.Primary,
                },
              ],
              style: discord_js_1.ButtonStyle.Secondary,
              emoji: "🥤",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({
                    $set: { "ticketConfig.messageType": e },
                  });
                }),
            },
            {
              name: "Thiết Kế Embed Gửi Panel",
              description: "Định cấu hình giao diện (Embed) cho tin nhắn gửi panel tạo ticket. Gửi mã JSON từ web embed.strider.top",
              type: Dashboard_1.CategoryTypes.WebsiteEmbed,
              style: discord_js_1.ButtonStyle.Success,
              emoji: "🎨",
              fetch: () =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  return {
                    data: {
                      content: "Bản xem trước Embed hiện tại của bạn:",
                      embeds: [
                        i.ticketConfig.customEmbed ? (i.ticketConfig.customEmbed.embeds ? i.ticketConfig.customEmbed.embeds[0] : i.ticketConfig.customEmbed) : t.messages.Embeds.CreateTicketEmbed,
                      ],
                    },
                  };
                }),
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({
                    $set: { "ticketConfig.customEmbed": e },
                  });
                }),
            },
          ],
        },
        {
          name: "Cài đặt Góp Ý",
          description: "Cấu hình kênh nhận ý kiến đóng góp và các thiết lập liên quan",
          emoji: "🔔",
          settings: [
            {
              name: "Kênh Góp Ý",
              description:
                "Kênh nhận các tin nhắn đóng góp ý kiến sau khi thành viên sử dụng lệnh",
              style: discord_js_1.ButtonStyle.Primary,
              type: Dashboard_1.CategoryTypes.Channel,
              emoji: "📰",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({
                    $set: { "suggestionConfig.channel": e },
                  });
                }),
            },
            {
              name: "Emoji Tán Thành",
              description:
                "Thay đổi emoji nút bình chọn tán thành (upvote)",
              style: discord_js_1.ButtonStyle.Success,
              type: Dashboard_1.CategoryTypes.String,
              emoji: "👍",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "suggestionConfig.upvote": e } });
                }),
            },
            {
              name: "Emoji Phản Đối",
              description:
                "Thay đổi emoji nút bình chọn phản đối (downvote)",
              style: discord_js_1.ButtonStyle.Danger,
              type: Dashboard_1.CategoryTypes.String,
              emoji: "👎",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({
                    $set: { "suggestionConfig.downvote": e },
                  });
                }),
            },
            {
              name: "Vô hiệu hóa nút",
              description:
                "Vô hiệu hóa các nút bấm khi quản trị viên phê duyệt hoặc từ chối ý kiến đóng góp",
              style: discord_js_1.ButtonStyle.Primary,
              type: Dashboard_1.CategoryTypes.Boolean,
              emoji: "📁",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({
                    $set: { "suggestionConfig.disable": e },
                  });
                }),
            },
          ],
        },
        {
          name: "Cài đặt Chào Mừng",
          description: "Cấu hình tin nhắn chào mừng và tự cấp vai trò thành viên mới",
          emoji: "👋",
          settings: [
            {
              name: "Kênh Chào Mừng",
              description:
                "Kênh gửi tin nhắn chào mừng mỗi khi có thành viên mới tham gia máy chủ",
              style: discord_js_1.ButtonStyle.Secondary,
              type: Dashboard_1.CategoryTypes.Channel,
              emoji: "🦿",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "welcomeSettings.channel": e } });
                }),
            },
            {
              name: "Tin Nhắn Chào Mừng",
              description:
                "Cấu hình nội dung tin nhắn chào mừng (dạng embed). Bạn có thể thiết lập mẫu trên [website](https://embed.strider.top/)\n\n\t\t\t\t\t\t\t__**Các từ khóa hỗ trợ:**__\n\t\t\t\t\t\t\t• {user-tag} {user-avatar} {guild-icon} {user-id} {user-name} {guild-name} {memberCount} {createdTimestamp} {joinedTimestamp} {inviter-mention} {inviter-tag} {inviter-name} {inviter-id} {code} {card-url} {invites}",
              style: discord_js_1.ButtonStyle.Primary,
              type: Dashboard_1.CategoryTypes.WebsiteEmbed,
              emoji: "📜",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "welcomeSettings.message": e } });
                }),
              fetch: () =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  i = yield (0, querys_1.guilds)().get(e.guildId);
                  const { welcomeSettings: s } = i,
                    o = e.member,
                    n = [];
                  if (JSON.stringify(s.message).includes("{card-url}")) {
                    const e = yield (0, welcomeCard_1.default)(o);
                    n.push(
                      new discord_js_1.AttachmentBuilder(e, {
                        name: "welcome-card.jpg",
                      }),
                    );
                  }
                  const a = {
                    "{user-tag}": o.user.tag,
                    "{user-avatar}": o.user.displayAvatarURL(),
                    "{guild-icon}": o.guild.iconURL(),
                    "{user-id}": o.id,
                    "{user-name}": o.user.username,
                    "{guild-name}": o.guild.name,
                    "{memberCount}": o.guild.memberCount,
                    "{createdTimestamp}": Math.floor(
                      o.user.createdTimestamp / 1e3,
                    ),
                    "{joinedTimestamp}": Math.floor(o.joinedTimestamp / 1e3),
                    "{inviter-mention}": `<@!${t.user.id}>`,
                    "{inviter-tag}": `${t.user.tag || "Unknown#0001"}`,
                    "{inviter-name}": `${t.user.username || "Unknown"}`,
                    "{inviter-id}": `${t.user.id}`,
                    "{code}": "VPemjmcM",
                    "{card-url}": "attachment://welcome-card.jpg",
                    "{invites}": 12,
                  };
                  return {
                    data: (0, replaceAll_1.default)(s.message, a),
                    attachments: n,
                  };
                }),
            },
            {
              name: "Vai Trò Tự Động",
              description:
                "Tự động cấp vai trò (role) cho thành viên khi họ vừa vào máy chủ",
              style: discord_js_1.ButtonStyle.Success,
              type: Dashboard_1.CategoryTypes.Roles,
              emoji: "⛏",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({
                    $set: { "welcomeSettings.autoRoles": e },
                  });
                }),
            },
          ],
        },
        {
          name: "Cài đặt Tạm Biệt",
          description: "Cấu hình tin nhắn tạm biệt khi thành viên rời máy chủ",
          emoji: "⛩️",
          settings: [
            {
              name: "Kênh Tạm Biệt",
              description:
                "Kênh gửi tin nhắn thông báo mỗi khi có thành viên rời khỏi máy chủ",
              style: discord_js_1.ButtonStyle.Secondary,
              type: Dashboard_1.CategoryTypes.Channel,
              emoji: "🦿",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "goodbyeSettings.channel": e } });
                }),
            },
            {
              name: "Tin Nhắn Tạm Biệt",
              description:
                "Cấu hình nội dung tin nhắn tạm biệt (dạng embed). Bạn có thể thiết lập mẫu trên [website](https://embed.strider.top/)\n\n\t\t\t\t\t\t\t__**Các từ khóa hỗ trợ:**__\n\t\t\t\t\t\t\t• {user-tag} {user-avatar} {user-id} {user-name} {guild-icon} {guild-name} {memberCount} {joinedTimestamp}",
              style: discord_js_1.ButtonStyle.Primary,
              type: Dashboard_1.CategoryTypes.WebsiteEmbed,
              maxLength: 2048,
              emoji: "📜",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "goodbyeSettings.message": e } });
                }),
            },
          ],
        },
        {
          name: "Cài đặt Xác Minh",
          description: "Cấu hình hệ thống xác minh thành viên mới",
          emoji: "🛡️",
          settings: [
            {
              name: "Vai Trò Xác Minh",
              description:
                "Vai trò sẽ được cấp cho thành viên sau khi xác minh thành công",
              emoji: "👤",
              style: discord_js_1.ButtonStyle.Primary,
              type: Dashboard_1.CategoryTypes.Role,
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "verifySettings.roleId": e } });
                }),
            },
            {
              name: "Phương Thức Xác Minh",
              description: "Chọn phương thức xác minh thành viên",
              emoji: "🎨",
              style: discord_js_1.ButtonStyle.Secondary,
              type: Dashboard_1.CategoryTypes.Questions,
              choices: [
                {
                  name: "Mã Captcha (Xác minh hình ảnh)",
                  emoji: "👮‍♂️",
                  style: discord_js_1.ButtonStyle.Primary,
                  value: "captcha",
                },
                {
                  name: "Trực tiếp (Nhấn nút để xác minh)",
                  emoji: "✈",
                  style: discord_js_1.ButtonStyle.Secondary,
                  value: "direct",
                },
              ],
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "verifySettings.type": e } });
                }),
            },
          ],
        },
        {
          name: "Cài đặt Cấp Độ (Levels)",
          description: "Cấu hình hệ thống điểm kinh nghiệm và cấp độ",
          emoji: "✨",
          settings: [
            {
              name: "XP Tối Đa mỗi tin nhắn",
              description: "Số điểm kinh nghiệm tối đa nhận được trên mỗi tin nhắn",
              style: discord_js_1.ButtonStyle.Secondary,
              type: Dashboard_1.CategoryTypes.Number,
              emoji: "⬆️",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "levelsConfig.max": e } });
                }),
            },
            {
              name: "XP Tối Thiểu mỗi tin nhắn",
              description: "Số điểm kinh nghiệm tối thiểu nhận được trên mỗi tin nhắn",
              style: discord_js_1.ButtonStyle.Secondary,
              type: Dashboard_1.CategoryTypes.Number,
              emoji: "⬇️",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "levelsConfig.min": e } });
                }),
            },
            {
              name: "Kênh Báo Lên Cấp",
              description:
                "Kênh gửi tin nhắn chúc mừng khi thành viên lên cấp",
              type: Dashboard_1.CategoryTypes.Channel,
              style: discord_js_1.ButtonStyle.Secondary,
              emoji: "🏆",
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { levelUpChannel: e } });
                }),
            },
          ],
        },
        {
          name: "Cài đặt Bộ Lọc Bảo Mật",
          description: "Cấu hình bộ lọc kiểm duyệt tin nhắn tự động",
          emoji: "🕵",
          settings: [
            {
              name: "Chặn Liên Kết (Links)",
              description: "Tự động xóa tin nhắn chứa liên kết (web link) không hợp lệ",
              emoji: "🔗",
              style: discord_js_1.ButtonStyle.Secondary,
              type: Dashboard_1.CategoryTypes.Boolean,
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "filtersConfig.links": e } });
                }),
            },
            {
              name: "Chặn Lời Mời Discord",
              description: "Tự động xóa tin nhắn chứa liên kết mời tham gia server Discord khác",
              emoji: "⚠",
              style: discord_js_1.ButtonStyle.Primary,
              type: Dashboard_1.CategoryTypes.Boolean,
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "filtersConfig.invites": e } });
                }),
            },
            {
              name: "Chặn Ghost Ping",
              description: "Phát hiện và cảnh báo các hành vi tag người dùng rồi xóa tin nhắn",
              emoji: "🔉",
              style: discord_js_1.ButtonStyle.Primary,
              type: Dashboard_1.CategoryTypes.Boolean,
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "filtersConfig.ghostPing": e } });
                }),
            },
            {
              name: "Vai Trò Ngoại Lệ",
              description:
                "Các vai trò có quyền gửi liên kết/lời mời mà không bị bộ lọc ảnh hưởng",
              emoji: "👥",
              style: discord_js_1.ButtonStyle.Success,
              type: Dashboard_1.CategoryTypes.Roles,
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({
                    $set: { "filtersConfig.bypassRoles": e },
                  });
                }),
            },
            {
              name: "Áp dụng trong Tickets",
              description: "Bật hoặc tắt bộ lọc kiểm duyệt tin nhắn bên trong các kênh ticket hỗ trợ",
              emoji: "🎫",
              style: discord_js_1.ButtonStyle.Danger,
              type: Dashboard_1.CategoryTypes.Boolean,
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "filtersConfig.inTickets": e } });
                }),
            },
          ],
        },
        {
          name: "Cài đặt Kinh Tế",
          description: "Cấu hình hệ thống kinh tế và phần thưởng xu",
          emoji: "💰",
          settings: [
            {
              name: "Emoji Biểu Tượng Tiền",
              emoji: "🪙",
              description: "Emoji đại diện cho đơn vị tiền tệ của máy chủ (Ví dụ: 🪙)",
              type: Dashboard_1.CategoryTypes.String,
              style: discord_js_1.ButtonStyle.Secondary,
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "economyConfig.coin": e } });
                }),
            },
            {
              name: "Thưởng Điểm Danh Hàng Ngày",
              emoji: "👑",
              description:
                "Số xu thưởng nhận được khi điểm danh mỗi 24 giờ",
              type: Dashboard_1.CategoryTypes.String,
              style: discord_js_1.ButtonStyle.Primary,
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({
                    $set: { "economyConfig.dailyReward": e },
                  });
                }),
            },
            {
              name: "Thưởng Hàng Tuần",
              emoji: "📅",
              description:
                "Số xu thưởng nhận được khi điểm danh hàng tuần (mỗi 7 ngày)",
              type: Dashboard_1.CategoryTypes.String,
              style: discord_js_1.ButtonStyle.Success,
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({
                    $set: { "economyConfig.weeklyReward": e },
                  });
                }),
            },
            {
              name: "Xu Công Việc Tối Đa",
              emoji: "📤",
              description:
                "Số xu tối đa có thể nhận được khi làm việc (lệnh /work)",
              type: Dashboard_1.CategoryTypes.String,
              style: discord_js_1.ButtonStyle.Primary,
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "economyConfig.maxMoney": e } });
                }),
            },
            {
              name: "Xu Công Việc Tối Thiểu",
              emoji: "📥",
              description:
                "Số xu tối thiểu nhận được khi làm việc (lệnh /work)",
              type: Dashboard_1.CategoryTypes.String,
              style: discord_js_1.ButtonStyle.Danger,
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "economyConfig.minMoney": e } });
                }),
            },
            {
              name: "Hệ số Blackjack",
              emoji: "🃏",
              description: "Hệ số nhân tiền thưởng khi thắng trò chơi bài Blackjack",
              type: Dashboard_1.CategoryTypes.Number,
              style: discord_js_1.ButtonStyle.Success,
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({
                    $set: { "economyConfig.blackjackReward": e },
                  });
                }),
            },
          ],
        },
        {
          name: "Cài đặt Starboard",
          description: "Cấu hình hệ thống bảng vinh danh tin nhắn nổi bật (Starboard)",
          emoji: "⭐",
          settings: [
            {
              name: "Kích Hoạt",
              emoji: "✔",
              description: "Bật hoặc tắt chức năng Starboard",
              type: Dashboard_1.CategoryTypes.Boolean,
              style: discord_js_1.ButtonStyle.Primary,
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "starboardConfig.enabled": e } });
                }),
            },
            {
              name: "Kênh Starboard",
              emoji: "📢",
              description: "Kênh gửi các tin nhắn nổi bật đạt đủ số sao yêu cầu",
              type: Dashboard_1.CategoryTypes.Channel,
              style: discord_js_1.ButtonStyle.Primary,
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({ $set: { "starboardConfig.channel": e } });
                }),
            },
            {
              name: "Số Sao Tối Thiểu",
              emoji: "⭐",
              description:
                "Số lượng phản ứng emoji ngôi sao (⭐) tối thiểu để tin nhắn được vinh danh",
              type: Dashboard_1.CategoryTypes.Number,
              style: discord_js_1.ButtonStyle.Primary,
              save: (e) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  yield i.updateOne({
                    $set: { "starboardConfig.minStars": e },
                  });
                }),
            },
          ],
        },
      ]);
      yield s.setup(e);
    }),
});
