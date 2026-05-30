# Implementation Plan: ticket-setup-dashboard

## Overview

Triển khai feature theo thứ tự từ nền tảng đến tính năng cao hơn:
1. Cấu hình và model dữ liệu
2. Hệ thống OwnerIDs + Permission bypass
3. Dashboard_Manager (gửi/cập nhật dashboard khi bot ready)
4. Setup_Wizard (`/ticket-setup`)
5. Kết nối và tích hợp toàn bộ

---

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1.1", "1.2", "1.3"] },
    { "wave": 2, "tasks": ["1.4", "1.5", "2.1"] },
    { "wave": 3, "tasks": ["2.2", "2.3", "3"] },
    { "wave": 4, "tasks": ["4.1", "4.3"] },
    { "wave": 5, "tasks": ["4.2", "4.4", "4.5", "4.6", "4.7"] },
    { "wave": 6, "tasks": ["4.8", "5"] },
    { "wave": 7, "tasks": ["6.1", "6.3"] },
    { "wave": 8, "tasks": ["6.2", "6.4"] },
    { "wave": 9, "tasks": ["6.5", "6.6"] },
    { "wave": 10, "tasks": ["6.7", "7.1", "7.2"] },
    { "wave": 11, "tasks": ["8"] }
  ]
}
```

---

## Tasks

- [x] 1. Cập nhật cấu hình và mô hình dữ liệu
  - [x] 1.1 Thêm `OwnerIDs` và `TicketDashboard` vào `config/config.yml`
    - Thêm section `OwnerIDs` dạng list string (mặc định rỗng, có comment hướng dẫn)
    - Thêm section `TicketDashboard` với `Enabled: false` và `ChannelId: ""`
    - _Requirements: 3.1, 3.6, 2.1, 2.2_

  - [x] 1.2 Thêm entry `TicketSetup` vào `config/commands.yml`
    - Thêm `TicketSetup` với `Enabled: true` và Permissions `Staff`, `Owner`
    - _Requirements: 1.1_

  - [x] 1.3 Thêm field `dashboardMessageId` vào `GuildModel`
    - Thêm `dashboardMessageId: { type: String, default: null }` vào schema chính (ngoài `ticketConfig`)
    - _Requirements: 2.9_

  - [ ]* 1.4 Viết property test cho Config_Manager parse OwnerIDs
    - **Thuộc Tính 8: Config_Manager parse đúng mọi danh sách OwnerIDs hợp lệ**
    - Dùng `fast-check` generate danh sách 0-10 Discord Snowflake ID hợp lệ
    - Kiểm tra `client.config.OwnerIDs` sau khi load là mảng đúng
    - **Validates: Requirements 3.1, 3.6**

  - [ ]* 1.5 Viết property test cho validation Snowflake không hợp lệ
    - **Thuộc Tính 11: Config_Manager bỏ qua và log warning cho Snowflake không hợp lệ**
    - Dùng `fast-check` generate chuỗi không phải Snowflake (chữ cái, ký tự đặc biệt, số quá ngắn/dài)
    - Kiểm tra giá trị không hợp lệ bị loại khỏi danh sách cuối cùng
    - **Validates: Requirements 3.7**

- [x] 2. Triển khai hệ thống OwnerIDs trong Permission_Handler
  - [x] 2.1 Sửa `src/events/handler/interactionCreate.js` để thêm BotOwner bypass
    - Thêm kiểm tra `isBotOwner` trước tất cả kiểm tra quyền hiện có
    - Nếu `isBotOwner = true`: bỏ qua kiểm tra quyền, bỏ qua cooldown, thực thi lệnh trực tiếp
    - Thứ tự kiểm tra: `isBotOwner` → `isOwner` → `isAdmin` → role/ID
    - _Requirements: 3.3, 3.4, 3.5_

  - [ ]* 2.2 Viết property test cho BotOwner bypass quyền
    - **Thuộc Tính 9: BotOwner bypass quyền cho mọi lệnh**
    - Dùng `fast-check` generate user ID từ OwnerIDs và lệnh yêu cầu quyền bất kỳ
    - Kiểm tra Permission_Handler cho phép thực thi mà không kiểm tra quyền
    - **Validates: Requirements 3.3, 3.4**

  - [ ]* 2.3 Viết property test cho BotOwner bypass cooldown
    - **Thuộc Tính 10: BotOwner bypass cooldown cho mọi lệnh**
    - Dùng `fast-check` generate lệnh có cooldown đang active và BotOwner ID
    - Kiểm tra Cooldown_Manager bỏ qua cooldown cho BotOwner
    - **Validates: Requirements 3.5**

- [x] 3. Checkpoint — Kiểm tra quyền hoạt động đúng
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

- [x] 4. Triển khai Dashboard_Manager
  - [x] 4.1 Tạo file `src/helpers/dashboardManager.js` với class `DashboardManager`
    - Implement constructor nhận `client`
    - Implement `hasPermission(interaction)`: kiểm tra `OwnerIDs` hoặc `Administrator`
    - Implement `buildDashboardEmbed(guildData, openCount, closedCount)`: tạo embed với 3 field inline (🟢 Đang mở, 🔒 Đã đóng, 📋 Panels) và danh sách panels trong description
    - Implement `buildDashboardButtons(disabled)`: tạo ActionRow với 4 nút (📋 Xem Tickets, ➕ Tạo Panel, 📤 Gửi Panel, 🗑 Xóa Panel)
    - _Requirements: 2.5, 2.6_

  - [ ]* 4.2 Viết property test cho buildDashboardEmbed
    - **Thuộc Tính 3: Dashboard embed luôn phản ánh đúng trạng thái ticket hiện tại**
    - Dùng `fast-check` generate số ticket mở/đóng ngẫu nhiên và danh sách panel ngẫu nhiên
    - Kiểm tra embed chứa đúng số ticket mở, đóng và tên các panel
    - **Validates: Requirements 2.5**

  - [x] 4.3 Implement `DashboardManager.init()` — gửi hoặc cập nhật dashboard khi bot ready
    - Lặp qua tất cả guilds trong DB có `TicketDashboard.Enabled = true`
    - Nếu `dashboardMessageId` tồn tại: fetch message và edit
    - Nếu không: gửi tin nhắn mới vào `TicketDashboard.ChannelId`
    - Lưu message ID vào `dashboardMessageId` trong GuildModel
    - Bọc toàn bộ trong try/catch: log lỗi và tiếp tục (không crash bot)
    - _Requirements: 2.2, 2.3, 2.4, 2.9_

  - [ ]* 4.4 Viết property test cho Dashboard_Manager edit thay vì send
    - **Thuộc Tính 4: Dashboard_Manager luôn edit thay vì gửi mới khi có messageId**
    - Dùng `fast-check` generate message ID hợp lệ ngẫu nhiên
    - Mock Discord API, kiểm tra `message.edit()` được gọi thay vì `channel.send()`
    - **Validates: Requirements 2.3**

  - [ ]* 4.5 Viết property test cho lỗi kênh không crash bot
    - **Thuộc Tính 5: Lỗi kênh không hợp lệ không làm gián đoạn khởi động bot**
    - Dùng `fast-check` generate channel ID không hợp lệ ngẫu nhiên
    - Kiểm tra `init()` không throw exception khi kênh không tồn tại
    - **Validates: Requirements 2.4**

  - [ ]* 4.6 Viết property test cho lưu messageId
    - **Thuộc Tính 6: Message ID dashboard được lưu sau mỗi lần gửi**
    - Dùng `fast-check` generate guild ID và message ID ngẫu nhiên
    - Kiểm tra sau khi gửi, `dashboardMessageId` trong DB khớp với message ID vừa gửi
    - **Validates: Requirements 2.9**

  - [x] 4.7 Implement `DashboardManager.handleInteraction(interaction)` — xử lý button clicks
    - Kiểm tra quyền bằng `hasPermission()`, nếu không có quyền: reply ephemeral error
    - Xử lý `tkt-dashboard-view`: hiển thị pagination embed danh sách tickets (5/trang) với buttons ◀ Trước, ▶ Sau, 🏠 Dashboard
    - Xử lý `tkt-dashboard-create`: khởi động luồng tạo panel (tái sử dụng logic từ `ticket-manage.js`)
    - Xử lý `tkt-dashboard-send`: hiển thị ChannelSelectMenu để chọn kênh gửi panel
    - Xử lý `tkt-dashboard-delete`: hiển thị StringSelectMenu để chọn panel xóa
    - Sau mỗi action: cập nhật lại Dashboard_Ticket embed
    - _Requirements: 2.7, 2.8, 4.1, 4.2, 4.3, 4.4_

  - [ ]* 4.8 Viết property test cho kiểm tra quyền dashboard
    - **Thuộc Tính 7: User không có quyền luôn nhận ephemeral error khi tương tác dashboard**
    - Dùng `fast-check` generate user ID không nằm trong OwnerIDs và không có quyền Admin
    - Kiểm tra mọi button interaction đều trả về ephemeral error
    - **Validates: Requirements 2.8, 4.4**

- [x] 5. Checkpoint — Dashboard hoạt động đúng
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

- [x] 6. Triển khai Setup_Wizard (`/ticket-setup`)
  - [x] 6.1 Tạo file `src/commands/admin/ticket-setup.js` với cấu trúc lệnh cơ bản
    - Định nghĩa lệnh slash `/ticket-setup` không có subcommand
    - Khởi tạo `wizardState` object với step, ticketConfig, panel, targetChannel
    - Implement hàm `buildProgressBar(step)` trả về chuỗi thanh tiến trình (━━━●──────)
    - Implement hàm `buildStepEmbed(step, wizardState, client)` tạo embed cho từng bước
    - _Requirements: 1.1, 1.7_

  - [ ]* 6.2 Viết property test cho thanh tiến trình
    - **Thuộc Tính 1: Thanh tiến trình wizard luôn phản ánh đúng bước hiện tại**
    - Dùng `fast-check` generate số bước ngẫu nhiên trong [1, 2, 3]
    - Kiểm tra embed chứa "Bước X/3" và thanh tiến trình có đúng số ký tự `●`
    - **Validates: Requirements 1.7**

  - [x] 6.3 Implement Bước 1/3 — Cấu hình chung ticket
    - Hiển thị embed với 4 field: maxTickets (⬜/✅), transcriptChannel (⬜/✅), autoSaveTranscript (⬜/✅), messageType (⬜/✅)
    - Tạo ActionRow với nút cho từng field (style Primary nếu đã cấu hình, Secondary nếu chưa)
    - Nút "➡️ Tiếp theo" chỉ xuất hiện khi đủ field bắt buộc (maxTickets, messageType)
    - Xử lý từng nút: maxTickets (awaitMessages số), transcriptChannel (ChannelSelectMenu), autoSaveTranscript (Boolean buttons), messageType (Questions buttons)
    - _Requirements: 1.1, 1.2_

  - [x] 6.4 Implement Bước 2/3 — Tạo Panel Ticket
    - Tái sử dụng toàn bộ logic tạo panel từ `ticket-manage.js` (name, emoji, category, roles, style, label, questions)
    - Thêm nút "⏭️ Bỏ qua" nếu guild đã có ít nhất 1 panel trong DB
    - Khi hoàn thành: lưu panel vào DB và chuyển sang bước 3
    - _Requirements: 1.3, 1.8_

  - [x] 6.5 Implement Bước 3/3 — Chọn kênh và gửi panel
    - Hiển thị embed tóm tắt panel vừa tạo (hoặc panel đã chọn nếu skip bước 2)
    - ChannelSelectMenu để chọn kênh gửi panel
    - Nút "📤 Gửi Panel" để xác nhận
    - Khi xác nhận: gọi logic gửi panel từ `ticket-manage.js send`
    - _Requirements: 1.3, 1.4_

  - [x] 6.6 Implement màn hình Hoàn Thành và xử lý hủy/timeout
    - Màn hình hoàn thành: embed tóm tắt (tên panel, kênh đích, kiểu nút, số câu hỏi) + nút "🏠 Về Dashboard"
    - Xử lý hủy: lưu tiến trình đã hoàn thành, hiển thị thông báo hủy rõ ràng
    - Xử lý timeout 300 giây: disable buttons, thông báo hết giờ
    - _Requirements: 1.4, 1.5, 1.6_

  - [ ]* 6.7 Viết property test cho hủy wizard bảo toàn dữ liệu
    - **Thuộc Tính 2: Hủy wizard ở bất kỳ bước nào vẫn bảo toàn tiến trình đã lưu**
    - Dùng `fast-check` generate bước hủy ngẫu nhiên (1, 2, hoặc 3) và dữ liệu đã nhập
    - Kiểm tra dữ liệu đã lưu ở bước trước vẫn còn trong DB sau khi hủy
    - **Validates: Requirements 1.5**

- [x] 7. Kết nối Dashboard_Manager vào sự kiện `ready`
  - [x] 7.1 Tạo file `src/events/general/ticketDashboard.js` — event handler cho `ready`
    - Import `DashboardManager` từ `src/helpers/dashboardManager.js`
    - Trong handler `ready`: khởi tạo `DashboardManager` và gọi `init()`
    - _Requirements: 2.1, 2.2_

  - [x] 7.2 Đăng ký xử lý button interaction của dashboard trong `interactionCreate.js`
    - Thêm điều kiện kiểm tra `interaction.isButton()` và `customId.startsWith('tkt-dashboard-')`
    - Gọi `dashboardManager.handleInteraction(interaction)` khi điều kiện thỏa
    - _Requirements: 2.7, 2.8_

- [x] 8. Checkpoint cuối — Đảm bảo toàn bộ tích hợp hoạt động
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

---

## Notes

- Tasks đánh dấu `*` là tùy chọn và có thể bỏ qua để triển khai nhanh hơn.
- Mỗi task tham chiếu đến requirements cụ thể để đảm bảo truy xuất nguồn gốc.
- Các checkpoint đảm bảo kiểm tra tăng dần sau mỗi nhóm tính năng.
- Property tests dùng thư viện `fast-check` — cài đặt bằng `npm install --save-dev fast-check`.
- Logic tạo panel và gửi panel được tái sử dụng từ `ticket-manage.js` để tránh trùng lặp code.
