"use strict";

const descriptions = {
  "add-emoji": "Thêm biểu tượng cảm xúc (emoji) vào máy chủ",
  "backup": "Quản lý sao lưu dữ liệu máy chủ",
  "custom-commands": "Tạo và quản lý lệnh tùy chỉnh cho máy chủ của bạn",
  "eval": "Chạy thử mã Javascript (chỉ dành cho Owner)",
  "giveaway": "Quản lý sự kiện quà tặng (giveaway)",
  "give-level": "Cấp cấp độ (level) cho một thành viên",
  "give-money": "Cấp tiền xu cho một thành viên",
  "give-xp": "Cấp điểm kinh nghiệm (XP) cho một thành viên",
  "manage": "Quản lý cấu hình tính năng của máy chủ",
  "poll": "Tạo cuộc biểu quyết (bình chọn) trong kênh",
  "reaction-roles": "Quản lý vai trò nhận bằng biểu tượng cảm xúc",
  "role": "Gán vai trò tạm thời cho thành viên",
  "say": "Gửi một tin nhắn dưới danh nghĩa của bot",
  "set-level": "Thiết lập cấp độ (level) cho một thành viên",
  "set-money": "Thiết lập số tiền xu cho một thành viên",
  "set-xp": "Thiết lập điểm kinh nghiệm (XP) cho một thành viên",
  "setup": "Cài đặt các tính năng chính của máy chủ",
  "snipe": "Xem các tin nhắn vừa bị xóa gần đây",
  "suggestion": "Quản lý các ý kiến đóng góp của thành viên",
  "take-money": "Thu hồi tiền xu của một thành viên",
  "ticket-manage": "Cài đặt và quản lý hệ thống Phiếu Hỗ Trợ (Ticket)",
  "verify": "Gửi tin nhắn xác minh captcha thành viên",
  "balance": "Kiểm tra số dư tài khoản của bạn hoặc người khác",
  "blackjack": "Chơi trò chơi Blackjack cá cược",
  "daily": "Nhận phần thưởng điểm danh hàng ngày",
  "deposit": "Gửi tiền mặt của bạn vào tài khoản ngân hàng",
  "pay": "Chuyển tiền xu của bạn cho một thành viên khác",
  "rob": "Thử cướp tiền mặt từ một thành viên khác",
  "weekly": "Nhận phần thưởng hàng tuần",
  "withdraw": "Rút tiền xu từ tài khoản ngân hàng về ví tiền mặt",
  "work": "Làm việc chăm chỉ để kiếm tiền xu",
  "connect4": "Chơi cờ Connect 4 với bạn bè",
  "dream": "Tạo hình ảnh nghệ thuật bằng trí tuệ nhân tạo (AI)",
  "gtn": "Chơi trò chơi đoán số từ 1 đến 1000",
  "rps": "Chơi trò chơi Kéo Búa Bao với bạn bè",
  "ship": "Kiểm tra mức độ đẹp đôi giữa hai thành viên",
  "slots": "Chơi máy đánh bạc Slots may mắn",
  "tic-tac-toe": "Chơi trò chơi Cờ Ca-rô (Tic Tac Toe) với bạn bè",
  "wordle": "Chơi trò chơi đoán chữ Wordle nổi tiếng",
  "afk": "Thiết lập hoặc tắt trạng thái treo máy (AFK)",
  "avatar": "Tải ảnh đại diện (avatar) của thành viên",
  "help": "Xem danh mục các lệnh hỗ trợ của bot",
  "invites": "Xem số lượng lời mời thành viên của bạn hoặc người khác",
  "leaderboard": "Xem các bảng xếp hạng (kinh tế, cấp độ, tin nhắn...)",
  "messages": "Xem số lượng tin nhắn đã gửi của bạn hoặc người khác",
  "rank": "Kiểm tra cấp độ và kinh nghiệm hiện tại của bạn",
  "serverinfo": "Xem thông tin chi tiết về máy chủ Discord này",
  "serverip": "Truy xuất thông tin chi tiết về một máy chủ Minecraft",
  "suggest": "Gửi ý kiến đóng góp hoặc phản hồi tới Ban quản trị",
  "userinfo": "Xem thông tin chi tiết về một thành viên",
  "weather": "Xem thông tin thời tiết hiện tại của một thành phố",
  "announce": "Gửi tin nhắn hoặc bảng thông báo (embed) vào một kênh",
  "ban": "Cấm hoặc gỡ cấm một thành viên khỏi máy chủ",
  "clear": "Xóa nhanh một số lượng tin nhắn trong kênh chat",
  "kick": "Trục xuất một thành viên khỏi máy chủ",
  "nuke": "Xóa sạch hoàn toàn và tạo lại kênh chat hiện tại",
  "warn": "Quản lý và cảnh cáo thành viên vi phạm luật",
  "join": "Yêu cầu bot tham gia vào kênh thoại của bạn",
  "leave": "Yêu cầu bot rời khỏi kênh thoại hiện tại",
  "nowplaying": "Xem thông tin bài hát hiện tại đang được phát",
  "pause": "Tạm dừng phát bài hát hiện tại",
  "play": "Thêm một bài hát vào danh sách phát và phát nhạc",
  "resume": "Tiếp tục phát lại bài hát đang tạm dừng",
  "skip": "Bỏ qua bài hát hiện tại sang bài tiếp theo",
  "stop": "Dừng phát nhạc hoàn toàn và dọn sạch danh sách chờ",
  "volume": "Điều chỉnh âm lượng phát nhạc của bot",
  "add": "Thêm một thành viên vào phiếu hỗ trợ hiện tại",
  "alert": "Gửi tin nhắn cảnh báo thành viên về ticket của họ",
  "claim": "Nhận hỗ trợ giải quyết phiếu hỗ trợ (chỉ dành cho Staff)",
  "close": "Đóng phiếu hỗ trợ hiện tại",
  "open": "Mở lại phiếu hỗ trợ đã đóng",
  "remove": "Xóa một thành viên khỏi phiếu hỗ trợ hiện tại",
  "rename": "Đổi tên kênh phiếu hỗ trợ hiện tại",

  // Specific Subcommands and Option Descriptions
  "afk.enable": "Kích hoạt trạng thái treo máy (AFK)",
  "afk.disable": "Vô hiệu hóa trạng thái treo máy (AFK)",
  "afk.list": "Hiển thị danh sách thành viên đang treo máy",
  "backup.create": "Tạo bản sao lưu máy chủ mới",
  "backup.delete": "Xóa bản sao lưu máy chủ đã tạo",
  "backup.list": "Hiển thị danh sách các bản sao lưu",
  "custom-commands.create": "Tạo một lệnh tùy chỉnh mới",
  "custom-commands.delete": "Xóa một lệnh tùy chỉnh hiện tại",
  "custom-commands.list": "Hiển thị danh sách lệnh tùy chỉnh",
  "leaderboard.messages": "Bảng xếp hạng số lượng tin nhắn chat",
  "leaderboard.invites": "Bảng xếp hạng số lượt mời thành viên",
  "leaderboard.levels": "Bảng xếp hạng cấp độ hoạt động",
  "leaderboard.economy": "Bảng xếp hạng phú hộ tiền xu",
  "leaderboard.voice": "Bảng xếp hạng thời gian tham gia voice",
  "ban.add": "Thực hiện lệnh cấm thành viên",
  "ban.delete": "Thực hiện gỡ cấm cho một thành viên",
  "ban.list": "Danh sách các thành viên bị cấm",
  "kick.add": "Thực hiện trục xuất thành viên",
  "kick.delete": "Xóa lịch sử trục xuất của thành viên",
  "kick.list": "Danh sách các lượt trục xuất",
  "warn.add": "Thêm cảnh cáo cho thành viên",
  "warn.delete": "Gỡ bỏ cảnh cáo cho thành viên",
  "warn.list": "Danh sách các lượt cảnh cáo"
};

