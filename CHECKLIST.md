# 📋 Checklist Kiểm Tra Lệnh Bot — Heiznerd Test Product 1#3618

> **Hướng dẫn điền form:**
> - Mỗi lệnh có **Status**: ✅ OK | ⚠️ Lỗi nhỏ | ❌ Lỗi | 🔲 Chưa test
> - Điền vào cột **Ghi chú** nếu có lỗi, ví dụ: `"ảnh không hiện"`, `"bị crash"`, `"text sai"`, `"embed trống"`
> - Paste **Error log từ terminal** vào ô `> Lỗi terminal` nếu có

---

## ℹ️ Thông tin chung
| Mục | Thông tin |
|-----|-----------|
| Bot name | Heiznerd Test Product 1#3618 |
| Server test | NekoTech Labs |
| Ngày test | `____/____/______` |
| Người test | Heiznerd|
| Phiên bản | 3.6.1 |

---

## 🛡️ Admin

### `/giveaway`
- **Mô tả:** Quản lý tạo/dừng/tiếp tục/reroll sự kiện quà tặng
- **Yêu cầu quyền:** Staff/Owner
- **Các nhánh cần test:**
  - [ ✅ ] `/giveaway` → nhấn **Create** → thiết lập từng nút (channel, time, winners, prize, description, image, requirements) → nhấn **Hoàn tất & Bắt đầu**
  - [ ⚠️ ] `/giveaway` → nhấn **Pause** → chọn giveaway từ dropdown
  - [ ✅ ] `/giveaway` → nhấn **Resume** → chọn giveaway từ dropdown
  - [ ❌ ] `/giveaway` → nhấn **Reroll** → chọn giveaway từ dropdown
  - [ ] `/giveaway` → nhấn **End** → chọn giveaway từ dropdown
- **Status:** 🔲
- **Ghi chú:**
> Tại button pause, sau khi pause, embed đang không chuyển sang trạng thái đang chờ hoặc gì, mà lại thành <t:Infinity:R>, Dropdown tạm dừng lại có cả Giveaway cũ trong đó thay vì các giveaway hiện tại đang chạy, và sau khi pause nó lại trả ra "❌ Có lỗi xảy ra: undefined".
> Button resume đã hoạt động đúng
> Button Quay lại giải đang thiếu tiếng việt "No valid participations, no new winner(s) can be chosen!".
> Sau khi thắng giải, Text hiển thị đang không có tiếng việt "Congratulations, @heiznerd! You won me may" .

---

### `/setup`
- **Mô tả:** Thiết lập cấu hình bot cho server (welcome, ticket, level up, v.v.)
- **Yêu cầu quyền:** Staff/Owner
- [ X ] Mở menu setup và điều hướng qua các tùy chọn
- **Status:** 🔲
- **Ghi chú:**
> Lệnh đang chưa được phủ tiếng việt, embed hiển thị d
> Lỗi terminal:

---

