"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const Command_1 = require("../../structures/Command");
const querys_1 = require("../../helpers/querys");
const sqliteDb_1 = tslib_1.__importDefault(require("../../helpers/sqliteDb"));

// ─── Progress bar helper ────────────────────────────────────────────────────
function buildProgressBar(step) {
  const bars = [
    "━━●────────",
    "━━━━━●─────",
    "━━━━━━━━●──",
    "━━━━━━━━━━●",
  ];
  return `${bars[step - 1]}  Bước ${step}/4`;
}

// ─── Step 1 embed builder ───────────────────────────────────────────────────
function buildStep1Embed(wizardState, client) {
  const tc = wizardState.ticketConfig;
  const fields = [
    {
      name: "👥 Số vé tối đa",
      value: tc.maxTickets !== null ? `✅ ${tc.maxTickets}` : "⬜ Chưa cấu hình",
      inline: true,
    },
    {
      name: "📰 Kênh Transcript",
      value: tc.transcriptChannel !== null ? `✅ <#${tc.transcriptChannel}>` : "⬜ Chưa cấu hình",
      inline: true,
    },
    {
      name: "🥤 Tự lưu transcript",
      value: tc.autoSaveTranscript !== null
        ? `✅ ${tc.autoSaveTranscript ? "Bật" : "Tắt"}`
        : "⬜ Chưa cấu hình",
      inline: true,
    },
    {
      name: "🎛 Loại giao diện",
      value: tc.messageType !== null
        ? `✅ ${tc.messageType === "buttons" ? "Nút bấm" : "Thanh chọn (Menu)"}`
        : "⬜ Chưa cấu hình",
      inline: true,
    },
  ];
  return new discord_js_1.EmbedBuilder()
    .setTitle(`⚙️ Thiết Lập Ticket  ${buildProgressBar(1)}`)
    .setDescription("Cấu hình các thông số chung cho hệ thống ticket.")
    .setColor(client.config.GeneralSettings.EmbedColor)
    .addFields(fields);
}

// ─── Step 1 buttons builder ─────────────────────────────────────────────────
function buildStep1Buttons(wizardState, disabled = false) {
  const tc = wizardState.ticketConfig;
  const row1 = new discord_js_1.ActionRowBuilder().addComponents(
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz-maxTickets")
      .setLabel("👥 Số vé tối đa")
      .setStyle(tc.maxTickets !== null ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary)
      .setDisabled(disabled),
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz-transcriptChannel")
      .setLabel("📰 Kênh Transcript")
      .setStyle(tc.transcriptChannel !== null ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary)
      .setDisabled(disabled),
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz-autoSave")
      .setLabel("🥤 Tự lưu")
      .setStyle(tc.autoSaveTranscript !== null ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary)
      .setDisabled(disabled),
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz-messageType")
      .setLabel("🎛 Loại giao diện")
      .setStyle(tc.messageType !== null ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary)
      .setDisabled(disabled),
  );
  const row2Components = [];
  const canAdvance = tc.maxTickets !== null && tc.messageType !== null;
  if (canAdvance) {
    row2Components.push(
      new discord_js_1.ButtonBuilder()
        .setCustomId("wiz-next")
        .setLabel("➡️ Tiếp theo")
        .setStyle(discord_js_1.ButtonStyle.Success)
        .setDisabled(disabled),
    );
  }
  row2Components.push(
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz-cancel")
      .setLabel("❌ Hủy")
      .setStyle(discord_js_1.ButtonStyle.Danger)
      .setDisabled(disabled),
  );
  const row2 = new discord_js_1.ActionRowBuilder().addComponents(...row2Components);
  return [row1, row2];
}

// ─── Step 2 embed builder ───────────────────────────────────────────────────
function buildStep2Embed(wizardState, client) {
  const p = wizardState.panel;
  const fields = [
    { name: "👤 Tên", value: p.name ? `✅ ${p.name}` : "⬜ Chưa cấu hình", inline: true },
    { name: "🥭 Emoji", value: p.emoji ? `✅ ${p.emoji}` : "⬜ Chưa cấu hình", inline: true },
    { name: "🎹 Danh mục", value: p.category ? `✅ <#${p.category}>` : "⬜ Chưa cấu hình", inline: true },
    { name: "💅 Kiểu nút", value: p.style ? `✅ ${["", "Primary", "Secondary", "Success", "Danger"][p.style]}` : "⬜ Chưa cấu hình", inline: true },
    { name: "🕵️ Vai trò", value: p.roles.length ? `✅ ${p.roles.map(r => `<@&${r}>`).join(", ")}` : "⬜ Chưa cấu hình", inline: true },
  ];
  return new discord_js_1.EmbedBuilder()
    .setTitle(`⚙️ Thiết Lập Panel  ${buildProgressBar(2)}`)
    .setDescription("Tạo panel ticket mới. Nhấn từng nút để điền thông tin.")
    .setColor(client.config.GeneralSettings.EmbedColor)
    .addFields(fields);
}

// ─── Step 2 buttons builder ─────────────────────────────────────────────────
function buildStep2Buttons(wizardState, hasExistingPanels, disabled = false) {
  const p = wizardState.panel;
  const row1 = new discord_js_1.ActionRowBuilder().addComponents(
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz2-name").setLabel("Tên").setEmoji("👤")
      .setStyle(p.name ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary)
      .setDisabled(disabled),
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz2-emoji").setLabel("Emoji").setEmoji("🥭")
      .setStyle(p.emoji ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary)
      .setDisabled(disabled),
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz2-category").setLabel("Danh mục").setEmoji("🎹")
      .setStyle(p.category ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary)
      .setDisabled(disabled),
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz2-style").setLabel("Kiểu").setEmoji("💅")
      .setStyle(p.style ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary)
      .setDisabled(disabled),
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz2-roles").setLabel("Vai trò").setEmoji("🕵️")
      .setStyle(p.roles.length ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary)
      .setDisabled(disabled),
  );
  const row2Components = [
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz2-label").setLabel("Hiển thị tên").setEmoji("🪐")
      .setStyle(p.label !== null ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary)
      .setDisabled(disabled),
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz2-questions")
      .setLabel(p.questions.length ? `Câu hỏi (${p.questions.length})` : "Câu hỏi")
      .setEmoji("⁉️")
      .setStyle(p.questions.length ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary)
      .setDisabled(disabled),
  ];
  const allFilled = p.name && p.emoji && p.category && p.style && p.roles.length && p.label !== null;
  if (allFilled) {
    row2Components.push(
      new discord_js_1.ButtonBuilder()
        .setCustomId("wiz2-save").setLabel("✔️ Lưu & Tiếp").setEmoji("✔️")
        .setStyle(discord_js_1.ButtonStyle.Success).setDisabled(disabled),
    );
  }
  if (hasExistingPanels) {
    row2Components.push(
      new discord_js_1.ButtonBuilder()
        .setCustomId("wiz2-skip").setLabel("⏭️ Bỏ qua")
        .setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(disabled),
    );
  }
  const row2 = new discord_js_1.ActionRowBuilder().addComponents(...row2Components);
  return [row1, row2];
}

