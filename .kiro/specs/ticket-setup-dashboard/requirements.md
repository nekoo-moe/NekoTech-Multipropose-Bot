# Tài Liệu Yêu Cầu

## Giới Thiệu

Feature **ticket-setup-dashboard** nhằm cải thiện trải nghiệm quản trị hệ thống ticket của Discord bot Heiznerd. Hiện tại, việc thiết lập ticket yêu cầu admin thực hiện nhiều lệnh riêng lẻ theo thứ tự (`/setup` → `/ticket-manage setup` → `/ticket-manage send`), gây bất tiện và dễ bỏ sót bước. Feature này giải quyết ba vấn đề chính:

1. **Đơn giản hóa luồng setup ticket** thành một quy trình liền mạch, hướng dẫn từng bước.
2. **Dashboard quản lý ticket tự động** được gửi/cập nhật vào kênh chỉ định khi bot khởi động, cho phép admin thao tác trực tiếp qua UI mà không cần gõ lệnh.
3. **Hệ thống OwnerIDs** trong `config.yml` để cấp quyền đặc biệt cho một nhóm user được chỉ định, bao gồm bypass kiểm tra quyền và cooldown.

## Bảng Thuật Ngữ

- **Bot**: Discord bot Heiznerd chạy trên nền tảng Discord.js (Node.js).
- **Admin**: Thành viên Discord có quyền `Administrator` trong server.
- **Owner**: Chủ sở hữu server Discord (`guild.ownerId`).
- **BotOwner**: User Discord có ID được liệt kê trong trường `OwnerIDs` của `config.yml`.
- **Panel_Ticket**: Một cấu hình ticket bao gồm tên, emoji, danh mục kênh, vai trò, kiểu nút và câu hỏi.
- **Dashboard_Ticket**: Tin nhắn embed tương tác được gửi vào kênh quản lý, cho phép admin thực hiện các thao tác quản lý ticket qua nút bấm.
- **Setup_Wizard**: Luồng hướng dẫn từng bước tích hợp để thiết lập ticket (cấu hình chung + tạo panel + gửi panel).
- **Config_Manager**: Module đọc và parse file `config/config.yml` khi bot khởi động.
- **Permission_Handler**: Module xử lý kiểm tra quyền trong `interactionCreate.js`.
- **Cooldown_Manager**: Module quản lý cooldown lệnh trong `interactionCreate.js`.
- **Dashboard_Manager**: Module chịu trách nhiệm gửi và cập nhật Dashboard_Ticket khi bot khởi động.
- **Kênh_Quản_Lý**: Kênh Discord được chỉ định trong `config.yml` để nhận Dashboard_Ticket.

---

## Yêu Cầu

### Yêu Cầu 1: Đơn Giản Hóa Luồng Setup Ticket

**User Story:** Là một admin server, tôi muốn thiết lập hệ thống ticket qua một luồng hướng dẫn duy nhất, để tôi không cần nhớ và thực hiện nhiều lệnh riêng lẻ theo đúng thứ tự.

#### Tiêu Chí Chấp Nhận

1. WHEN admin thực thi lệnh `/ticket-setup`, THE Setup_Wizard SHALL hiển thị giao diện hướng dẫn từng bước bao gồm: (1) cấu hình chung ticket, (2) tạo panel ticket, (3) chọn kênh và gửi panel.
2. WHEN admin hoàn thành bước cấu hình chung, THE Setup_Wizard SHALL tự động chuyển sang bước tạo panel mà không yêu cầu admin gõ thêm lệnh.
3. WHEN admin hoàn thành bước tạo panel, THE Setup_Wizard SHALL tự động chuyển sang bước gửi panel và hiển thị danh sách panel vừa tạo để xác nhận.
4. WHEN admin xác nhận gửi panel, THE Setup_Wizard SHALL gửi panel ticket tới kênh được chỉ định và hiển thị thông báo hoàn thành với tóm tắt cấu hình.
5. IF admin hủy bỏ ở bất kỳ bước nào, THEN THE Setup_Wizard SHALL lưu lại tiến trình đã hoàn thành và hiển thị thông báo hủy rõ ràng.
6. IF admin không tương tác trong vòng 300 giây tại bất kỳ bước nào, THEN THE Setup_Wizard SHALL kết thúc phiên và hiển thị thông báo hết thời gian.
7. THE Setup_Wizard SHALL hiển thị thanh tiến trình (ví dụ: "Bước 2/3") tại mỗi bước để admin biết mình đang ở đâu trong luồng.
8. WHERE admin đã có panel ticket tồn tại, THE Setup_Wizard SHALL cho phép admin bỏ qua bước tạo panel và chuyển thẳng sang bước gửi panel.

---

### Yêu Cầu 2: Dashboard Quản Lý Ticket Tự Động Khi Bot Khởi Động

**User Story:** Là một admin server, tôi muốn có một dashboard quản lý ticket được tự động gửi vào kênh chỉ định khi bot khởi động, để tôi có thể quản lý ticket trực tiếp qua UI mà không cần gõ lệnh.

#### Tiêu Chí Chấp Nhận

