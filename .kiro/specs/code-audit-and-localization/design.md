# Code Audit và Localization — Bugfix Design

## Overview

Dự án Discord bot Node.js `Heiznerd-MPP-1` tồn tại hai nhóm lỗi cần khắc phục đồng thời:

**Nhóm 1 — Code Audit:** Các file lệnh trong `src/commands/` (admin, economy, fun, general, moderation) thiếu khối `try/catch` bao quanh các thao tác async/await, thiếu kiểm tra input đầu vào, và có một số lỗi logic. Khi xảy ra lỗi runtime (DB timeout, API lỗi, input không hợp lệ), bot crash hoặc không phản hồi thay vì gửi thông báo lỗi thân thiện.

**Nhóm 2 — Localization:** File `config/messages.yml` vẫn còn nhiều chuỗi tiếng Anh chưa dịch trong các section `Logs`, `Strings`, và một số `Embeds` lẻ. Người dùng Việt Nam nhận được thông báo tiếng Anh không nhất quán với phần còn lại của bot.

Chiến lược sửa: (1) Bọc tất cả `run()` handler bằng try/catch, thêm validation input, sửa lỗi logic cụ thể; (2) Dịch toàn bộ chuỗi tiếng Anh còn sót trong messages.yml sang tiếng Việt, giữ nguyên key và placeholder.

---

## Glossary

- **Bug_Condition (C)**: Điều kiện kích hoạt lỗi — (1) lệnh thực thi mà không có try/catch khi gặp lỗi async, hoặc (2) bot gửi embed/string tiếng Anh đến người dùng Việt Nam
- **Property (P)**: Hành vi đúng mong muốn — (1) lệnh luôn phản hồi thông báo lỗi tiếng Việt thân thiện thay vì crash, (2) mọi chuỗi hiển thị cho người dùng đều bằng tiếng Việt
- **Preservation**: Toàn bộ logic nghiệp vụ (tính toán kinh tế, kiểm duyệt, game), cấu trúc YAML, tên key, và placeholder phải giữ nguyên sau khi sửa
- **`run()` handler**: Hàm async chính trong mỗi file lệnh tại `src/commands/**/*.js`, nhận `{ interaction, client }` và thực thi lệnh
- **`replaceAll()`**: Helper tại `src/helpers/replaceAll.js` — thay thế placeholder `{key}` trong embed object từ messages.yml
- **`messages.yml`**: File cấu hình tại `config/messages.yml` chứa toàn bộ nội dung hiển thị của bot (Embeds, Buttons, Logs, Strings)
- **Placeholder**: Chuỗi dạng `{user-tag}`, `{channel}`, `{color-default}` trong messages.yml được thay thế động khi bot gửi tin nhắn

---

## Bug Details

### Bug Condition

**Nhóm 1 — Thiếu xử lý lỗi trong file lệnh:**

Lỗi xảy ra khi hàm `run()` của một lệnh thực hiện thao tác async (truy vấn DB, gọi Discord API, tính toán) mà không có khối try/catch bao quanh. Khi thao tác đó thất bại, exception lan ra ngoài và bot không phản hồi interaction, dẫn đến "This interaction failed" trên Discord.

**Formal Specification:**
```
FUNCTION isBugCondition_CodeAudit(command, input)
  INPUT: command là một file lệnh trong src/commands/**/*.js
         input là interaction từ người dùng Discord
  OUTPUT: boolean

  RETURN (
    command.run KHÔNG có try/catch bao quanh toàn bộ async logic
    OR input.options chứa giá trị không hợp lệ mà command không kiểm tra
    OR command có lỗi logic (kiểm tra quyền sai, tính toán sai, race condition)
  )
END FUNCTION
```

**Nhóm 2 — Chuỗi tiếng Anh chưa dịch trong messages.yml:**

Lỗi xảy ra khi bot đọc một key từ messages.yml và value của key đó vẫn còn tiếng Anh, dẫn đến người dùng Việt Nam nhận được thông báo không nhất quán.