// ─── Step 3 embed builder (Embed setup) ─────────────────────────────────────
function buildStep3Embed(wizardState, client) {
  const ce = wizardState.ticketConfig.customEmbed;
  const fields = [
    {
      name: "📌 Tiêu đề",
      value: ce && ce.title ? `✅ ${ce.title}` : "⬜ Dùng mặc định",
      inline: true,
    },
    {
      name: "🎨 Màu sắc",
      value: ce && ce.color ? `✅ ${ce.color}` : "⬜ Dùng mặc định",
      inline: true,
    },
    {
      name: "🦶 Footer",
      value: ce && ce.footer && ce.footer.text ? `✅ ${ce.footer.text}` : "⬜ Dùng mặc định",
      inline: true,
    },
    {
      name: "📝 Nội dung (Description)",
      value: ce && ce.description ? `✅ ${ce.description.substring(0, 80)}${ce.description.length > 80 ? "..." : ""}` : "⬜ Dùng mặc định",
      inline: false,
    },
  ];
  return new discord_js_1.EmbedBuilder()
    .setTitle(`✏️ Chỉnh Embed Ticket  ${buildProgressBar(3)}`)
    .setDescription(
      "Tùy chỉnh embed **Phiếu Hỗ Trợ** hiển thị khi gửi panel ticket.\n" +
      "Để trống = dùng nội dung mặc định từ `messages.yml`.\n\n" +
      "Dùng `{panels}` trong description để hiển thị danh sách panel."
    )
    .setColor(client.config.GeneralSettings.EmbedColor)
    .addFields(fields);
}

// ─── Step 3 buttons builder ──────────────────────────────────────────────────
function buildStep3Buttons(wizardState, disabled = false) {
  const row1 = new discord_js_1.ActionRowBuilder().addComponents(
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz3-edit").setLabel("✏️ Chỉnh sửa embed")
      .setStyle(discord_js_1.ButtonStyle.Primary).setDisabled(disabled),
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz3-preview").setLabel("👁️ Xem trước")
      .setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(disabled),
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz3-reset").setLabel("🔄 Đặt lại mặc định")
      .setStyle(discord_js_1.ButtonStyle.Danger).setDisabled(disabled),
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz3-next").setLabel("➡️ Tiếp theo")
      .setStyle(discord_js_1.ButtonStyle.Success).setDisabled(disabled),
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz-cancel").setLabel("❌ Hủy")
      .setStyle(discord_js_1.ButtonStyle.Danger).setDisabled(disabled),
  );
  return [row1];
}

// ─── Step 4 embed builder (Send panel) ──────────────────────────────────────
function buildStep4Embed(wizardState, client) {
  const p = wizardState.panel;
  const panelName = p.name || "(panel đã chọn)";
  const panelEmoji = p.emoji || "";
  return new discord_js_1.EmbedBuilder()
    .setTitle(`📤 Gửi Panel  ${buildProgressBar(4)}`)
    .setDescription("Chọn kênh để gửi panel ticket.")
    .setColor(client.config.GeneralSettings.EmbedColor)
    .addFields(
      {
        name: "📋 Panel đã tạo",
        value: `${panelEmoji} ${panelName}`,
        inline: false,
      },
      {
        name: "📢 Kênh đích",
        value: wizardState.targetChannel ? `✅ <#${wizardState.targetChannel}>` : "⬜ Chưa chọn",
        inline: false,
      },
    );
}

// ─── Step 4 buttons builder ──────────────────────────────────────────────────
function buildStep4Buttons(wizardState, disabled = false) {
  const components = [
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz4-channel").setLabel("📢 Chọn kênh")
      .setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(disabled),
  ];
  if (wizardState.targetChannel) {
    components.push(
      new discord_js_1.ButtonBuilder()
        .setCustomId("wiz4-confirm").setLabel("✅ Xác nhận gửi")
        .setStyle(discord_js_1.ButtonStyle.Success).setDisabled(disabled),
    );
  }
  components.push(
    new discord_js_1.ButtonBuilder()
      .setCustomId("wiz-cancel").setLabel("❌ Hủy")
      .setStyle(discord_js_1.ButtonStyle.Danger).setDisabled(disabled),
  );
  return [new discord_js_1.ActionRowBuilder().addComponents(...components)];
}

// ─── Completion embed ───────────────────────────────────────────────────────
function buildCompletionEmbed(wizardState) {
  const p = wizardState.panel;
  const styleNames = ["", "Primary", "Secondary", "Success", "Danger"];
  return new discord_js_1.EmbedBuilder()
    .setTitle("✅ Thiết Lập Hoàn Tất!")
    .setColor("Green")
    .addFields(
      { name: "📋 Tên Panel", value: p.name || "N/A", inline: true },
      { name: "📢 Kênh đích", value: wizardState.targetChannel ? `<#${wizardState.targetChannel}>` : "N/A", inline: true },
      { name: "💅 Kiểu nút", value: styleNames[p.style] || "N/A", inline: true },
      { name: "❓ Số câu hỏi", value: String(p.questions.length), inline: true },
    );
}