### `/reaction-roles`
- **Mô tả:** Thiết lập vai trò theo phản ứng emoji
- **Yêu cầu quyền:** Staff/Owner
- [ ] Tạo reaction role mới
- [ ] Xóa reaction role
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/ticket-manage`
- **Mô tả:** Quản lý hệ thống ticket (tạo panel, cấu hình)
- **Yêu cầu quyền:** Staff/Owner
- [ ] Tạo panel ticket
- [ ] Cấu hình các tùy chọn
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/suggestion`
- **Mô tả:** Cấu hình kênh nhận góp ý
- **Yêu cầu quyền:** Staff/Owner
- [ ] Thiết lập kênh góp ý
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/poll`
- **Mô tả:** Tạo bình chọn
- **Yêu cầu quyền:** Admin
- [ ] Tạo poll với nhiều lựa chọn
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/role`
- **Mô tả:** Thêm/xóa vai trò cho thành viên
- **Yêu cầu quyền:** Owner
- [ ] Add role
- [ ] Remove role
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/manage`
- **Mô tả:** Quản lý cấu hình nâng cao
- **Yêu cầu quyền:** Admin
- [ ] Các tùy chọn quản lý hoạt động
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/custom-commands`
- **Mô tả:** Tạo lệnh tùy chỉnh cho server
- **Yêu cầu quyền:** Owner
- [ ] Tạo lệnh mới
- [ ] Xóa lệnh
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/backup`
- **Mô tả:** Sao lưu và khôi phục cấu hình server
- **Yêu cầu quyền:** Owner
- [ ] Tạo backup
- [ ] Load backup
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/reload`
- **Mô tả:** Tải lại danh sách lệnh không cần restart bot
- **Yêu cầu quyền:** Admin
- [ ] Thực thi lệnh
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/addemoji`
- **Mô tả:** Thêm emoji từ URL hoặc file vào server
- **Yêu cầu quyền:** Admin
- [ ] Thêm emoji từ URL
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/say`
- **Mô tả:** Bot nói tin nhắn thay bạn
- **Yêu cầu quyền:** Admin
- [ ] Gõ nội dung và kiểm tra bot reply
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/snipe`
- **Mô tả:** Xem tin nhắn vừa bị xóa
- **Yêu cầu quyền:** Admin
- [ ] Xóa 1 tin nhắn rồi dùng lệnh này
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/give-money` / `/take-money` / `/give-level` / `/give-xp` / `/set-level` / `/set-xp` / `/set-money`
- **Mô tả:** Quản lý kinh tế và cấp độ thủ công
- **Yêu cầu quyền:** Admin
- [ ] `/give-money @user amount`
- [ ] `/take-money @user amount`
- [ ] `/give-level @user amount`
- [ ] `/set-money @user amount`
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/verify`
- **Mô tả:** Xác minh thành viên và cấp role
- **Yêu cầu quyền:** Staff/Owner
- [ ] Thực thi cho 1 user
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

## 💰 Economy

### `/balance`
- **Mô tả:** Xem số dư ví và ngân hàng
- **Yêu cầu quyền:** @everyone
- [ ] `/balance` — xem của mình
- [ ] `/balance @user` — xem của người khác
- **Kiểm tra:** Avatar hiện đúng không? Coin symbol đúng không?
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/deposit`
- **Mô tả:** Gửi tiền mặt vào ngân hàng
- **Yêu cầu quyền:** @everyone
- [ ] `/deposit amount` với số hợp lệ
- [ ] `/deposit amount` vượt số tiền hiện có
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/withdraw`
- **Mô tả:** Rút tiền từ ngân hàng
- **Yêu cầu quyền:** @everyone
- [ ] `/withdraw amount` với số hợp lệ
- [ ] `/withdraw` không nhập số (rút hết)
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/daily`
- **Mô tả:** Nhận thưởng điểm danh hàng ngày
- **Yêu cầu quyền:** @everyone
- [ ] Lần đầu nhận
- [ ] Nhận khi còn cooldown (phải hiện thời gian chờ)
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/weekly`
- **Mô tả:** Nhận thưởng hàng tuần
- **Yêu cầu quyền:** @everyone
- [ ] Lần đầu nhận
- [ ] Nhận khi còn cooldown
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/work`
- **Mô tả:** Làm việc để nhận tiền (cooldown 1h)
- **Yêu cầu quyền:** @everyone
- [ ] Lần đầu làm
- [ ] Làm khi còn cooldown
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/pay`
- **Mô tả:** Chuyển tiền cho thành viên khác
- **Yêu cầu quyền:** @everyone
- [ ] `/pay @user amount` hợp lệ
- [ ] `/pay @mình` (phải báo lỗi)
- [ ] `/pay @user` khi không đủ tiền
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/rob`
- **Mô tả:** Cướp tiền thành viên khác (cooldown 12h)
- **Yêu cầu quyền:** @everyone
- [ ] Rob thành viên có tiền
- [ ] Rob thành viên không có tiền
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/blackjack`
- **Mô tả:** Chơi bài Blackjack cùng bot
- **Yêu cầu quyền:** @everyone
- [ ] Bắt đầu ván chơi
- [ ] Hit / Stand / Double
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

## 📚 General

### `/help`
- **Mô tả:** Hiển thị danh sách lệnh
- **Yêu cầu quyền:** @everyone
- [ ] Giao diện main có hiện đúng không?
- [ ] Nhấn các nút danh mục có chuyển trang không?
- [ ] Description lệnh có hiện tiếng Việt không?
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/afk enable`
- **Mô tả:** Bật trạng thái AFK với lý do
- **Yêu cầu quyền:** @everyone
- [ ] `/afk enable reason:đang ngủ` — embed hiện lý do và thời gian không?
- [ ] Tự mention người đang AFK → bot có ping không?
- [ ] Gửi tin nhắn khi đang AFK → bot có tắt AFK và thông báo không?
- **Kiểm tra:** Ảnh avatar trong embed? Text tiếng Việt?
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/afk disable`
- **Mô tả:** Tắt trạng thái AFK
- **Yêu cầu quyền:** @everyone
- [ ] Tắt AFK thành công
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/afk list`
- **Mô tả:** Xem danh sách thành viên đang AFK
- **Yêu cầu quyền:** @everyone
- [ ] Hiển thị danh sách khi có người AFK
- [ ] Hiển thị thông báo trống khi không có ai AFK
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/avatar`
- **Mô tả:** Xem ảnh đại diện của mình hoặc người khác
- **Yêu cầu quyền:** @everyone
- [ ] `/avatar` — xem của mình (ảnh PNG/GIF hiện đúng không?)
- [ ] `/avatar @user` — xem của người khác
- [ ] Kiểm tra ảnh động (GIF) hiện đúng không
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/userinfo`
- **Mô tả:** Thông tin chi tiết của một thành viên
- **Yêu cầu quyền:** @everyone
- [ ] `/userinfo` — xem của mình
- [ ] `/userinfo @user` — xem của người khác
- **Kiểm tra:** Ảnh avatar hiện đúng không?
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/serverinfo`
- **Mô tả:** Thông tin server
- **Yêu cầu quyền:** @everyone
- [ ] Hiện icon server đúng không?
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/rank`
- **Mô tả:** Xem thẻ rank và cấp độ
- **Yêu cầu quyền:** @everyone
- [ ] `/rank` — thẻ rank của mình có hiện không?
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/leaderboard`
- **Mô tả:** Bảng xếp hạng (EXP, coin, tin nhắn, lời mời)
- **Yêu cầu quyền:** @everyone
- [ ] `/leaderboard` — xem bảng xếp hạng
- [ ] Phân trang có hoạt động không?
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/invites`
- **Mô tả:** Xem số lượt mời của bản thân hoặc người khác
- **Yêu cầu quyền:** @everyone
- [ ] `/invites` — xem của mình
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/messages`
- **Mô tả:** Xem số tin nhắn đã gửi
- **Yêu cầu quyền:** @everyone
- [ ] `/messages` — xem số tin nhắn
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/suggest`
- **Mô tả:** Gửi góp ý tới kênh góp ý đã thiết lập
- **Yêu cầu quyền:** @everyone
- [ ] Gửi góp ý và kiểm tra embed tại kênh góp ý
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/serverip`
- **Mô tả:** Hiển thị IP server Minecraft (nếu có cấu hình)
- **Yêu cầu quyền:** @everyone
- [ ] Hiển thị IP đúng không?
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/weather`
- **Mô tả:** Xem thời tiết theo địa điểm
- **Yêu cầu quyền:** @everyone
- [ ] `/weather Hanoi` — hiện thông tin thời tiết
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