```
FUNCTION isBugCondition_Localization(key, value)
  INPUT: key là tên trường trong messages.yml
         value là nội dung văn bản của trường đó
  OUTPUT: boolean

  RETURN value CONTAINS tiếng Anh
         AND key THUỘC section Logs OR Strings OR Embeds
         AND key KHÔNG phải placeholder kỹ thuật (URL, ID, format code)
END FUNCTION
```

### Examples

**Nhóm 1 — Code Audit:**
- `balance.js`: Không có try/catch → nếu DB lỗi, interaction không được reply → Discord hiển thị "This interaction failed"
- `rob.js`: Dùng `throw new Error("exclude")` để thoát sớm thay vì `return` → anti-pattern, có thể gây unhandled rejection
- `rank.js`: Không có try/catch quanh `canvacord` render → nếu avatar URL lỗi, bot crash
- `daily.js`: Không có try/catch quanh `t.save()` → nếu DB timeout, tiền được cộng nhưng không lưu, không thông báo lỗi
- `warn.js`: Không kiểm tra `d` (member) có tồn tại trước khi truy cập `d.id` → crash nếu member đã rời server

**Nhóm 2 — Localization:**
- `Logs.MessageUpdated.title`: `"Message Edited"` → cần dịch sang `"Tin Nhắn Đã Được Chỉnh Sửa"`
- `Strings.BlackJackYouBustDescription`: `"You bust! You lose {coin} **{amount}**"` → cần dịch
- `Embeds.LevelUpEmbed.description`: `"you just leveled up! You are now level **{user-level}**!"` → cần dịch
- `Embeds.CantInteractEmbed.title`: `"You can't interact with this component"` → cần dịch
- `Strings.TicketModalRegexError`: Toàn bộ nội dung tiếng Anh → cần dịch

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Toàn bộ logic nghiệp vụ của các lệnh (tính toán số dư, cooldown, kiểm tra quyền, game logic) phải hoạt động đúng như trước
- Tất cả slash command phải tiếp tục đăng ký và hoạt động trên Discord API
- Cấu trúc YAML của messages.yml (indentation, block scalar `|`, inline, nested keys) phải giữ nguyên
- Tất cả tên key trong messages.yml phải giữ nguyên — chỉ dịch value
- Tất cả placeholder (`{user-tag}`, `{channel}`, `{color-default}`, v.v.) phải giữ nguyên chính xác trong các chuỗi đã dịch
- File `config/commands.yml` và `config/config.yml` không bị thay đổi

**Scope:**
Mọi thay đổi chỉ tác động đến:
1. Phần xử lý lỗi (try/catch wrapper) và validation trong `src/commands/**/*.js` — không thay đổi logic nghiệp vụ
2. Phần value tiếng Anh trong `config/messages.yml` — không thay đổi key, cấu trúc, hay placeholder

---

## Hypothesized Root Cause

### Nhóm 1 — Code Audit

1. **Thiếu try/catch toàn cục trong `run()` handler**: Các file lệnh được viết với async/await nhưng không có khối try/catch bao quanh toàn bộ logic. Ví dụ `balance.js`, `daily.js`, `rank.js` — nếu bất kỳ `await` nào throw, exception sẽ không được bắt.

2. **Anti-pattern `throw` để thoát sớm**: `rob.js` dùng `throw new Error("exclude")` sau khi đã reply để thoát khỏi hàm. Đây là anti-pattern — nên dùng `return` thay vì `throw`.

3. **Thiếu null-check trước khi truy cập thuộc tính**: `warn.js` truy cập `d.id` và `d.roles.highest.position` mà không kiểm tra `d` có tồn tại không (member có thể đã rời server).

4. **Thiếu try/catch quanh thao tác render canvas**: `rank.js` gọi `s.build()` từ canvacord mà không có try/catch — nếu avatar URL không hợp lệ hoặc thư viện lỗi, bot crash.

5. **Thiếu try/catch quanh `t.save()` trong economy**: `daily.js`, `deposit.js`, `withdraw.js` gọi `.save()` trực tiếp mà không bắt lỗi DB.

### Nhóm 2 — Localization

6. **Dịch chưa hoàn chỉnh trong lần cập nhật trước**: Phần `Embeds` đã được dịch phần lớn, nhưng section `Logs` và `Strings` bị bỏ sót hoàn toàn. Một số Embeds lẻ (LevelUpEmbed, CantInteractEmbed, StarboardEmbed, v.v.) cũng chưa được dịch.