// ─── Cancel embed ───────────────────────────────────────────────────────────
function buildCancelEmbed() {
  return new discord_js_1.EmbedBuilder()
    .setTitle("❌ Đã Hủy Thiết Lập")
    .setDescription("Tiến trình đã lưu được giữ nguyên.")
    .setColor("Red");
}

// ─── Timeout embed ──────────────────────────────────────────────────────────
function buildTimeoutEmbed() {
  return new discord_js_1.EmbedBuilder()
    .setTitle("⏰ Đã Hết Thời Gian")
    .setDescription("Phiên thiết lập đã kết thúc do không có hoạt động trong 300 giây.")
    .setColor("Red");
}

// ─── Main command export ────────────────────────────────────────────────────
exports.default = new Command_1.Command({
  name: "ticket-setup",
  description: "Thiết lập hệ thống ticket qua trình hướng dẫn từng bước",
  run: ({ interaction: e, client: t }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
        // ── Fetch guild data & pre-load existing config ───────────────────────
        const guildData = yield (0, querys_1.guilds)().get(e.guildId);
        const existingTc = guildData?.ticketConfig || {};

        // ── Wizard state — pre-populated with existing DB values ──────────────
        const wizardState = {
          step: 1,
          ticketConfig: {
            maxTickets: existingTc.maxTickets ?? null,
            transcriptChannel: existingTc.transcriptChannel ?? null,
            autoSaveTranscript: existingTc.autoSaveTranscript ?? null,
            messageType: existingTc.messageType ?? null,
            customEmbed: existingTc.customEmbed ?? null,
          },
          panel: {
            customId: new sqliteDb_1.default.Types.ObjectId().toString(),
            name: null,
            emoji: null,
            category: null,
            roles: [],
            style: 1,
            label: true,
            questions: [],
          },
          targetChannel: null,
        };

        const hasExistingPanels = !!(existingTc.panels && existingTc.panels.length > 0);

        // ── Send step 1 ───────────────────────────────────────────────────────
        const msg = yield e.reply({
          embeds: [buildStep1Embed(wizardState, t)],
          components: buildStep1Buttons(wizardState),
          fetchReply: true,
        });

        // ── Main collector (300s timeout) ─────────────────────────────────────
        const collector = msg.createMessageComponentCollector({
          filter: (i) => i.user.id === e.user.id,
          time: 300_000,
        });

        // ── Helper: save step-1 config to DB ─────────────────────────────────
        const saveStep1 = () =>
          tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const tc = wizardState.ticketConfig;
            const updates = {};
            if (tc.maxTickets !== null) updates["ticketConfig.maxTickets"] = tc.maxTickets;
            if (tc.transcriptChannel !== null) updates["ticketConfig.transcriptChannel"] = tc.transcriptChannel;
            if (tc.autoSaveTranscript !== null) updates["ticketConfig.autoSaveTranscript"] = tc.autoSaveTranscript;
            if (tc.messageType !== null) updates["ticketConfig.messageType"] = tc.messageType;
            // customEmbed: save even if null (null = reset to default)
            updates["ticketConfig.customEmbed"] = tc.customEmbed;
            if (Object.keys(updates).length > 0) {
              yield guildData.updateOne({ $set: updates });
            }
          });

        // ── Helper: refresh dashboard if configured ───────────────────────────
        const refreshDashboard = () =>
          tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            try {
              const DashboardManager = require("../../helpers/dashboardManager").DashboardManager;
              if (DashboardManager && t.config.TicketDashboard && t.config.TicketDashboard.Enabled) {
                const dm = new DashboardManager(t);
                yield dm.init();
              }
            } catch (_) { /* dashboard refresh is best-effort */ }
          });

        // ── Step 2 questions sub-flow ─────────────────────────────────────────
        const handleQuestionsFlow = (btn) =>
          tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const buildQButtons = (dis = false) => [
              new discord_js_1.ActionRowBuilder().addComponents(
                new discord_js_1.ButtonBuilder()
                  .setCustomId("wiz2-q-add").setLabel("Thêm").setEmoji("🧩")
                  .setStyle(discord_js_1.ButtonStyle.Success)
                  .setDisabled(wizardState.panel.questions.length >= 25 || dis),
                new discord_js_1.ButtonBuilder()
                  .setCustomId("wiz2-q-remove").setLabel("Xóa").setEmoji("🗑️")
                  .setStyle(discord_js_1.ButtonStyle.Danger)
                  .setDisabled(wizardState.panel.questions.length <= 0 || dis),
                new discord_js_1.ButtonBuilder()
                  .setCustomId("wiz2-q-list").setLabel("Danh sách").setEmoji("🖼️")
                  .setStyle(discord_js_1.ButtonStyle.Primary)
                  .setDisabled(wizardState.panel.questions.length <= 0 || dis),
                new discord_js_1.ButtonBuilder()
                  .setCustomId("wiz2-q-back").setLabel("Back").setEmoji("⬅️")
                  .setStyle(discord_js_1.ButtonStyle.Secondary).setDisabled(dis),
              ),
            ];
            const qEmbed = () =>
              new discord_js_1.EmbedBuilder()
                .setTitle("⚙️ Chọn tuỳ chọn câu hỏi")
                .setDescription("Dùng các nút bên dưới để thêm hoặc xóa câu hỏi.")
                .setColor(t.config.GeneralSettings.EmbedColor);

            yield btn.update({ embeds: [qEmbed()], components: buildQButtons() });

            const qCollector = msg.createMessageComponentCollector({
              filter: (i) => i.user.id === e.user.id,
              componentType: discord_js_1.ComponentType.Button,
              time: 300_000,
            });

            yield new Promise((resolve) => {
              qCollector.on("collect", (qBtn) =>
                tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                  qCollector.resetTimer();
                  collector.resetTimer();
                  const qId = qBtn.customId;

                  if (qId === "wiz2-q-back") {
                    qCollector.stop("back");
                    yield qBtn.update({
                      embeds: [buildStep2Embed(wizardState, t)],
                      components: buildStep2Buttons(wizardState, hasExistingPanels),
                    });
                    return;
                  }

                  if (qId === "wiz2-q-list") {
                    const desc = wizardState.panel.questions.length
                      ? wizardState.panel.questions.map(q =>
                          `**${q.name}** • ${q.description || "—"} • **${q.required ? "Bắt buộc" : "Không bắt buộc"}** • ${q.type === 1 ? "Ngắn" : "Dài"}`
                        ).join("\n")
                      : "Chưa có câu hỏi nào.";
                    yield qBtn.update({
                      embeds: [new discord_js_1.EmbedBuilder().setTitle("🖼️ Danh sách Câu Hỏi").setDescription(desc).setColor(t.config.GeneralSettings.EmbedColor)],
                      components: [new discord_js_1.ActionRowBuilder().addComponents(
                        new discord_js_1.ButtonBuilder().setCustomId("wiz2-q-back2").setLabel("Quay lại").setEmoji("⬅️").setStyle(discord_js_1.ButtonStyle.Secondary),
                      )],
                    });
                    return;
                  }

                  if (qId === "wiz2-q-back2") {
                    yield qBtn.update({ embeds: [qEmbed()], components: buildQButtons() });
                    return;
                  }

                  if (qId === "wiz2-q-remove") {
                    yield qBtn.update({ embeds: [qEmbed().setTitle("❔ Tên câu hỏi muốn xóa?").setDescription("Nhập tên câu hỏi bạn muốn xóa.")], components: buildQButtons(true) });
                    try {
                      const collected = yield e.channel.awaitMessages({ filter: m => m.author.id === e.user.id, max: 1, time: 60_000 });
                      yield collected.first().delete().catch(() => {});
                      const found = wizardState.panel.questions.find(q => q.name.toLowerCase() === collected.first().content.toLowerCase());
                      if (found) {
                        wizardState.panel.questions.splice(wizardState.panel.questions.findIndex(q => q.name === found.name), 1);
                      }
                    } catch (_) {}
                    yield e.editReply({ embeds: [qEmbed()], components: buildQButtons() });
                    return;
                  }

                  if (qId === "wiz2-q-add") {
                    const ts = Date.now();
                    yield qBtn.showModal(
                      new discord_js_1.ModalBuilder()
                        .setCustomId(`wiz-add-q-${ts}`)
                        .setTitle("Tạo Câu Hỏi Ticket")
                        .setComponents(
                          new discord_js_1.ActionRowBuilder().addComponents(
                            new discord_js_1.TextInputBuilder().setStyle(discord_js_1.TextInputStyle.Short).setCustomId("modal-name").setLabel("✍ Tên câu hỏi").setRequired(true).setMaxLength(44),
                          ),
                          new discord_js_1.ActionRowBuilder().addComponents(
                            new discord_js_1.TextInputBuilder().setStyle(discord_js_1.TextInputStyle.Short).setCustomId("modal-type").setLabel('📌 Loại (Short/Paragraph)').setRequired(true).setMaxLength(9).setMinLength(5),
                          ),
                          new discord_js_1.ActionRowBuilder().addComponents(
                            new discord_js_1.TextInputBuilder().setStyle(discord_js_1.TextInputStyle.Short).setCustomId("modal-required").setLabel('🎯 Bắt buộc (Yes/No)').setRequired(true).setMaxLength(3).setMinLength(2),
                          ),
                          new discord_js_1.ActionRowBuilder().addComponents(
                            new discord_js_1.TextInputBuilder().setStyle(discord_js_1.TextInputStyle.Short).setCustomId("modal-description").setLabel("📃 Mô tả").setRequired(false).setMaxLength(100),
                          ),
                          new discord_js_1.ActionRowBuilder().addComponents(
                            new discord_js_1.TextInputBuilder().setStyle(discord_js_1.TextInputStyle.Short).setCustomId("modal-regex").setLabel("👮‍♂️ Regex").setRequired(false),
                          ),
                        ),
                    );
                    try {
                      const modal = yield e.awaitModalSubmit({ filter: i => i.user.id === e.user.id && i.customId === `wiz-add-q-${ts}`, time: 300_000 });
                      if (!modal) return;
                      const reqVal = modal.fields.getTextInputValue("modal-required").toLowerCase();
                      const typeVal = modal.fields.getTextInputValue("modal-type").toLowerCase();
                      const descVal = modal.fields.getTextInputValue("modal-description");
                      const nameVal = modal.fields.getTextInputValue("modal-name");
                      const q = {
                        name: nameVal,
                        regex: null,
                        description: descVal,
                        type: "paragraph" === typeVal ? discord_js_1.TextInputStyle.Paragraph : discord_js_1.TextInputStyle.Short,
                        required: "yes" === reqVal,
                      };
                      try { q.regex = new RegExp(modal.fields.getTextInputValue("modal-regex")); } catch (_) { q.regex = null; }
                      wizardState.panel.questions.push(q);
                      yield modal.reply({ content: `✅ Câu hỏi **${nameVal}** đã được thêm.`, ephemeral: true });
                      yield e.editReply({ embeds: [qEmbed()], components: buildQButtons() });
                    } catch (_) {
                      yield e.editReply({ embeds: [qEmbed()], components: buildQButtons() }).catch(() => {});
                    }
                    return;
                  }
                }),
              );
              qCollector.on("end", () => resolve());
            });
          });

        // ── Collector event handler ───────────────────────────────────────────
        collector.on("collect", (btn) =>
          tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            collector.resetTimer();
            const id = btn.customId;

            // ── Cancel ──────────────────────────────────────────────────────
            if (id === "wiz-cancel") {
              yield saveStep1();
              collector.stop("cancel");
              yield btn.update({ embeds: [buildCancelEmbed()], components: [] });
              return;
            }

            // ════════════════════════════════════════════════════════════════
            // STEP 1 handlers
            // ════════════════════════════════════════════════════════════════
            if (wizardState.step === 1) {

              // ── Next ──────────────────────────────────────────────────────
              if (id === "wiz-next") {
                yield saveStep1();
                wizardState.step = 2;
                yield btn.update({
                  embeds: [buildStep2Embed(wizardState, t)],
                  components: buildStep2Buttons(wizardState, hasExistingPanels),
                });
                return;
              }

              // ── maxTickets ────────────────────────────────────────────────
              if (id === "wiz-maxTickets") {
                yield btn.update({
                  embeds: [buildStep1Embed(wizardState, t).setDescription("Nhập số vé tối đa (1-10):").setColor("Blue")],
                  components: buildStep1Buttons(wizardState, true),
                });
                try {
                  const collected = yield e.channel.awaitMessages({
                    filter: m => m.author.id === e.user.id,
                    max: 1,
                    time: 60_000,
                  });
                  const val = parseInt(collected.first().content, 10);
                  yield collected.first().delete().catch(() => {});
                  if (!isNaN(val) && val >= 1 && val <= 100) {
                    wizardState.ticketConfig.maxTickets = val;
                  }
                } catch (_) {}
                yield e.editReply({
                  embeds: [buildStep1Embed(wizardState, t)],
                  components: buildStep1Buttons(wizardState),
                });
                return;
              }

              // ── transcriptChannel ─────────────────────────────────────────
              if (id === "wiz-transcriptChannel") {
                const reply = yield btn.update({
                  embeds: [buildStep1Embed(wizardState, t).setDescription("Chọn kênh lưu transcript:").setColor("Blue")],
                  components: [
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.ChannelSelectMenuBuilder()
                        .setCustomId("wiz-ch-select")
                        .setChannelTypes(discord_js_1.ChannelType.GuildText)
                        .setMaxValues(1),
                    ),
                  ],
                  fetchReply: true,
                });
                try {
                  const sel = yield reply.awaitMessageComponent({
                    componentType: discord_js_1.ComponentType.ChannelSelect,
                    filter: i => i.user.id === e.user.id,
                    time: 60_000,
                  });
                  wizardState.ticketConfig.transcriptChannel = sel.values[0];
                  yield sel.update({
                    embeds: [buildStep1Embed(wizardState, t)],
                    components: buildStep1Buttons(wizardState),
                  });
                } catch (_) {
                  yield e.editReply({
                    embeds: [buildStep1Embed(wizardState, t)],
                    components: buildStep1Buttons(wizardState),
                  });
                }
                return;
              }

              // ── autoSaveTranscript ────────────────────────────────────────
              if (id === "wiz-autoSave") {
                const reply = yield btn.update({
                  embeds: [buildStep1Embed(wizardState, t).setDescription("Tự động lưu transcript khi đóng vé?").setColor("Blue")],
                  components: [
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.ButtonBuilder().setCustomId("wiz-as-yes").setLabel("✅ Bật").setStyle(discord_js_1.ButtonStyle.Success),
                      new discord_js_1.ButtonBuilder().setCustomId("wiz-as-no").setLabel("❌ Tắt").setStyle(discord_js_1.ButtonStyle.Danger),
                    ),
                  ],
                  fetchReply: true,
                });
                try {
                  const sel = yield reply.awaitMessageComponent({
                    componentType: discord_js_1.ComponentType.Button,
                    filter: i => i.user.id === e.user.id,
                    time: 60_000,
                  });
                  wizardState.ticketConfig.autoSaveTranscript = sel.customId === "wiz-as-yes";
                  yield sel.update({
                    embeds: [buildStep1Embed(wizardState, t)],
                    components: buildStep1Buttons(wizardState),
                  });
                } catch (_) {
                  yield e.editReply({
                    embeds: [buildStep1Embed(wizardState, t)],
                    components: buildStep1Buttons(wizardState),
                  });
                }
                return;
              }

              // ── messageType ───────────────────────────────────────────────
              if (id === "wiz-messageType") {
                const reply = yield btn.update({
                  embeds: [buildStep1Embed(wizardState, t).setDescription("Chọn loại giao diện ticket:").setColor("Blue")],
                  components: [
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.ButtonBuilder().setCustomId("wiz-mt-buttons").setLabel("✅ Nút bấm").setEmoji("✅").setStyle(discord_js_1.ButtonStyle.Secondary),
                      new discord_js_1.ButtonBuilder().setCustomId("wiz-mt-menus").setLabel("📁 Thanh chọn (Menu)").setEmoji("📁").setStyle(discord_js_1.ButtonStyle.Primary),
                    ),
                  ],
                  fetchReply: true,
                });
                try {
                  const sel = yield reply.awaitMessageComponent({
                    componentType: discord_js_1.ComponentType.Button,
                    filter: i => i.user.id === e.user.id,
                    time: 60_000,
                  });
                  wizardState.ticketConfig.messageType = sel.customId === "wiz-mt-buttons" ? "buttons" : "menus";
                  yield sel.update({
                    embeds: [buildStep1Embed(wizardState, t)],
                    components: buildStep1Buttons(wizardState),
                  });
                } catch (_) {
                  yield e.editReply({
                    embeds: [buildStep1Embed(wizardState, t)],
                    components: buildStep1Buttons(wizardState),
                  });
                }
                return;
              }

              // ── Embed setup ───────────────────────────────────────────────
              if (id === "wiz-embedSetup") {
                wizardState.step = 4;
                yield btn.update({
                  embeds: [buildStep4Embed(wizardState, t)],
                  components: buildStep4Buttons(),
                });
                return;
              }
            }

            // ════════════════════════════════════════════════════════════════
            // STEP 2 handlers
            // ════════════════════════════════════════════════════════════════
            if (wizardState.step === 2) {

              // ── Skip step 2 ───────────────────────────────────────────────
              if (id === "wiz2-skip") {
                // Use first existing panel for step 3
                const existingPanel = guildData.ticketConfig.panels[0];
                if (existingPanel) {
                  wizardState.panel = Object.assign({}, existingPanel);
                }
                wizardState.step = 3;
                yield btn.update({
                  embeds: [buildStep3Embed(wizardState, t)],
                  components: buildStep3Buttons(wizardState),
                });
                return;
              }

              // ── Save & advance to step 3 ──────────────────────────────────
              if (id === "wiz2-save") {
                // Save panel to DB
                yield guildData.updateOne({ $push: { "ticketConfig.panels": wizardState.panel } });
                wizardState.step = 3;
                yield btn.update({
                  embeds: [buildStep3Embed(wizardState, t)],
                  components: buildStep3Buttons(wizardState),
                });
                return;
              }

              // ── Questions sub-flow ────────────────────────────────────────
              if (id === "wiz2-questions") {
                yield handleQuestionsFlow(btn);
                return;
              }

              // ── Style picker ──────────────────────────────────────────────
              if (id === "wiz2-style") {
                yield btn.update({
                  embeds: [buildStep2Embed(wizardState, t).setTitle("⚙️ Chọn màu nút bấm")],
                  components: [
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.ButtonBuilder().setCustomId("wiz2-s-1").setStyle(discord_js_1.ButtonStyle.Primary).setLabel("Primary"),
                      new discord_js_1.ButtonBuilder().setCustomId("wiz2-s-2").setStyle(discord_js_1.ButtonStyle.Secondary).setLabel("Secondary"),
                      new discord_js_1.ButtonBuilder().setCustomId("wiz2-s-3").setStyle(discord_js_1.ButtonStyle.Success).setLabel("Success"),
                      new discord_js_1.ButtonBuilder().setCustomId("wiz2-s-4").setStyle(discord_js_1.ButtonStyle.Danger).setLabel("Danger"),
                    ),
                  ],
                });
                return;
              }

              if (["wiz2-s-1", "wiz2-s-2", "wiz2-s-3", "wiz2-s-4"].includes(id)) {
                wizardState.panel.style = parseInt(id.replace("wiz2-s-", ""), 10);
                yield btn.update({
                  embeds: [buildStep2Embed(wizardState, t)],
                  components: buildStep2Buttons(wizardState, hasExistingPanels),
                });
                return;
              }

              // ── Label picker ──────────────────────────────────────────────
              if (id === "wiz2-label") {
                yield btn.update({
                  embeds: [buildStep2Embed(wizardState, t).setTitle("🎯 Hiển thị tên trên nút ticket")],
                  components: [
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.ButtonBuilder().setCustomId("wiz2-l-yes").setStyle(discord_js_1.ButtonStyle.Success).setLabel("✅ Có"),
                      new discord_js_1.ButtonBuilder().setCustomId("wiz2-l-no").setStyle(discord_js_1.ButtonStyle.Danger).setLabel("❌ Không"),
                    ),
                  ],
                });
                return;
              }

              if (id === "wiz2-l-yes" || id === "wiz2-l-no") {
                wizardState.panel.label = id === "wiz2-l-yes";
                yield btn.update({
                  embeds: [buildStep2Embed(wizardState, t)],
                  components: buildStep2Buttons(wizardState, hasExistingPanels),
                });
                return;
              }

              // ── Roles picker ──────────────────────────────────────────────
              if (id === "wiz2-roles") {
                const reply = yield btn.update({
                  embeds: [buildStep2Embed(wizardState, t).setDescription("Chọn vai trò có thể nhìn thấy ticket.").setColor("Red")],
                  components: [
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.RoleSelectMenuBuilder()
                        .setCustomId("wiz2-roles-select").setMinValues(1).setMaxValues(10),
                    ),
                  ],
                  fetchReply: true,
                });
                try {
                  const sel = yield reply.awaitMessageComponent({
                    componentType: discord_js_1.ComponentType.RoleSelect,
                    filter: i => i.user.id === e.user.id,
                    time: 60_000,
                  });
                  wizardState.panel.roles = sel.values;
                  yield sel.update({
                    embeds: [buildStep2Embed(wizardState, t)],
                    components: buildStep2Buttons(wizardState, hasExistingPanels),
                  });
                } catch (_) {
                  yield e.editReply({
                    embeds: [buildStep2Embed(wizardState, t)],
                    components: buildStep2Buttons(wizardState, hasExistingPanels),
                  });
                }
                return;
              }

              // ── Category picker ───────────────────────────────────────────
              if (id === "wiz2-category") {
                const reply = yield btn.update({
                  embeds: [buildStep2Embed(wizardState, t).setDescription("Chọn danh mục nơi ticket sẽ được tạo.").setColor("Red")],
                  components: [
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.ChannelSelectMenuBuilder()
                        .setCustomId("wiz2-cat-select")
                        .setChannelTypes(discord_js_1.ChannelType.GuildCategory)
                        .setMaxValues(1),
                    ),
                  ],
                  fetchReply: true,
                });
                try {
                  const sel = yield reply.awaitMessageComponent({
                    componentType: discord_js_1.ComponentType.ChannelSelect,
                    filter: i => i.user.id === e.user.id,
                    time: 60_000,
                  });
                  wizardState.panel.category = sel.values[0];
                  yield sel.update({
                    embeds: [buildStep2Embed(wizardState, t)],
                    components: buildStep2Buttons(wizardState, hasExistingPanels),
                  });
                } catch (_) {
                  yield e.editReply({
                    embeds: [buildStep2Embed(wizardState, t)],
                    components: buildStep2Buttons(wizardState, hasExistingPanels),
                  });
                }
                return;
              }

              // ── Text fields: name, emoji ──────────────────────────────────
              if (id === "wiz2-name" || id === "wiz2-emoji") {
                yield btn.update({
                  embeds: [buildStep2Embed(wizardState, t).setDescription(id === "wiz2-name" ? "Nhập tên panel:" : "Nhập emoji panel:").setColor("Blue")],
                  components: buildStep2Buttons(wizardState, hasExistingPanels, true),
                });
                try {
                  const collected = yield e.channel.awaitMessages({
                    filter: m => m.author.id === e.user.id,
                    max: 1,
                    time: 60_000,
                  });
                  const val = collected.first().content;
                  yield collected.first().delete().catch(() => {});
                  if (id === "wiz2-name") {
                    wizardState.panel.name = val;
                  } else {
                    const emojiRegex = /<:[^:\s]+:\d+>|<a:[^:\s]+:\d+>|(©|®|[ -㌀]|[퀀-]|️)/g;
                    if (emojiRegex.test(val)) {
                      wizardState.panel.emoji = val;
                    } else {
                      yield e.followUp({ content: `⛔ **${val}** không phải emoji hợp lệ.`, ephemeral: true });
                    }
                  }
                } catch (_) {}
                yield e.editReply({
                  embeds: [buildStep2Embed(wizardState, t)],
                  components: buildStep2Buttons(wizardState, hasExistingPanels),
                });
                return;
              }
            }

            // ════════════════════════════════════════════════════════════════
            // STEP 3 handlers — Embed setup
            // ════════════════════════════════════════════════════════════════
            if (wizardState.step === 3) {

              // ── Next → step 4 ─────────────────────────────────────────────
              if (id === "wiz3-next") {
                yield saveStep1();
                wizardState.step = 4;
                yield btn.update({
                  embeds: [buildStep4Embed(wizardState, t)],
                  components: buildStep4Buttons(wizardState),
                });
                return;
              }

              // ── Reset to default ──────────────────────────────────────────
              if (id === "wiz3-reset") {
                wizardState.ticketConfig.customEmbed = null;
                yield saveStep1();
                yield btn.update({
                  embeds: [buildStep3Embed(wizardState, t)],
                  components: buildStep3Buttons(wizardState),
                });
                return;
              }

              // ── Preview ───────────────────────────────────────────────────
              if (id === "wiz3-preview") {
                const replaceAll = require("../../helpers/replaceAll").default;
                const freshGuildData = yield (0, querys_1.guilds)().get(e.guildId);
                const panels = freshGuildData.ticketConfig.panels || [];
                const panelListStr = panels.length
                  ? panels.map(p => replaceAll(t.messages.Embeds.CreateTicketEmbed.panelsFormat, { "{emoji}": p.emoji, "{name}": p.name })).join("\n")
                  : "(chưa có panel nào)";

                let previewEmbed;
                const ce = wizardState.ticketConfig.customEmbed;
                if (ce) {
                  const raw = ce.embeds ? ce.embeds[0] : ce;
                  previewEmbed = replaceAll(raw, { "{panels}": panelListStr });
                } else {
                  previewEmbed = replaceAll(t.messages.Embeds.CreateTicketEmbed, { "{panels}": panelListStr });
                }

                try {
                  yield e.followUp({
                    content: "👁️ **Xem trước embed (chỉ bạn thấy):**",
                    embeds: [previewEmbed],
                    ephemeral: true,
                  });
                } catch (_) {}
                yield btn.update({
                  embeds: [buildStep3Embed(wizardState, t)],
                  components: buildStep3Buttons(wizardState),
                });
                return;
              }

              // ── Edit embed via modal ──────────────────────────────────────
              if (id === "wiz3-edit") {
                const ce = wizardState.ticketConfig.customEmbed;
                const currentTitle = ce && ce.title ? ce.title : t.messages.Embeds.CreateTicketEmbed.title || "";
                const currentDesc = ce && ce.description ? ce.description : t.messages.Embeds.CreateTicketEmbed.description || "";
                const currentColor = ce && ce.color ? ce.color : t.messages.Embeds.CreateTicketEmbed.color || "";
                const currentFooter = ce && ce.footer && ce.footer.text ? ce.footer.text : (t.messages.Embeds.CreateTicketEmbed.footer && t.messages.Embeds.CreateTicketEmbed.footer.text) || "";

                const ts = Date.now();
                yield btn.showModal(
                  new discord_js_1.ModalBuilder()
                    .setCustomId(`wiz3-embed-modal-${ts}`)
                    .setTitle("Chỉnh Sửa Embed Phiếu Hỗ Trợ")
                    .setComponents(
                      new discord_js_1.ActionRowBuilder().addComponents(
                        new discord_js_1.TextInputBuilder()
                          .setCustomId("embed-title")
                          .setLabel("📌 Tiêu đề (để trống = mặc định)")
                          .setStyle(discord_js_1.TextInputStyle.Short)
                          .setRequired(false)
                          .setMaxLength(256)
                          .setValue(currentTitle),
                      ),
                      new discord_js_1.ActionRowBuilder().addComponents(
                        new discord_js_1.TextInputBuilder()
                          .setCustomId("embed-description")
                          .setLabel("📝 Nội dung (dùng {panels} cho danh sách)")
                          .setStyle(discord_js_1.TextInputStyle.Paragraph)
                          .setRequired(false)
                          .setMaxLength(4000)
                          .setValue(currentDesc.trim()),
                      ),
                      new discord_js_1.ActionRowBuilder().addComponents(
                        new discord_js_1.TextInputBuilder()
                          .setCustomId("embed-color")
                          .setLabel("🎨 Màu sắc (hex, vd: #E74C3C)")
                          .setStyle(discord_js_1.TextInputStyle.Short)
                          .setRequired(false)
                          .setMaxLength(20)
                          .setValue(currentColor),
                      ),
                      new discord_js_1.ActionRowBuilder().addComponents(
                        new discord_js_1.TextInputBuilder()
                          .setCustomId("embed-footer")
                          .setLabel("🦶 Footer (để trống = mặc định)")
                          .setStyle(discord_js_1.TextInputStyle.Short)
                          .setRequired(false)
                          .setMaxLength(2048)
                          .setValue(currentFooter),
                      ),
                    ),
                );

                try {
                  const modal = yield e.awaitModalSubmit({
                    filter: i => i.user.id === e.user.id && i.customId === `wiz3-embed-modal-${ts}`,
                    time: 300_000,
                  });
                  if (!modal) return;

                  const newTitle = modal.fields.getTextInputValue("embed-title").trim();
                  const newDesc = modal.fields.getTextInputValue("embed-description").trim();
                  const newColor = modal.fields.getTextInputValue("embed-color").trim();
                  const newFooterText = modal.fields.getTextInputValue("embed-footer").trim();

                  const customEmbed = Object.assign(
                    {},
                    t.messages.Embeds.CreateTicketEmbed,
                    {
                      title: newTitle || t.messages.Embeds.CreateTicketEmbed.title,
                      description: newDesc || t.messages.Embeds.CreateTicketEmbed.description,
                      color: newColor || t.messages.Embeds.CreateTicketEmbed.color,
                      footer: {
                        text: newFooterText || (t.messages.Embeds.CreateTicketEmbed.footer && t.messages.Embeds.CreateTicketEmbed.footer.text) || "",
                        iconURL: (t.messages.Embeds.CreateTicketEmbed.footer && t.messages.Embeds.CreateTicketEmbed.footer.iconURL) || "",
                      },
                    },
                  );

                  wizardState.ticketConfig.customEmbed = customEmbed;
                  yield saveStep1();

                  yield modal.update({
                    embeds: [buildStep3Embed(wizardState, t)],
                    components: buildStep3Buttons(wizardState),
                  });
                } catch (_) {
                  yield e.editReply({
                    embeds: [buildStep3Embed(wizardState, t)],
                    components: buildStep3Buttons(wizardState),
                  }).catch(() => {});
                }
                return;
              }
            }

            // ════════════════════════════════════════════════════════════════
            // STEP 4 handlers — Send panel
            // ════════════════════════════════════════════════════════════════
            if (wizardState.step === 4) {

              // ── Channel select ────────────────────────────────────────────
              if (id === "wiz4-channel") {
                const reply = yield btn.update({
                  embeds: [buildStep4Embed(wizardState, t).setDescription("Chọn kênh để gửi panel ticket:").setColor("Blue")],
                  components: [
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.ChannelSelectMenuBuilder()
                        .setCustomId("wiz4-ch-select")
                        .setChannelTypes(discord_js_1.ChannelType.GuildText)
                        .setMaxValues(1),
                    ),
                  ],
                  fetchReply: true,
                });
                try {
                  const sel = yield reply.awaitMessageComponent({
                    componentType: discord_js_1.ComponentType.ChannelSelect,
                    filter: i => i.user.id === e.user.id,
                    time: 60_000,
                  });
                  wizardState.targetChannel = sel.values[0];
                  yield sel.update({
                    embeds: [buildStep4Embed(wizardState, t)],
                    components: buildStep4Buttons(wizardState),
                  });
                } catch (_) {
                  yield e.editReply({
                    embeds: [buildStep4Embed(wizardState, t)],
                    components: buildStep4Buttons(wizardState),
                  });
                }
                return;
              }

              // ── Confirm send ──────────────────────────────────────────────
              if (id === "wiz4-confirm") {
                const targetCh = e.guild.channels.cache.get(wizardState.targetChannel);
                if (!targetCh) {
                  yield btn.update({
                    embeds: [buildStep4Embed(wizardState, t).setDescription("❌ Kênh không hợp lệ. Vui lòng chọn lại.").setColor("Red")],
                    components: buildStep4Buttons(wizardState),
                  });
                  return;
                }

                // Build panel message components
                const freshGuildData = yield (0, querys_1.guilds)().get(e.guildId);
                const messageType = freshGuildData.ticketConfig.messageType || wizardState.ticketConfig.messageType || "buttons";
                const panels = freshGuildData.ticketConfig.panels || [];
                const actionRows = [];

                if (messageType === "buttons") {
                  let row = new discord_js_1.ActionRowBuilder();
                  for (const panel of panels) {
                    const panelBtn = new discord_js_1.ButtonBuilder()
                      .setCustomId(`tkt-${panel.customId}`)
                      .setStyle(panel.style)
                      .setEmoji(panel.emoji);
                    if (panel.label) panelBtn.setLabel(panel.name);
                    row.addComponents(panelBtn);
                    if (row.components.length === 5) {
                      actionRows.push(row);
                      row = new discord_js_1.ActionRowBuilder();
                    }
                  }
                  if (row.components.length > 0) actionRows.push(row);
                } else {
                  actionRows.push(
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.StringSelectMenuBuilder()
                        .setCustomId("tkt-menu")
                        .setOptions(panels.map(p => ({ label: p.name, value: p.customId, emoji: p.emoji }))),
                    ),
                  );
                }

                // Build embed for panel message
                const replaceAll = require("../../helpers/replaceAll").default;
                const panelListStr = panels.map(p =>
                  replaceAll(t.messages.Embeds.CreateTicketEmbed.panelsFormat, { "{emoji}": p.emoji, "{name}": p.name })
                ).join("\n");

                let embedData;
                let content = null;
                if (freshGuildData.ticketConfig.customEmbed) {
                  const custom = freshGuildData.ticketConfig.customEmbed;
                  content = custom.content || null;
                  const raw = custom.embeds ? custom.embeds[0] : custom;
                  embedData = replaceAll(raw, { "{panels}": panelListStr });
                } else {
                  embedData = replaceAll(t.messages.Embeds.CreateTicketEmbed, { "{panels}": panelListStr });
                }

                yield targetCh.send({ content, embeds: [embedData], components: actionRows });

                // Stop collector and show completion
                collector.stop("done");
                yield btn.update({
                  embeds: [buildCompletionEmbed(wizardState)],
                  components: [
                    new discord_js_1.ActionRowBuilder().addComponents(
                      new discord_js_1.ButtonBuilder()
                        .setCustomId("tkt-dash-home")
                        .setLabel("🏠 Về Dashboard")
                        .setStyle(discord_js_1.ButtonStyle.Primary),
                    ),
                  ],
                });

                // Refresh dashboard if configured
                yield refreshDashboard();
                return;
              }
            }
          }),
        );

        // ── Collector end handler ─────────────────────────────────────────────
        collector.on("end", (_, reason) =>
          tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            if (reason === "time") {
              yield e.editReply({
                embeds: [buildTimeoutEmbed()],
                components: [],
              }).catch(() => {});
            }
            // "cancel" and "done" are handled inline above
          }),
        );

      } catch (error) {
        console.error("[ticket-setup] Error:", error);
        const errorEmbed = new discord_js_1.EmbedBuilder()
          .setTitle("❌ Đã xảy ra lỗi")
          .setDescription("Có lỗi xảy ra khi thực thi lệnh này. Vui lòng thử lại sau.")
          .setColor("Red");
        if (e.replied || e.deferred) {
          e.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        } else {
          e.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        }
      }
    }),
});