const optionDescriptions = {
  "user": "Thành viên cần chỉ định",
  "member": "Thành viên cần chỉ định",
  "amount": "Số lượng xu",
  "reason": "Lý do thực hiện hành động",
  "channel": "Kênh chat cần chỉ định",
  "name": "Tên",
  "description": "Mô tả",
  "emoji": "Biểu tượng cảm xúc",
  "style": "Kiểu hiển thị",
  "role": "Vai trò cần chỉ định",
  "roles": "Các vai trò cần chỉ định",
  "category": "Danh mục cần chỉ định",
  "questions": "Các câu hỏi",
  "enable": "Kích hoạt",
  "disable": "Vô hiệu hóa",
  "list": "Hiển thị danh sách",
  "create": "Tạo mới",
  "delete": "Xóa bỏ",
  "edit": "Chỉnh sửa",
  "setup": "Cài đặt cấu hình",
  "send": "Gửi đi",
  "time": "Thời gian (ví dụ: 1h, 1d...)",
  "prompt": "Từ khóa yêu cầu tạo ảnh",
  "bet": "Số tiền đặt cược",
  "ip": "Địa chỉ IP hoặc tên miền của máy chủ Minecraft",
  "city": "Thành phố cần kiểm tra thời tiết",
  "number": "Số lượng tin nhắn cần xóa",
  "song": "Tên bài hát hoặc đường liên kết YouTube",
  "volume": "Mức âm lượng cần thiết lập (1-100)"
};

function translateOptions(options, parentName = '') {
  if (!options || !Array.isArray(options)) return;
  
  for (const opt of options) {
    const specificKey = `${parentName}.${opt.name}`;
    
    if (descriptions[specificKey]) {
      opt.description = descriptions[specificKey];
    } else if (descriptions[opt.name]) {
      opt.description = descriptions[opt.name];
    } else if (optionDescriptions[opt.name]) {
      opt.description = optionDescriptions[opt.name];
    }
    
    if (opt.options && Array.isArray(opt.options)) {
      translateOptions(opt.options, specificKey || opt.name);
    }
  }
}

function translateCommand(cmd) {
  if (!cmd) return;
  
  if (descriptions[cmd.name]) {
    cmd.description = descriptions[cmd.name];
  }
  
  if (cmd.options && Array.isArray(cmd.options)) {
    translateOptions(cmd.options, cmd.name);
  }
}

module.exports = {
  translateCommand
};