7. **Không có quy trình kiểm tra tự động**: Không có test nào kiểm tra xem tất cả value trong messages.yml đã được dịch chưa, dẫn đến các chuỗi tiếng Anh bị bỏ sót.

---

## Correctness Properties

Property 1: Bug Condition — Lệnh luôn phản hồi khi gặp lỗi

_For any_ interaction gửi đến một lệnh trong `src/commands/**/*.js` mà trong quá trình thực thi xảy ra exception (DB lỗi, API lỗi, input không hợp lệ, render lỗi), hàm `run()` đã được sửa SHALL bắt exception đó và gửi thông báo lỗi tiếng Việt thân thiện đến người dùng thay vì để interaction thất bại im lặng.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Bug Condition — Mọi chuỗi hiển thị cho người dùng đều bằng tiếng Việt

_For any_ key trong `config/messages.yml` thuộc section `Logs`, `Strings`, hoặc `Embeds` mà value chứa văn bản tiếng Anh (không phải placeholder kỹ thuật, URL, hay format code), file messages.yml đã được sửa SHALL có value tương ứng bằng tiếng Việt.

**Validates: Requirements 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19, 2.20**

Property 3: Preservation — Logic nghiệp vụ không thay đổi

_For any_ interaction hợp lệ (không kích hoạt bug condition) gửi đến một lệnh đã được sửa, hàm `run()` đã sửa SHALL tạo ra kết quả giống hệt hàm gốc — cùng embed, cùng thay đổi DB, cùng hành vi Discord API.

**Validates: Requirements 3.1, 3.6, 3.7, 3.8, 3.9**

Property 4: Preservation — YAML parse thành công sau khi dịch

_For any_ lần bot khởi động sau khi messages.yml đã được dịch, hệ thống SHALL parse file YAML thành công (không có lỗi cú pháp YAML), tất cả key vẫn truy cập được từ code, và tất cả placeholder trong value đã dịch vẫn được thay thế đúng bởi `replaceAll()`.

**Validates: Requirements 3.2, 3.3, 3.4, 3.5**

---

## Fix Implementation

### Nhóm 1 — Code Audit: Thay đổi cần thực hiện

**Nguyên tắc chung áp dụng cho tất cả file lệnh:**

**Thay đổi 1: Bọc toàn bộ `run()` bằng try/catch**

Mỗi file lệnh cần có cấu trúc:
```javascript
run: ({ interaction, client }) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    // ... toàn bộ logic lệnh ...
  } catch (error) {
    console.error(`[${commandName}] Error:`, error);
    const errorEmbed = new EmbedBuilder()
      .setTitle('❌ Đã xảy ra lỗi')
      .setDescription('Có lỗi xảy ra khi thực thi lệnh này. Vui lòng thử lại sau.')
      .setColor('Red');
    if (interaction.replied || interaction.deferred) {
      interaction.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
    } else {
      interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
    }
  }
})
```

**Thay đổi 2: Sửa anti-pattern `throw` trong `rob.js`**

- **File**: `src/commands/economy/rob.js`
- Thay `throw new Error("exclude")` bằng `return e.reply({...})` — trả về Promise trực tiếp

**Thay đổi 3: Thêm null-check cho member trong `warn.js`**

- **File**: `src/commands/moderation/warn.js`
- Kiểm tra `if (!d)` trước khi truy cập `d.id`, `d.roles.highest.position`
- Trả về thông báo lỗi nếu member không tồn tại trong server

**Thay đổi 4: Thêm try/catch quanh canvas render trong `rank.js`**

- **File**: `src/commands/general/rank.js`
- Bọc `s.build()` trong try/catch riêng với thông báo lỗi cụ thể

**Thay đổi 5: Kiểm tra input hợp lệ trong các lệnh economy**

- **Files**: `src/commands/economy/deposit.js`, `withdraw.js`, `pay.js`
- Kiểm tra amount > 0 và là số nguyên hợp lệ trước khi xử lý

### Nhóm 2 — Localization: Thay đổi cần thực hiện

**File**: `config/messages.yml`