## 🔒 Moderation

### `/ban`
- **Mô tả:** Ban thành viên khỏi server
- **Yêu cầu quyền:** Staff/Owner
- [ ] Ban thành viên với lý do
- [ ] Bot có DM thành viên bị ban không?
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/kick`
- **Mô tả:** Kick thành viên khỏi server
- **Yêu cầu quyền:** Staff/Owner
- [ ] Kick thành viên với lý do
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/warn`
- **Mô tả:** Cảnh cáo thành viên
- **Yêu cầu quyền:** Staff/Owner
- [ ] Warn thành viên
- [ ] Xem danh sách warn
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/clear`
- **Mô tả:** Xóa tin nhắn hàng loạt
- **Yêu cầu quyền:** Admin
- [ ] `/clear 10` — xóa 10 tin nhắn
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/nuke`
- **Mô tả:** Xóa toàn bộ tin nhắn trong kênh
- **Yêu cầu quyền:** Admin
- [ ] Nuke kênh test (⚠️ cẩn thận!)
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/announce`
- **Mô tả:** Gửi thông báo embed
- **Yêu cầu quyền:** Staff/Owner
- [ ] Gửi thông báo và kiểm tra hiển thị
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

## 🎵 Music

> ⚠️ **Lưu ý:** Các lệnh nhạc yêu cầu cài ffmpeg. Xem [NOTES.md](NOTES.md)

### `/play`
- **Mô tả:** Phát nhạc từ YouTube/Spotify
- **Yêu cầu quyền:** @everyone
- **Yêu cầu:** Phải vào voice channel trước
- [ ] `/play [URL YouTube]`
- [ ] `/play [tên bài hát]`
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/skip` / `/pause` / `/resume` / `/stop` / `/volume` / `/nowplaying` / `/join` / `/leave`
- **Mô tả:** Điều khiển nhạc
- [ ] `/skip` — bỏ qua bài
- [ ] `/pause` — tạm dừng
- [ ] `/resume` — tiếp tục
- [ ] `/stop` — dừng hẳn
- [ ] `/volume 50` — chỉnh âm lượng
- [ ] `/nowplaying` — xem bài đang phát
- [ ] `/join` — bot vào kênh voice
- [ ] `/leave` — bot rời kênh voice
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