1. WHEN bot hoàn tất khởi động (sự kiện `ready`), THE Dashboard_Manager SHALL kiểm tra `config.yml` để xác định xem `TicketDashboard.Enabled` có bằng `true` hay không.
2. WHERE `TicketDashboard.Enabled` bằng `true`, WHEN bot hoàn tất khởi động, THE Dashboard_Manager SHALL gửi hoặc cập nhật Dashboard_Ticket vào Kênh_Quản_Lý được chỉ định trong `TicketDashboard.ChannelId` của `config.yml`.
3. WHEN Dashboard_Ticket đã tồn tại trong Kênh_Quản_Lý (từ lần khởi động trước), THE Dashboard_Manager SHALL cập nhật (edit) tin nhắn cũ thay vì gửi tin nhắn mới.
4. IF Kênh_Quản_Lý không tồn tại hoặc bot không có quyền gửi tin nhắn vào kênh đó, THEN THE Dashboard_Manager SHALL ghi log lỗi và bỏ qua việc gửi dashboard mà không làm gián đoạn quá trình khởi động của bot.
5. THE Dashboard_Ticket SHALL hiển thị các thông tin tổng quan: tổng số ticket đang mở, tổng số ticket đã đóng, danh sách panel ticket hiện có.
6. THE Dashboard_Ticket SHALL chứa các nút bấm hành động: "Xem danh sách ticket đang mở", "Tạo panel mới", "Gửi panel tới kênh", "Xóa panel".
7. WHEN BotOwner hoặc Admin nhấn nút hành động trên Dashboard_Ticket, THE Dashboard_Manager SHALL xử lý hành động tương ứng và cập nhật Dashboard_Ticket sau khi hoàn thành.
8. IF người dùng không phải BotOwner và không phải Admin nhấn nút hành động trên Dashboard_Ticket, THEN THE Dashboard_Manager SHALL phản hồi ephemeral thông báo không có quyền và bỏ qua hành động.
9. THE Dashboard_Manager SHALL lưu message ID của Dashboard_Ticket vào cơ sở dữ liệu để có thể tìm và cập nhật lại khi bot khởi động lần tiếp theo.

---

### Yêu Cầu 3: Thêm Trường OwnerIDs vào config.yml

**User Story:** Là chủ sở hữu bot, tôi muốn chỉ định một danh sách Discord user ID có quyền đặc biệt trong `config.yml`, để những người này có thể quản lý bot mà không bị giới hạn bởi quyền server hay cooldown.

#### Tiêu Chí Chấp Nhận

1. THE Config_Manager SHALL đọc và parse trường `OwnerIDs` từ `config.yml` dưới dạng danh sách chuỗi (list of strings) khi bot khởi động.
2. IF trường `OwnerIDs` không tồn tại trong `config.yml`, THEN THE Config_Manager SHALL sử dụng danh sách rỗng làm giá trị mặc định mà không gây lỗi khởi động.
3. WHEN Permission_Handler kiểm tra quyền cho một lệnh, THE Permission_Handler SHALL kiểm tra xem `interaction.user.id` có nằm trong danh sách `OwnerIDs` hay không trước khi kiểm tra các điều kiện quyền khác.
4. WHILE `interaction.user.id` nằm trong danh sách `OwnerIDs`, THE Permission_Handler SHALL bỏ qua toàn bộ kiểm tra quyền lệnh (bao gồm kiểm tra `isOwner`, `isAdmin`, và kiểm tra role) và cho phép thực thi lệnh.
5. WHILE `interaction.user.id` nằm trong danh sách `OwnerIDs`, THE Cooldown_Manager SHALL bỏ qua kiểm tra và áp dụng cooldown cho user đó.
6. THE Config_Manager SHALL hỗ trợ `OwnerIDs` chứa tối đa 10 Discord user ID.
7. IF một giá trị trong danh sách `OwnerIDs` không phải là chuỗi số hợp lệ (Discord Snowflake ID), THEN THE Config_Manager SHALL ghi log cảnh báo cho giá trị đó và bỏ qua giá trị không hợp lệ khi xây dựng danh sách quyền.

---

### Yêu Cầu 4: Quyền Truy Cập Dashboard Ticket Cho BotOwner

**User Story:** Là một BotOwner, tôi muốn có thể truy cập và sử dụng Dashboard_Ticket để quản lý ticket, để tôi có thể thực hiện các thao tác quản trị mà không cần có quyền Administrator trong server.

#### Tiêu Chí Chấp Nhận

1. WHEN BotOwner tương tác với Dashboard_Ticket, THE Dashboard_Manager SHALL xác thực quyền bằng cách kiểm tra `interaction.user.id` trong danh sách `OwnerIDs` từ `config.yml`.
2. WHILE `interaction.user.id` là BotOwner, THE Dashboard_Manager SHALL cho phép thực hiện tất cả hành động trên Dashboard_Ticket bao gồm: xem danh sách ticket, tạo panel, gửi panel, xóa panel.
3. WHILE `interaction.user.id` là Admin (có quyền `Administrator`), THE Dashboard_Manager SHALL cho phép thực hiện tất cả hành động trên Dashboard_Ticket tương tự như BotOwner.
4. IF `interaction.user.id` không phải BotOwner và không phải Admin, THEN THE Dashboard_Manager SHALL phản hồi ephemeral với thông báo "Bạn không có quyền sử dụng dashboard này" và không thực hiện hành động.
5. THE Dashboard_Manager SHALL kiểm tra quyền tại thời điểm tương tác (runtime), không phải tại thời điểm gửi dashboard, để phản ánh đúng trạng thái quyền hiện tại.