**Thay đổi 6: Dịch toàn bộ section `Logs`**

Các key cần dịch (title và field names):
- `Logs.MessageUpdated`: title, field names (Author, Channel, Old Message, New Message, footer)
- `Logs.MessageDeleted`: title, field names
- `Logs.ChannelCreated`: title, field names (Channel, Channel Name, Channel Type)
- `Logs.ChannelDeleted`: title, field names (Channel Id, Channel Name, Channel Type)
- `Logs.ChannelUpdated`: title, field names (Channel, Old/New state)
- `Logs.EmojiCreated/Deleted/Updated`: title, field names (Name, Id, Animated, Old/New Name)
- `Logs.RoleCreated/Deleted`: title, field names (Role Name, Role Id, Role Color)
- Tất cả footer `"Logged by {bot-tag}"` → `"Ghi lại bởi {bot-tag}"`

**Thay đổi 7: Dịch toàn bộ section `Strings`**

Các key cần dịch:
- `WelcomeCard2ndLine`: `"Welcome to {guild-name}"` → `"Chào mừng đến {guild-name}"`
- `WelcomeCard3rdLine`: `"Member {memberCount}"` → `"Thành viên thứ {memberCount}"`
- `BlackJackYouBustDescription`, `BlackJackYouBustImageTitle`, `BlackJackYouWinDescription`, v.v.
- `TicketModalRegexError` và `TicketModalRegexErrorValue`

**Thay đổi 8: Dịch các Embeds lẻ còn tiếng Anh**

- `Embeds.LevelUpEmbed.description`
- `Embeds.StarboardEmbed.description` (phần `[Jump to message]`)
- `Embeds.CantInteractEmbed.title`
- `Embeds.GuessTheNumberWrongSelect.description`
- `Embeds.GuessTheNumberOutTime.description`
- `Embeds.TicketAlertUserEmbed.description`
- `Embeds.ReactionRoleAddedEmbed.description` và `ReactionRoleRemovedEmbed.description`
- `Embeds.TemporalRankAddEmbed.description` (phần tiếng Anh)
- `Embeds.TemporalRankRemoveEmbed.description`
- `Embeds.TemporalRankListEmbed` field names (User, Role, Expires At)
- `Embeds.SuggestPendingEmbed/AcceptedEmbed/DeclinedEmbed` field name `"Updated on the {updated-date}"`
- `Embeds.GiveawayEndEmbed.title`
- `Embeds.AfkListEmbed` field names (Status, Reason, Since)
- `Embeds.SnipeListEmbed` field names (Content, Attachments, Channel)
- `Embeds.WarnListEmbed` và `BannListEmbed` field names (Case, User, Date, Reason, Moderator)
- `Embeds.BackupListEmbed` field names (Preview, Backup Id, Created At, Emojis)
- `Embeds.ServerInfoEmbed` field names và values (Members, Boosters, Another)
- `Embeds.LeaderboardMessagesEmbed.panelsFormat` (phần `messages sent`)

---

## Testing Strategy

### Validation Approach

Chiến lược kiểm thử theo hai giai đoạn: (1) Xác nhận lỗi tồn tại trên code gốc (exploratory), (2) Xác nhận fix hoạt động đúng và không phá vỡ hành vi hiện có (fix + preservation checking).

### Exploratory Bug Condition Checking

**Goal**: Xác nhận các lỗi tồn tại trên code CHƯA sửa. Nếu test pass trên code gốc, cần xem lại phân tích root cause.

**Test Plan**: Viết test giả lập các tình huống lỗi (DB throw, input null, canvas lỗi) và quan sát hành vi của code gốc.

**Test Cases**:
1. **DB Error Test**: Giả lập `querys.users().economy().get()` throw error → quan sát `balance.js` không reply interaction (sẽ fail trên code gốc)
2. **Rob Anti-pattern Test**: Gọi `rob.js` với `user.id === interaction.user.id` → quan sát `throw new Error("exclude")` gây unhandled rejection (sẽ fail trên code gốc)
3. **Null Member Test**: Gọi `warn.js` với member đã rời server (getMember trả về null) → quan sát crash khi truy cập `d.id` (sẽ fail trên code gốc)
4. **Localization Test**: Parse messages.yml và kiểm tra tất cả value trong Logs/Strings → quan sát các chuỗi tiếng Anh (sẽ fail trên code gốc)

