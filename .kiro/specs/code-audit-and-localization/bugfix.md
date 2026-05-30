# Tài Liệu Yêu Cầu Bugfix

## Introduction

Dự án Discord bot (Node.js) `Heiznerd-MPP-1` hiện đang tồn tại hai nhóm vấn đề cần khắc phục:

1. **Lỗi code trong các file lệnh** — Các file lệnh trong `src/commands/` (admin, economy, fun, general, moderation) có thể chứa lỗi cú pháp, lỗi logic, thiếu xử lý lỗi, hoặc các vấn đề tiềm ẩn khác khiến bot hoạt động không ổn định.

2. **Nội dung tiếng Anh chưa được dịch trong file config** — File `config/messages.yml` vẫn còn nhiều chuỗi văn bản tiếng Anh chưa được dịch sang tiếng Việt (đặc biệt ở phần `Logs`, `Strings`, và một số `Embeds`). Điều này gây ra trải nghiệm không nhất quán cho người dùng Việt Nam.

---

## Bug Analysis

### Current Behavior (Defect)

**Nhóm 1 — Lỗi code trong file lệnh:**

1.1 WHEN bot thực thi một lệnh trong `src/commands/` THEN hệ thống có thể gặp lỗi runtime do thiếu xử lý ngoại lệ (try/catch) trong các thao tác bất đồng bộ (async/await)

1.2 WHEN người dùng cung cấp đầu vào không hợp lệ cho một lệnh THEN hệ thống có thể trả về lỗi không được xử lý thay vì thông báo lỗi thân thiện

1.3 WHEN một lệnh truy cập database hoặc API bên ngoài THEN hệ thống có thể crash nếu kết nối thất bại mà không có cơ chế fallback

1.4 WHEN file lệnh có lỗi cú pháp JavaScript THEN hệ thống không thể tải lệnh đó và bot khởi động thiếu chức năng

1.5 WHEN logic điều kiện trong lệnh bị sai THEN hệ thống thực thi hành vi không mong muốn (ví dụ: kiểm tra quyền sai, tính toán sai)

**Nhóm 2 — Nội dung tiếng Anh chưa dịch trong config:**

1.6 WHEN bot gửi embed log sự kiện (MessageUpdated, MessageDeleted, ChannelCreated, v.v.) THEN hệ thống hiển thị tiêu đề và tên trường bằng tiếng Anh thay vì tiếng Việt

1.7 WHEN bot hiển thị thông báo trong phần `Strings` (WelcomeCard, BlackJack, TicketModal, v.v.) THEN hệ thống hiển thị văn bản tiếng Anh cho người dùng Việt Nam

1.8 WHEN bot gửi embed `LevelUpEmbed` THEN hệ thống hiển thị thông báo "you just leveled up" bằng tiếng Anh

1.9 WHEN bot gửi embed `CantInteractEmbed` THEN hệ thống hiển thị "You can't interact with this component" bằng tiếng Anh

1.10 WHEN bot gửi embed `StarboardEmbed` THEN hệ thống hiển thị "Jump to message" bằng tiếng Anh

1.11 WHEN bot gửi embed `GuessTheNumberWrongSelect` và `GuessTheNumberOutTime` THEN hệ thống hiển thị mô tả bằng tiếng Anh

1.12 WHEN bot gửi embed `TicketAlertUserEmbed` THEN hệ thống hiển thị mô tả "Our staff is waiting for an answer" bằng tiếng Anh

1.13 WHEN bot gửi embed `ReactionRoleAddedEmbed` và `ReactionRoleRemovedEmbed` THEN hệ thống hiển thị mô tả bằng tiếng Anh

1.14 WHEN bot gửi embed `TemporalRankAddEmbed` và `TemporalRankRemoveEmbed` THEN hệ thống hiển thị một số trường bằng tiếng Anh

1.15 WHEN bot gửi embed `SuggestPendingEmbed`, `SuggestAcceptedEmbed`, `SuggestDeclinedEmbed` THEN hệ thống hiển thị tên trường "Updated on the {updated-date}" bằng tiếng Anh

1.16 WHEN bot gửi embed `GiveawayEndEmbed` THEN hệ thống hiển thị tiêu đề "Giveaway Ended" bằng tiếng Anh

1.17 WHEN bot gửi embed `AfkListEmbed` và `SnipeListEmbed` THEN hệ thống hiển thị tên các trường bằng tiếng Anh

1.18 WHEN bot gửi embed `WarnListEmbed` và `BannListEmbed` THEN hệ thống hiển thị tên các trường bằng tiếng Anh

1.19 WHEN bot gửi embed `BackupListEmbed` THEN hệ thống hiển thị một số tên trường bằng tiếng Anh

1.20 WHEN bot gửi embed `ServerInfoEmbed` THEN hệ thống hiển thị một số trường (Members, Boosters, Another) bằng tiếng Anh

---

### Expected Behavior (Correct)

**Nhóm 1 — Lỗi code trong file lệnh:**

2.1 WHEN bot thực thi một lệnh trong `src/commands/` THEN hệ thống SHALL bọc tất cả thao tác bất đồng bộ trong khối try/catch và gửi thông báo lỗi thân thiện nếu có ngoại lệ

2.2 WHEN người dùng cung cấp đầu vào không hợp lệ cho một lệnh THEN hệ thống SHALL trả về thông báo lỗi rõ ràng bằng tiếng Việt mà không crash