## 🥳 Fun

### `/wordle`
- **Mô tả:** Đoán từ trong 6 lần
- [ ] Bắt đầu trò chơi
- [ ] Đoán đúng / sai
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/ship`
- **Mô tả:** Tính độ tương hợp giữa 2 user
- [ ] `/ship @user1 @user2`
- **Kiểm tra:** Ảnh avatar 2 người có hiện không?
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/dream`
- **Mô tả:** Tạo ảnh AI từ mô tả
- [ ] `/dream [mô tả]`
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/gtn` (Guess The Number)
- **Mô tả:** Đoán số
- [ ] Bắt đầu và đoán
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/rps` (Rock Paper Scissors)
- **Mô tả:** Oẳn tù xì với bot
- [ ] Chọn kéo/búa/bao
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/connect4`
- **Mô tả:** Cờ kết nối 4 ô với người khác
- [ ] Tạo game và tương tác
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/tic-tac-toe`
- **Mô tả:** Chơi cờ XO với người khác
- [ ] Tạo game và tương tác
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/slots`
- **Mô tả:** Chơi máy đánh bạc
- [ ] Thực thi lệnh
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

## 🎫 Tickets

### Tạo ticket
- **Mô tả:** Nhấn nút trên panel ticket đã setup
- [ ] Tạo ticket thành công
- [ ] Embed chào mừng trong ticket hiện đúng không?
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/claim`
- **Mô tả:** Nhận phụ trách ticket
- [ ] Claim ticket
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/close`
- **Mô tả:** Đóng ticket
- [ ] Close ticket
- [ ] Transcript được tạo không?
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/open`
- **Mô tả:** Mở lại ticket đã đóng
- [ ] Open ticket
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/add` / `/remove`
- **Mô tả:** Thêm/xóa thành viên khỏi ticket
- [ ] `/add @user`
- [ ] `/remove @user`
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/alert`
- **Mô tả:** Nhắc nhở user phản hồi ticket
- [ ] Gửi cảnh báo trong ticket
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

### `/rename`
- **Mô tả:** Đổi tên kênh ticket
- [ ] `/rename [tên mới]`
- **Status:** 🔲
- **Ghi chú:**
> Lỗi terminal:

---

## 🔧 Sự kiện hệ thống (tự động)

| Sự kiện | Mô tả | Status | Ghi chú |
|---------|-------|--------|---------|
| Welcome message | Bot chào khi member vào server | 🔲 | |
| Leave message | Bot thông báo khi member rời server | 🔲 | |
| Level up | Bot thông báo khi lên cấp | 🔲 | |
| Bộ lọc link | Bot xóa tin nhắn có link không hợp lệ | 🔲 | |
| Bộ lọc invite | Bot xóa tin nhắn có invite link | 🔲 | |
| AFK auto-clear | Bot tự tắt AFK khi user gửi tin nhắn | 🔲 | |
| Mention bot | Tag bot và bot reply hướng dẫn | 🔲 | |

---

## 📊 Tổng kết

| Hạng mục | Tổng | OK ✅ | Lỗi nhỏ ⚠️ | Lỗi ❌ | Chưa test 🔲 |
|----------|------|-------|------------|--------|--------------|
| Admin | 16 | | | | |
| Economy | 9 | | | | |
| General | 13 | | | | |
| Moderation | 6 | | | | |
| Music | 9 | | | | |
| Fun | 8 | | | | |
| Tickets | 7 | | | | |
| Hệ thống | 7 | | | | |
| **Tổng** | **75** | | | | |

---

## 📝 Ghi chú thêm / Vấn đề tổng quát

```
[Ghi các vấn đề chung phát hiện trong quá trình test vào đây]
```

---

*Tài liệu này được tạo tự động bởi Antigravity — Heiznerd Bot v3.6.1*