**Expected Counterexamples**:
- `balance.js` không reply khi DB lỗi → interaction timeout
- `rob.js` throw unhandled rejection thay vì return
- `warn.js` crash với `TypeError: Cannot read properties of null`
- messages.yml chứa ít nhất 30+ chuỗi tiếng Anh trong Logs và Strings

### Fix Checking

**Goal**: Xác nhận rằng sau khi sửa, tất cả input kích hoạt bug condition đều được xử lý đúng.

**Pseudocode:**
```
FOR ALL command WHERE isBugCondition_CodeAudit(command, input) DO
  result := run_fixed(command, input)
  ASSERT interaction.replied === true
  ASSERT reply.embeds[0].color === 'Red'
  ASSERT reply.embeds[0].title CONTAINS 'lỗi' OR 'Lỗi'
END FOR

FOR ALL key WHERE isBugCondition_Localization(key, value) DO
  fixedValue := messages_fixed[key]
  ASSERT fixedValue KHÔNG CONTAINS tiếng Anh
  ASSERT fixedValue CONTAINS tất cả placeholder từ value gốc
END FOR
```

### Preservation Checking

**Goal**: Xác nhận rằng sau khi sửa, các input KHÔNG kích hoạt bug condition vẫn hoạt động đúng như trước.

**Pseudocode:**
```
FOR ALL interaction WHERE NOT isBugCondition_CodeAudit(command, interaction) DO
  ASSERT run_original(command, interaction) = run_fixed(command, interaction)
END FOR

FOR ALL key IN messages_yml DO
  ASSERT key EXISTS IN messages_fixed
  ASSERT extractPlaceholders(messages_fixed[key]) = extractPlaceholders(messages_original[key])
END FOR
```

**Testing Approach**: Property-based testing phù hợp cho preservation checking vì:
- Tự động sinh nhiều interaction giả lập với input hợp lệ ngẫu nhiên
- Bắt được edge case mà unit test thủ công có thể bỏ sót
- Đảm bảo mạnh mẽ rằng logic nghiệp vụ không thay đổi

**Test Cases**:
1. **Economy Logic Preservation**: Verify `balance`, `daily`, `deposit`, `withdraw`, `pay`, `rob`, `work`, `weekly` tính toán đúng số dư với input hợp lệ
2. **Moderation Logic Preservation**: Verify `ban`, `warn`, `kick` ghi log đúng và thực thi đúng hành vi kiểm duyệt
3. **YAML Structure Preservation**: Verify messages.yml parse thành công, tất cả key tồn tại, tất cả placeholder được giữ nguyên
4. **Placeholder Replacement Preservation**: Verify `replaceAll()` thay thế đúng placeholder trong các chuỗi đã dịch

### Unit Tests

- Test từng lệnh với mock DB throw → verify interaction được reply với error embed
- Test `rob.js` với `user.id === victim.id` → verify return (không throw)
- Test `warn.js` với member null → verify null-check hoạt động
- Test `rank.js` với avatar URL không hợp lệ → verify canvas error được bắt
- Test parse messages.yml sau khi dịch → verify không có lỗi YAML syntax

### Property-Based Tests

- Sinh ngẫu nhiên các giá trị amount (âm, 0, dương, rất lớn) cho lệnh economy → verify validation hoạt động đúng
- Sinh ngẫu nhiên các chuỗi tiếng Việt với placeholder → verify `replaceAll()` thay thế đúng
- Sinh ngẫu nhiên các key từ messages.yml → verify tất cả key tồn tại và value không rỗng

### Integration Tests

- Khởi động bot với messages.yml đã dịch → verify không có lỗi parse khi load
- Thực thi lệnh `/balance` với DB mock → verify embed hiển thị đúng tiếng Việt
- Thực thi lệnh `/daily` khi DB throw → verify bot reply thông báo lỗi thay vì crash
- Kiểm tra log embed khi có sự kiện MessageUpdated → verify tiêu đề và field names bằng tiếng Việt