2.3 WHEN một lệnh truy cập database hoặc API bên ngoài THEN hệ thống SHALL xử lý lỗi kết nối và thông báo cho người dùng thay vì để bot crash

2.4 WHEN tất cả file lệnh được kiểm tra cú pháp THEN hệ thống SHALL không có lỗi cú pháp JavaScript trong bất kỳ file nào

2.5 WHEN logic điều kiện trong lệnh được kiểm tra THEN hệ thống SHALL thực thi đúng hành vi theo thiết kế (kiểm tra quyền đúng, tính toán đúng)

**Nhóm 2 — Nội dung tiếng Anh chưa dịch trong config:**

2.6 WHEN bot gửi embed log sự kiện THEN hệ thống SHALL hiển thị toàn bộ tiêu đề và tên trường bằng tiếng Việt

2.7 WHEN bot hiển thị thông báo trong phần `Strings` THEN hệ thống SHALL hiển thị văn bản tiếng Việt cho tất cả chuỗi hướng đến người dùng

2.8 WHEN bot gửi embed `LevelUpEmbed` THEN hệ thống SHALL hiển thị thông báo lên cấp bằng tiếng Việt

2.9 WHEN bot gửi embed `CantInteractEmbed` THEN hệ thống SHALL hiển thị thông báo không thể tương tác bằng tiếng Việt

2.10 WHEN bot gửi embed `StarboardEmbed` THEN hệ thống SHALL hiển thị liên kết "Nhảy đến tin nhắn" bằng tiếng Việt

2.11 WHEN bot gửi embed `GuessTheNumberWrongSelect` và `GuessTheNumberOutTime` THEN hệ thống SHALL hiển thị mô tả bằng tiếng Việt

2.12 WHEN bot gửi embed `TicketAlertUserEmbed` THEN hệ thống SHALL hiển thị thông báo chờ phản hồi bằng tiếng Việt

2.13 WHEN bot gửi embed `ReactionRoleAddedEmbed` và `ReactionRoleRemovedEmbed` THEN hệ thống SHALL hiển thị mô tả bằng tiếng Việt

2.14 WHEN bot gửi embed `TemporalRankAddEmbed` và `TemporalRankRemoveEmbed` THEN hệ thống SHALL hiển thị toàn bộ nội dung bằng tiếng Việt

2.15 WHEN bot gửi embed `SuggestPendingEmbed`, `SuggestAcceptedEmbed`, `SuggestDeclinedEmbed` THEN hệ thống SHALL hiển thị tên trường ngày cập nhật bằng tiếng Việt

2.16 WHEN bot gửi embed `GiveawayEndEmbed` THEN hệ thống SHALL hiển thị tiêu đề kết thúc giveaway bằng tiếng Việt

2.17 WHEN bot gửi embed `AfkListEmbed` và `SnipeListEmbed` THEN hệ thống SHALL hiển thị tên các trường bằng tiếng Việt

2.18 WHEN bot gửi embed `WarnListEmbed` và `BannListEmbed` THEN hệ thống SHALL hiển thị tên các trường bằng tiếng Việt

2.19 WHEN bot gửi embed `BackupListEmbed` THEN hệ thống SHALL hiển thị tất cả tên trường bằng tiếng Việt

2.20 WHEN bot gửi embed `ServerInfoEmbed` THEN hệ thống SHALL hiển thị tất cả tên trường bằng tiếng Việt

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN các file lệnh được sửa lỗi THEN hệ thống SHALL CONTINUE TO tải và đăng ký tất cả lệnh slash command lên Discord API đúng như trước

3.2 WHEN nội dung messages.yml được dịch sang tiếng Việt THEN hệ thống SHALL CONTINUE TO đọc và parse file YAML thành công mà không có lỗi cú pháp YAML

3.3 WHEN nội dung messages.yml được dịch THEN hệ thống SHALL CONTINUE TO nhận diện và thay thế đúng tất cả placeholder (ví dụ: `{user-tag}`, `{channel}`, `{color-default}`) trong các chuỗi đã dịch

3.4 WHEN các key trong messages.yml được giữ nguyên tên (chỉ dịch value) THEN hệ thống SHALL CONTINUE TO truy cập đúng key từ code mà không bị lỗi `undefined`

3.5 WHEN format YAML của messages.yml được giữ nguyên cấu trúc (indentation, block scalar, v.v.) THEN hệ thống SHALL CONTINUE TO parse file đúng định dạng

3.6 WHEN các lệnh economy (balance, deposit, withdraw, daily, weekly, pay, rob, work) được kiểm tra THEN hệ thống SHALL CONTINUE TO tính toán và cập nhật số dư đúng

3.7 WHEN các lệnh moderation (ban, kick, warn, nuke, clear) được kiểm tra THEN hệ thống SHALL CONTINUE TO thực thi đúng hành vi kiểm duyệt và ghi log

3.8 WHEN các lệnh admin (setup, giveaway, reaction-roles, ticket-manage, verify) được kiểm tra THEN hệ thống SHALL CONTINUE TO hoạt động đúng chức năng quản trị

3.9 WHEN các lệnh fun và general được kiểm tra THEN hệ thống SHALL CONTINUE TO hoạt động đúng chức năng giải trí và thông tin

3.10 WHEN file commands.yml và config.yml không bị thay đổi THEN hệ thống SHALL CONTINUE TO đọc cấu hình quyền lệnh và cài đặt chung đúng như cũ
