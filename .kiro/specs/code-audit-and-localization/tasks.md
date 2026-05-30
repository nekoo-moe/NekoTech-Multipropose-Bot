# Implementation Plan

## Overview

Danh sách task thực thi theo bugfix workflow cho spec `code-audit-and-localization`. Thứ tự: (1) exploration test xác nhận lỗi, (2) preservation tests baseline, (3) sửa code audit, (4) dịch localization, (5) verify fix, (6) checkpoint.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1", "2"] },
    { "wave": 2, "tasks": ["3", "4"] },
    { "wave": 3, "tasks": ["5"] },
    { "wave": 4, "tasks": ["6"] }
  ]
}
```

## Tasks

- [x] 1. Viết exploration test xác nhận lỗi tồn tại trên code gốc
  - **Property 1: Bug Condition** - Lệnh crash khi thiếu try/catch và messages.yml chứa chuỗi tiếng Anh
  - **CRITICAL**: Test này PHẢI FAIL trên code gốc — failure xác nhận lỗi tồn tại
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: Test này mã hóa hành vi mong muốn — sẽ validate fix khi pass sau khi implement
  - **GOAL**: Surface counterexamples chứng minh lỗi tồn tại
  - **Scoped PBT Approach**: Scope property vào các trường hợp cụ thể để đảm bảo reproducibility
  - Tạo file test `tests/bug-condition.test.js` với các test case sau:
    - **DB Error Test**: Mock `querys.users().economy().get()` throw error → gọi `balance.js run()` → assert `interaction.reply` KHÔNG được gọi (trên code gốc sẽ fail vì không có try/catch)
    - **Rob Anti-pattern Test**: Gọi `rob.js run()` với `interaction.user.id === options.getUser('user').id` → assert không có unhandled rejection (trên code gốc sẽ fail vì `throw new Error("exclude")`)
    - **Null Member Test**: Gọi `warn.js run()` với `interaction.guild.members.fetch()` trả về null → assert không crash (trên code gốc sẽ fail vì `d.id` trên null)
    - **Localization Test**: Parse `config/messages.yml` → assert tất cả value trong section `Logs` và `Strings` không chứa từ tiếng Anh (trên code gốc sẽ fail vì còn 30+ chuỗi tiếng Anh)
  - Chạy test trên code CHƯA sửa
  - **EXPECTED OUTCOME**: Test FAILS — đây là kết quả đúng, xác nhận lỗi tồn tại
  - Document counterexamples tìm được:
    - `balance.js`: interaction không được reply khi DB lỗi → Discord hiển thị "This interaction failed"
    - `rob.js`: `throw new Error("exclude")` gây unhandled rejection thay vì return
    - `warn.js`: `TypeError: Cannot read properties of null (reading 'id')` khi member rời server
    - `messages.yml`: Ít nhất 30+ chuỗi tiếng Anh trong `Logs`, `Strings`, và một số `Embeds`
  - Mark task complete khi test đã viết, chạy, và failure đã được document
  - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7_

- [x] 2. Viết preservation property tests (TRƯỚC khi implement fix)
  - **Property 2: Preservation** - Logic nghiệp vụ không thay đổi và YAML parse đúng
  - **IMPORTANT**: Theo observation-first methodology — quan sát hành vi code gốc trước khi viết test
  - Tạo file test `tests/preservation.test.js`
  - **Observation step** — chạy trên code CHƯA sửa với input hợp lệ (không kích hoạt bug condition):
    - Observe: `balance.js` với DB trả về `{ wallet: 1000, bank: 500 }` → reply embed đúng
    - Observe: `daily.js` với user chưa claim hôm nay → cộng tiền và lưu DB đúng
    - Observe: `rob.js` với `victim.id !== user.id` và victim có tiền → tính toán đúng
    - Observe: `warn.js` với member hợp lệ → ghi warn log đúng
    - Observe: `messages.yml` parse thành công → tất cả key tồn tại, placeholder được giữ nguyên
  - **Write property-based tests** dựa trên observation:
    - **Economy Logic Property**: For all valid amount (amount > 0, amount <= balance), `deposit(amount)` tăng bank và giảm wallet đúng bằng amount — verify với fast-check hoặc jest-each với nhiều giá trị
    - **Moderation Logic Property**: For all valid member (member != null, member.roles.highest.position < bot.roles.highest.position), `warn()` ghi log đúng và không crash
    - **YAML Structure Property**: Parse `messages.yml` → assert không có lỗi syntax, tất cả key trong danh sách expected tồn tại, tất cả placeholder `{...}` trong value gốc vẫn có trong value sau khi dịch
    - **Placeholder Replacement Property**: For all key-value pairs trong messages.yml, `replaceAll(embed, replacements)` thay thế đúng tất cả placeholder `{key}` bằng giá trị tương ứng
  - Chạy tests trên code CHƯA sửa
  - **EXPECTED OUTCOME**: Tests PASS — xác nhận baseline behavior cần preserve
  - Mark task complete khi tests đã viết, chạy, và passing trên code gốc
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. Sửa lỗi Code Audit — Thêm try/catch, sửa anti-pattern, thêm null-check

  - [x] 3.1 Bọc toàn bộ `run()` handler bằng try/catch trong tất cả file lệnh economy
    - Áp dụng cho: `balance.js`, `daily.js`, `deposit.js`, `withdraw.js`, `pay.js`, `rob.js`, `weekly.js`, `work.js`, `blackjack.js`
    - Bọc toàn bộ logic trong `run()` bằng `try { ... } catch (error) { ... }`
    - Catch block: log error với `console.error`, tạo error embed tiếng Việt (title: `❌ Đã xảy ra lỗi`, description: `Có lỗi xảy ra khi thực thi lệnh này. Vui lòng thử lại sau.`, color: `Red`)
    - Kiểm tra `interaction.replied || interaction.deferred` trước khi reply để tránh double-reply
    - Thêm validation: kiểm tra `amount > 0` và là số nguyên hợp lệ trong `deposit.js`, `withdraw.js`, `pay.js`
    - _Bug_Condition: isBugCondition_CodeAudit(command, input) — command.run không có try/catch khi async lỗi_
    - _Expected_Behavior: interaction.replied === true, reply.embeds[0].color === 'Red', reply.embeds[0].title CONTAINS 'lỗi'_
    - _Preservation: Logic tính toán số dư, cooldown, kiểm tra quyền không thay đổi_
    - _Requirements: 2.1, 2.2, 2.3, 3.6_

  - [x] 3.2 Bọc toàn bộ `run()` handler bằng try/catch trong tất cả file lệnh moderation
    - Áp dụng cho: `ban.js`, `kick.js`, `warn.js`, `nuke.js`, `clear.js`, `announce.js`, `mute.js`, `unmute.js`, `unban.js`
    - Áp dụng cùng pattern try/catch như task 3.1
    - _Bug_Condition: isBugCondition_CodeAudit(command, input)_
    - _Expected_Behavior: interaction luôn được reply khi có lỗi_
    - _Preservation: Hành vi kiểm duyệt và ghi log không thay đổi_
    - _Requirements: 2.1, 2.3, 3.7_

  - [x] 3.3 Bọc toàn bộ `run()` handler bằng try/catch trong tất cả file lệnh admin và general
    - Áp dụng cho tất cả file trong `src/commands/admin/` và `src/commands/general/`
    - Áp dụng cùng pattern try/catch như task 3.1
    - _Bug_Condition: isBugCondition_CodeAudit(command, input)_
    - _Expected_Behavior: interaction luôn được reply khi có lỗi_
    - _Preservation: Chức năng admin và general không thay đổi_
    - _Requirements: 2.1, 2.3, 3.8, 3.9_

  - [x] 3.4 Bọc toàn bộ `run()` handler bằng try/catch trong tất cả file lệnh fun
    - Áp dụng cho tất cả file trong `src/commands/fun/`
    - Áp dụng cùng pattern try/catch như task 3.1
    - _Bug_Condition: isBugCondition_CodeAudit(command, input)_
    - _Expected_Behavior: interaction luôn được reply khi có lỗi_
    - _Preservation: Game logic không thay đổi_
    - _Requirements: 2.1, 2.3, 3.9_

  - [x] 3.5 Sửa anti-pattern `throw` trong `rob.js`
    - **File**: `src/commands/economy/rob.js`
    - Tìm tất cả `throw new Error("exclude")` sau khi đã reply interaction
    - Thay bằng `return` hoặc `return interaction.reply({...})` — trả về Promise trực tiếp
    - Verify không còn unhandled rejection khi user cố rob chính mình
    - _Bug_Condition: isBugCondition_CodeAudit(rob, {user.id === victim.id}) — throw thay vì return_
    - _Expected_Behavior: return sau khi reply, không throw exception_
    - _Preservation: Logic tính toán rob (xác suất, số tiền) không thay đổi_
    - _Requirements: 2.1, 2.5, 3.6_

  - [x] 3.6 Thêm null-check cho member trong `warn.js`
    - **File**: `src/commands/moderation/warn.js`
    - Thêm kiểm tra `if (!d)` sau khi fetch member, trước khi truy cập `d.id`, `d.roles.highest.position`
    - Trả về thông báo lỗi tiếng Việt nếu member không tồn tại trong server
    - _Bug_Condition: isBugCondition_CodeAudit(warn, {member đã rời server}) — d là null_
    - _Expected_Behavior: reply thông báo "Người dùng không còn trong server" thay vì crash_
    - _Preservation: Logic warn với member hợp lệ không thay đổi_
    - _Requirements: 2.2, 2.5, 3.7_

  - [x] 3.7 Thêm try/catch riêng quanh canvas render trong `rank.js`
    - **File**: `src/commands/general/rank.js`
    - Bọc `s.build()` (canvacord render) trong try/catch riêng biệt
    - Catch block: gửi thông báo lỗi tiếng Việt cụ thể về lỗi render ảnh
    - _Bug_Condition: isBugCondition_CodeAudit(rank, {avatar URL không hợp lệ}) — s.build() throw_
    - _Expected_Behavior: reply thông báo lỗi render thay vì crash_
    - _Preservation: Logic tính toán rank và XP không thay đổi_
    - _Requirements: 2.1, 2.3, 3.9_

- [x] 4. Dịch localization — Cập nhật `config/messages.yml` sang tiếng Việt

  - [x] 4.1 Dịch toàn bộ section `Logs` trong messages.yml
    - **File**: `config/messages.yml`
    - Dịch tất cả title và field names trong:
      - `Logs.MessageUpdated`: title → `"Tin Nhắn Đã Được Chỉnh Sửa"`, fields: Author → `"Tác Giả"`, Channel → `"Kênh"`, Old Message → `"Tin Nhắn Cũ"`, New Message → `"Tin Nhắn Mới"`
      - `Logs.MessageDeleted`: title → `"Tin Nhắn Đã Bị Xóa"`, fields tương tự
      - `Logs.ChannelCreated/Deleted/Updated`: title và fields (Channel → `"Kênh"`, Channel Name → `"Tên Kênh"`, Channel Type → `"Loại Kênh"`, Channel Id → `"ID Kênh"`)
      - `Logs.EmojiCreated/Deleted/Updated`: title và fields (Name → `"Tên"`, Id → `"ID"`, Animated → `"Có Hiệu Ứng"`, Old Name → `"Tên Cũ"`, New Name → `"Tên Mới"`)
      - `Logs.RoleCreated/Deleted`: title và fields (Role Name → `"Tên Role"`, Role Id → `"ID Role"`, Role Color → `"Màu Role"`)
      - Tất cả footer `"Logged by {bot-tag}"` → `"Ghi lại bởi {bot-tag}"`
    - Giữ nguyên tất cả key, cấu trúc YAML, và placeholder `{...}`
    - _Bug_Condition: isBugCondition_Localization(key, value) — value CONTAINS tiếng Anh trong section Logs_
    - _Expected_Behavior: value bằng tiếng Việt, placeholder được giữ nguyên_
    - _Preservation: Tên key không thay đổi, cấu trúc YAML không thay đổi_
    - _Requirements: 2.6, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.2 Dịch toàn bộ section `Strings` trong messages.yml
    - **File**: `config/messages.yml`
    - Dịch tất cả value tiếng Anh trong section `Strings`:
      - `WelcomeCard2ndLine`: `"Welcome to {guild-name}"` → `"Chào mừng đến {guild-name}"`
      - `WelcomeCard3rdLine`: `"Member {memberCount}"` → `"Thành viên thứ {memberCount}"`
      - `BlackJackYouBustDescription`: `"You bust! You lose {coin} **{amount}**"` → `"Bạn quá 21! Bạn thua {coin} **{amount}**"`
      - `BlackJackYouBustImageTitle`: dịch sang tiếng Việt
      - `BlackJackYouWinDescription` và các BlackJack strings còn lại: dịch sang tiếng Việt
      - `TicketModalRegexError` và `TicketModalRegexErrorValue`: dịch toàn bộ sang tiếng Việt
    - Giữ nguyên tất cả key, cấu trúc YAML, và placeholder `{...}`
    - _Bug_Condition: isBugCondition_Localization(key, value) — value CONTAINS tiếng Anh trong section Strings_
    - _Expected_Behavior: value bằng tiếng Việt, placeholder được giữ nguyên_
    - _Preservation: Tên key không thay đổi, cấu trúc YAML không thay đổi_
    - _Requirements: 2.7, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.3 Dịch các Embeds lẻ còn tiếng Anh trong messages.yml
    - **File**: `config/messages.yml`
    - Dịch các Embeds sau:
      - `Embeds.LevelUpEmbed.description`: `"you just leveled up! You are now level **{user-level}**!"` → `"Bạn vừa lên cấp! Bạn hiện đang ở cấp **{user-level}**!"`
      - `Embeds.StarboardEmbed.description`: phần `[Jump to message]` → `[Nhảy đến tin nhắn]`
      - `Embeds.CantInteractEmbed.title`: `"You can't interact with this component"` → `"Bạn không thể tương tác với thành phần này"`
      - `Embeds.GuessTheNumberWrongSelect.description` và `GuessTheNumberOutTime.description`: dịch sang tiếng Việt
      - `Embeds.TicketAlertUserEmbed.description`: `"Our staff is waiting for an answer"` → `"Nhân viên của chúng tôi đang chờ phản hồi từ bạn"`
      - `Embeds.ReactionRoleAddedEmbed.description` và `ReactionRoleRemovedEmbed.description`: dịch sang tiếng Việt
      - `Embeds.TemporalRankAddEmbed.description` và `TemporalRankRemoveEmbed.description`: dịch phần tiếng Anh còn lại
      - `Embeds.TemporalRankListEmbed` field names: User → `"Người Dùng"`, Role → `"Role"`, Expires At → `"Hết Hạn Lúc"`
      - `Embeds.SuggestPendingEmbed/AcceptedEmbed/DeclinedEmbed` field name: `"Updated on the {updated-date}"` → `"Cập nhật lúc {updated-date}"`
      - `Embeds.GiveawayEndEmbed.title`: `"Giveaway Ended"` → `"Giveaway Đã Kết Thúc"`
      - `Embeds.AfkListEmbed` field names: Status → `"Trạng Thái"`, Reason → `"Lý Do"`, Since → `"Từ Lúc"`
      - `Embeds.SnipeListEmbed` field names: Content → `"Nội Dung"`, Attachments → `"Tệp Đính Kèm"`, Channel → `"Kênh"`
      - `Embeds.WarnListEmbed` và `BannListEmbed` field names: Case → `"Vụ Việc"`, User → `"Người Dùng"`, Date → `"Ngày"`, Reason → `"Lý Do"`, Moderator → `"Người Kiểm Duyệt"`
      - `Embeds.BackupListEmbed` field names: Preview → `"Xem Trước"`, Backup Id → `"ID Backup"`, Created At → `"Tạo Lúc"`, Emojis → `"Emoji"`
      - `Embeds.ServerInfoEmbed` field names: Members → `"Thành Viên"`, Boosters → `"Người Boost"`, Another → `"Khác"`
      - `Embeds.LeaderboardMessagesEmbed.panelsFormat`: phần `messages sent` → `tin nhắn đã gửi`
    - Giữ nguyên tất cả key, cấu trúc YAML, và placeholder `{...}`
    - _Bug_Condition: isBugCondition_Localization(key, value) — value CONTAINS tiếng Anh trong section Embeds_
    - _Expected_Behavior: value bằng tiếng Việt, placeholder được giữ nguyên_
    - _Preservation: Tên key không thay đổi, cấu trúc YAML không thay đổi_
    - _Requirements: 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19, 2.20, 3.2, 3.3, 3.4, 3.5_

- [x] 5. Verify bug condition exploration test nay pass (sau khi fix)

  - [x] 5.1 Chạy lại exploration test từ task 1 — xác nhận lỗi đã được sửa
    - **Property 1: Expected Behavior** - Lệnh phản hồi đúng khi gặp lỗi, messages.yml hoàn toàn tiếng Việt
    - **IMPORTANT**: Chạy lại ĐÚNG test từ task 1 — KHÔNG viết test mới
    - Test từ task 1 đã mã hóa expected behavior — khi pass, xác nhận fix hoạt động
    - Chạy `tests/bug-condition.test.js` trên code ĐÃ sửa
    - **EXPECTED OUTCOME**: Test PASSES — xác nhận tất cả lỗi đã được sửa
    - Verify cụ thể:
      - `balance.js` với DB lỗi → interaction được reply với error embed tiếng Việt
      - `rob.js` với self-rob → return (không throw), không có unhandled rejection
      - `warn.js` với member null → reply thông báo lỗi, không crash
      - `messages.yml` → không còn chuỗi tiếng Anh trong Logs, Strings, và Embeds đã liệt kê
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19, 2.20_

  - [x] 5.2 Verify preservation tests vẫn pass (không có regression)
    - **Property 2: Preservation** - Logic nghiệp vụ và YAML structure không thay đổi
    - **IMPORTANT**: Chạy lại ĐÚNG tests từ task 2 — KHÔNG viết test mới
    - Chạy `tests/preservation.test.js` trên code ĐÃ sửa
    - **EXPECTED OUTCOME**: Tests PASS — xác nhận không có regression
    - Verify cụ thể:
      - Economy commands tính toán đúng số dư với input hợp lệ
      - Moderation commands ghi log đúng với member hợp lệ
      - `messages.yml` parse thành công, tất cả key tồn tại, tất cả placeholder được giữ nguyên
      - `replaceAll()` thay thế đúng placeholder trong các chuỗi đã dịch
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [x] 6. Checkpoint — Đảm bảo tất cả tests pass
  - Chạy toàn bộ test suite: `npm test` (hoặc lệnh test tương ứng trong package.json)
  - Verify tất cả tests trong `tests/bug-condition.test.js` và `tests/preservation.test.js` đều PASS
  - Kiểm tra không có lỗi ESLint trong các file đã sửa: `npm run lint`
  - Kiểm tra bot khởi động thành công với messages.yml đã dịch (không có lỗi YAML parse)
  - Nếu có test nào fail, hỏi user trước khi tiếp tục
  - Đảm bảo `config/commands.yml` và `config/config.yml` không bị thay đổi
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

## Notes

- Task 1 và 2 phải được hoàn thành TRƯỚC khi bắt đầu task 3 và 4
- Task 1 (exploration test) được thiết kế để FAIL trên code gốc — đây là hành vi đúng
- Task 2 (preservation test) phải PASS trên code gốc — xác nhận baseline behavior
- Khi implement fix (task 3, 4), KHÔNG thay đổi logic nghiệp vụ, chỉ thêm error handling và dịch text
- Tất cả placeholder `{...}` trong messages.yml phải được giữ nguyên chính xác sau khi dịch
- Nếu có bất kỳ test nào fail ở task 6, hỏi user trước khi tiếp tục
