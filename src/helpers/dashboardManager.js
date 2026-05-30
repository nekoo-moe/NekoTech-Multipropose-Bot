"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionFlagsBits,
  ComponentType,
} = require("discord.js");

const GuildModel = require("../models/GuildModel").default;
const TicketModel = require("../models/TicketModel").default;
const Logger = require("./Logger").default;

const logger = new Logger();

// Number of tickets shown per page in the view list
const TICKETS_PER_PAGE = 5;

class DashboardManager {
  constructor(client) {
    this.client = client;
  }

  // ─── Task 4.1: hasPermission ────────────────────────────────────────────────

  /**
   * Returns true if the interaction user is a BotOwner or has Administrator.
   * @param {import("discord.js").Interaction} interaction
   */
  hasPermission(interaction) {
    const ownerIds = this.client.config.OwnerIDs || [];
    if (ownerIds.includes(interaction.user.id)) return true;
    if (
      interaction.memberPermissions &&
      interaction.memberPermissions.has(PermissionFlagsBits.Administrator)
    )
      return true;
    return false;
  }

  // ─── Task 4.1: buildDashboardEmbed ─────────────────────────────────────────

  /**
   * Builds the main Dashboard_Ticket embed.
   * @param {object} guildData  - GuildModel document
   * @param {number} openCount  - number of open tickets
   * @param {number} closedCount - number of closed tickets
   */
  buildDashboardEmbed(guildData, openCount, closedCount) {
    const panels = guildData?.ticketConfig?.panels || [];
    const panelCount = panels.length;

    const panelList =
      panelCount > 0
        ? panels.map((p) => `• ${p.emoji} ${p.name}`).join("\n")
        : "Chưa có panel nào";

    const botName = this.client.user?.username || "Bot";
    const timestamp = Math.floor(Date.now() / 1000);

    return new EmbedBuilder()
      .setTitle(`🎫 Ticket Dashboard — ${botName}`)
      .setColor(this.client.config.GeneralSettings.EmbedColor)
      .setDescription(`**Panels hiện có:**\n${panelList}`)
      .addFields(
        { name: "🟢 Đang Mở", value: String(openCount), inline: true },
        { name: "🔒 Đã Đóng", value: String(closedCount), inline: true },
        { name: "📋 Panels", value: String(panelCount), inline: true },
      )
      .setFooter({ text: `Cập nhật lúc: <t:${timestamp}:F>` });
  }

  // ─── Task 4.1: buildDashboardButtons ───────────────────────────────────────

  /**
   * Builds the ActionRow with 4 dashboard action buttons.
   * @param {boolean} disabled - whether all buttons should be disabled
   */
  buildDashboardButtons(disabled = false) {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("tkt-dashboard-view")
        .setLabel("Xem Tickets")
        .setEmoji("📋")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId("tkt-dashboard-create")
        .setLabel("Tạo Panel")
        .setEmoji("➕")
        .setStyle(ButtonStyle.Success)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId("tkt-dashboard-send")
        .setLabel("Gửi Panel")
        .setEmoji("📤")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId("tkt-dashboard-delete")
        .setLabel("Xóa Panel")
        .setEmoji("🗑")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(disabled),
    );
  }

  // ─── Task 4.3: init ────────────────────────────────────────────────────────

  /**
   * Called on bot ready. Sends or edits the Dashboard_Ticket for every guild
   * that has TicketDashboard.Enabled = true in config.
   */
  async init() {
    const config = this.client.config;
    if (!config?.TicketDashboard?.Enabled) return;

    const channelId = config.TicketDashboard.ChannelId;
    if (!channelId) {
      logger.warn("[DashboardManager] TicketDashboard.ChannelId is not set.");
      return;
    }

    for (const [guildId, guild] of this.client.guilds.cache) {
      try {
        // Fetch or create the guild DB record
        let guildData = await GuildModel.findOne({ guildId });
        if (!guildData) {
          guildData = await GuildModel.create({ guildId });
        }

        // Count open / closed tickets for this guild
        const openCount = await TicketModel.countDocuments({
          guildId,
          isClosed: false,
        });
        const closedCount = await TicketModel.countDocuments({
          guildId,
          isClosed: true,
        });

        const embed = this.buildDashboardEmbed(guildData, openCount, closedCount);
        const components = [this.buildDashboardButtons()];

        // Try to find the target channel in this guild
        const channel = guild.channels.cache.get(channelId);
        if (!channel) {
          logger.warn(
            `[DashboardManager] Channel ${channelId} not found in guild ${guildId}. Skipping.`,
          );
          continue;
        }

        if (guildData.dashboardMessageId) {
          // Attempt to edit the existing message
          try {
            const message = await channel.messages.fetch(
              guildData.dashboardMessageId,
            );
            await message.edit({ embeds: [embed], components });
            logger.info(
              `[DashboardManager] Updated dashboard in guild ${guildId}.`,
            );
          } catch (fetchErr) {
            // Message was deleted — send a new one
            logger.warn(
              `[DashboardManager] Old message not found in guild ${guildId}, sending new one.`,
            );
            const sent = await channel.send({ embeds: [embed], components });
            await GuildModel.updateOne(
              { guildId },
              { dashboardMessageId: sent.id },
            );
            logger.info(
              `[DashboardManager] Sent new dashboard in guild ${guildId}, saved messageId ${sent.id}.`,
            );
          }
        } else {
          // No existing message — send a new one
          const sent = await channel.send({ embeds: [embed], components });
          await GuildModel.updateOne(
            { guildId },
            { dashboardMessageId: sent.id },
          );
          logger.info(
            `[DashboardManager] Sent dashboard in guild ${guildId}, saved messageId ${sent.id}.`,
          );
        }
      } catch (err) {
        logger.error(
          `[DashboardManager] Error initializing dashboard for guild ${guildId}: ${err}`,
        );
        // Continue to next guild — do not crash the bot
      }
    }
  }

  // ─── Internal helper: refresh the dashboard embed after an action ──────────

  /**
   * Re-fetches guild data and edits the dashboard message in place.
   * @param {string} guildId
   * @param {string} channelId
   * @param {string} messageId
   */
  async _refreshDashboard(guildId, channelId, messageId) {
    try {
      const guildData = await GuildModel.findOne({ guildId });
      if (!guildData) return;

      const openCount = await TicketModel.countDocuments({
        guildId,
        isClosed: false,
      });
      const closedCount = await TicketModel.countDocuments({
        guildId,
        isClosed: true,
      });

      const embed = this.buildDashboardEmbed(guildData, openCount, closedCount);
      const components = [this.buildDashboardButtons()];

      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) return;
      const channel = guild.channels.cache.get(channelId);
      if (!channel) return;

      const message = await channel.messages.fetch(messageId);
      await message.edit({ embeds: [embed], components });
    } catch (err) {
      logger.error(`[DashboardManager] Failed to refresh dashboard: ${err}`);
    }
  }

  // ─── Internal helper: build ticket list embed for a given page ─────────────

  /**
   * @param {Array} tickets - all open tickets for the guild
   * @param {number} page   - 1-based page number
   */
  _buildTicketListEmbed(tickets, page) {
    const totalPages = Math.max(1, Math.ceil(tickets.length / TICKETS_PER_PAGE));
    const start = (page - 1) * TICKETS_PER_PAGE;
    const slice = tickets.slice(start, start + TICKETS_PER_PAGE);

    const description =
      slice.length > 0
        ? slice
            .map((t) => {
              const ts = Math.floor(
                new Date(t.createdAt || Date.now()).getTime() / 1000,
              );
              return `• <#${t.channelId}> | <@${t.ownerId}> | ${t.panel} | <t:${ts}:R>`;
            })
            .join("\n")
        : "Không có ticket nào.";

    return new EmbedBuilder()
      .setTitle(`📋 Tickets Đang Mở (trang ${page}/${totalPages})`)
      .setColor(this.client.config.GeneralSettings.EmbedColor)
      .setDescription(description);
  }

  /**
   * Builds pagination buttons for the ticket list view.
   * @param {number} page
   * @param {number} totalPages
   */
  _buildTicketListButtons(page, totalPages) {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`tkt-dash-prev-${page}`)
        .setLabel("◀ Trước")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page <= 1),
      new ButtonBuilder()
        .setCustomId(`tkt-dash-next-${page}`)
        .setLabel("▶ Sau")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page >= totalPages),
      new ButtonBuilder()
        .setCustomId("tkt-dash-home")
        .setLabel("🏠 Dashboard")
        .setStyle(ButtonStyle.Primary),
    );
  }

  // ─── Task 4.7: handleInteraction ───────────────────────────────────────────

  /**
   * Main entry point for all dashboard button interactions.
   * @param {import("discord.js").ButtonInteraction} interaction
   */
  async handleInteraction(interaction) {
    const { customId, guildId } = interaction;

    // ── Permission check ──────────────────────────────────────────────────────
    if (!this.hasPermission(interaction)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Không có quyền")
            .setDescription("Bạn không có quyền sử dụng dashboard này.")
            .setColor("Red"),
        ],
        ephemeral: true,
      });
    }

    // ── Resolve dashboard message info for later refresh ─────────────────────
    const channelId = this.client.config?.TicketDashboard?.ChannelId;
    const guildData = await GuildModel.findOne({ guildId });
    const dashboardMessageId = guildData?.dashboardMessageId;

    // ── tkt-dashboard-view ────────────────────────────────────────────────────
    if (customId === "tkt-dashboard-view") {
      await this._handleView(interaction, guildId, 1);
      return;
    }

    // ── tkt-dash-prev-{page} ──────────────────────────────────────────────────
    if (customId.startsWith("tkt-dash-prev-")) {
      const currentPage = parseInt(customId.replace("tkt-dash-prev-", ""), 10);
      const newPage = Math.max(1, currentPage - 1);
      await this._handleView(interaction, guildId, newPage);
      return;
    }

    // ── tkt-dash-next-{page} ──────────────────────────────────────────────────
    if (customId.startsWith("tkt-dash-next-")) {
      const currentPage = parseInt(customId.replace("tkt-dash-next-", ""), 10);
      const newPage = currentPage + 1;
      await this._handleView(interaction, guildId, newPage);
      return;
    }

    // ── tkt-dash-home ─────────────────────────────────────────────────────────
    if (customId === "tkt-dash-home") {
      const openCount = await TicketModel.countDocuments({
        guildId,
        isClosed: false,
      });
      const closedCount = await TicketModel.countDocuments({
        guildId,
        isClosed: true,
      });
      const embed = this.buildDashboardEmbed(guildData, openCount, closedCount);
      await interaction.update({
        embeds: [embed],
        components: [this.buildDashboardButtons()],
      });
      return;
    }

    // ── tkt-dashboard-create ──────────────────────────────────────────────────
    if (customId === "tkt-dashboard-create") {
      await this._handleCreate(interaction, guildId, guildData, channelId, dashboardMessageId);
      return;
    }

    // ── tkt-dashboard-send ────────────────────────────────────────────────────
    if (customId === "tkt-dashboard-send") {
      await this._handleSend(interaction, guildId, guildData, channelId, dashboardMessageId);
      return;
    }

    // ── tkt-dashboard-delete ──────────────────────────────────────────────────
    if (customId === "tkt-dashboard-delete") {
      await this._handleDelete(interaction, guildId, guildData, channelId, dashboardMessageId);
      return;
    }
  }

  // ─── _handleView ─────────────────────────────────────────────────────────

  async _handleView(interaction, guildId, page) {
    const tickets = await TicketModel.find({ guildId, isClosed: false });
    const totalPages = Math.max(1, Math.ceil(tickets.length / TICKETS_PER_PAGE));
    const safePage = Math.min(Math.max(1, page), totalPages);

    const embed = this._buildTicketListEmbed(tickets, safePage);
    const buttons = this._buildTicketListButtons(safePage, totalPages);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [embed], components: [buttons] });
    } else {
      await interaction.update({ embeds: [embed], components: [buttons] });
    }
  }

  // ─── _handleCreate ───────────────────────────────────────────────────────

  async _handleCreate(interaction, guildId, guildData, channelId, dashboardMessageId) {
    // Reuse the panel creation logic from ticket-manage.js
    // We start the panel setup flow inline, then refresh the dashboard when done.
    const mongoose = require("../helpers/sqliteDb").default;
    const {
      ModalBuilder,
      TextInputBuilder,
      TextInputStyle,
    } = require("discord.js");

    const panelState = {
      customId: new mongoose.Types.ObjectId().toString(),
      name: null,
      emoji: null,
      category: null,
      roles: [],
      style: 1,
      label: true,
      questions: [],
    };

    const client = this.client;

    const buildButtons = (disabled = false) => {
      const { name, emoji, category, roles, style, label, questions } = panelState;
      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setStyle(name ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setDisabled(disabled).setCustomId("dp-name").setLabel("Tên").setEmoji("👤"),
        new ButtonBuilder()
          .setStyle(emoji ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setDisabled(disabled).setCustomId("dp-emoji").setLabel("Emoji").setEmoji("🥭"),
        new ButtonBuilder()
          .setStyle(category ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setDisabled(disabled).setCustomId("dp-category").setLabel("Danh mục").setEmoji("🎹"),
        new ButtonBuilder()
          .setStyle(style ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setDisabled(disabled).setCustomId("dp-style").setLabel("Kiểu").setEmoji("💅"),
        new ButtonBuilder()
          .setStyle(roles.length ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setDisabled(disabled).setCustomId("dp-roles").setLabel("Vai trò").setEmoji("🕵️"),
      );
      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setStyle(label !== null ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setEmoji("🪐").setCustomId("dp-label").setDisabled(disabled).setLabel("Hiển thị tên"),
        new ButtonBuilder()
          .setStyle(questions.length ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setLabel(questions.length ? `Câu hỏi (${questions.length})` : "Câu hỏi")
          .setEmoji("⁉️").setCustomId("dp-questions").setDisabled(disabled),
      );
      if (name && emoji && category && style && roles.length && label !== null) {
        row2.addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Success).setCustomId("dp-finish")
            .setDisabled(disabled).setEmoji("✔️").setLabel("Lưu Panel"),
        );
      }
      return [row1, row2];
    };

    const buildEmbed = () =>
      new EmbedBuilder()
        .setTitle("⚙️ Thiết Lập Panel Ticket")
        .setDescription("Nhấn nút tương ứng với thuộc tính bạn muốn chỉnh sửa.")
        .setColor(client.config.GeneralSettings.EmbedColor);

    await interaction.update({
      embeds: [buildEmbed()],
      components: buildButtons(),
    });

    const collector = interaction.message.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      componentType: ComponentType.Button,
      time: 300_000,
    });

    collector.on("collect", async (btn) => {
      collector.resetTimer();
      const id = btn.customId;

      if (id === "dp-finish") {
        await GuildModel.updateOne(
          { guildId },
          { $push: { "ticketConfig.panels": panelState } },
        );
        collector.stop("done");
        await btn.update({
          embeds: [
            new EmbedBuilder()
              .setTitle(`✅ Panel '${panelState.name}' đã được tạo.`)
              .setColor(client.config.GeneralSettings.EmbedColor),
          ],
          components: buildButtons(true),
        });
        if (channelId && dashboardMessageId) {
          await this._refreshDashboard(guildId, channelId, dashboardMessageId);
        }
        return;
      }

      if (id === "dp-style") {
        await btn.update({
          embeds: [buildEmbed().setTitle("⚙️ Chọn màu nút bấm")],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId("dp-s-1").setStyle(ButtonStyle.Primary).setLabel("Primary"),
              new ButtonBuilder().setCustomId("dp-s-2").setStyle(ButtonStyle.Secondary).setLabel("Secondary"),
              new ButtonBuilder().setCustomId("dp-s-3").setStyle(ButtonStyle.Success).setLabel("Success"),
              new ButtonBuilder().setCustomId("dp-s-4").setStyle(ButtonStyle.Danger).setLabel("Danger"),
            ),
          ],
        });
        return;
      }

      if (["dp-s-1", "dp-s-2", "dp-s-3", "dp-s-4"].includes(id)) {
        panelState.style = parseInt(id.replace("dp-s-", ""), 10);
        await btn.update({ embeds: [buildEmbed()], components: buildButtons() });
        return;
      }

      if (id === "dp-label") {
        await btn.update({
          embeds: [buildEmbed().setTitle("🎯 Hiển thị tên trên nút ticket")],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId("dp-l-yes").setStyle(ButtonStyle.Success).setLabel("✅ Có"),
              new ButtonBuilder().setCustomId("dp-l-no").setStyle(ButtonStyle.Danger).setLabel("❌ Không"),
            ),
          ],
        });
        return;
      }

      if (id === "dp-l-yes" || id === "dp-l-no") {
        panelState.label = id === "dp-l-yes";
        await btn.update({ embeds: [buildEmbed()], components: buildButtons() });
        return;
      }

      if (id === "dp-roles") {
        const msg = await btn.update({
          embeds: [buildEmbed().setDescription("Chọn vai trò có thể nhìn thấy ticket.").setColor("Red")],
          components: [
            new ActionRowBuilder().addComponents(
              new (require("discord.js").RoleSelectMenuBuilder)()
                .setCustomId("dp-roles-select").setMinValues(1).setMaxValues(10),
            ),
          ],
          fetchReply: true,
        });
        try {
          const sel = await msg.awaitMessageComponent({
            componentType: ComponentType.RoleSelect,
            filter: (i) => i.user.id === interaction.user.id,
            time: 60_000,
          });
          panelState.roles = sel.values;
          await sel.update({ embeds: [buildEmbed()], components: buildButtons() });
        } catch {
          await interaction.editReply({ embeds: [buildEmbed()], components: buildButtons() });
        }
        return;
      }

      if (id === "dp-category") {
        const msg = await btn.update({
          embeds: [buildEmbed().setDescription("Chọn danh mục nơi ticket sẽ được tạo.").setColor("Red")],
          components: [
            new ActionRowBuilder().addComponents(
              new ChannelSelectMenuBuilder()
                .setCustomId("dp-cat-select")
                .setChannelTypes(ChannelType.GuildCategory)
                .setMaxValues(1),
            ),
          ],
          fetchReply: true,
        });
        try {
          const sel = await msg.awaitMessageComponent({
            componentType: ComponentType.ChannelSelect,
            filter: (i) => i.user.id === interaction.user.id,
            time: 60_000,
          });
          panelState.category = sel.values[0];
          await sel.update({ embeds: [buildEmbed()], components: buildButtons() });
        } catch {
          await interaction.editReply({ embeds: [buildEmbed()], components: buildButtons() });
        }
        return;
      }

      // Text-input fields: name, emoji
      await btn.update({ embeds: [buildEmbed()], components: buildButtons(true) });
      try {
        const collected = await interaction.channel.awaitMessages({
          filter: (m) => m.author.id === interaction.user.id,
          max: 1,
          time: 60_000,
        });
        const value = collected.first()?.content;
        await collected.first()?.delete().catch(() => {});

        if (id === "dp-name") {
          panelState.name = value;
        } else if (id === "dp-emoji") {
          const emojiRegex = /<:[^:\s]+:\d+>|<a:[^:\s]+:\d+>|(©|®|[ -㌀]|[퀀-]|️)/g;
          if (emojiRegex.test(value)) {
            panelState.emoji = value;
          } else {
            await interaction.followUp({
              content: `⛔ **${value}** không phải emoji hợp lệ.`,
              ephemeral: true,
            });
          }
        }
        await interaction.editReply({ embeds: [buildEmbed()], components: buildButtons() });
      } catch {
        await interaction.editReply({ embeds: [buildEmbed()], components: buildButtons() });
      }
    });

    collector.on("end", async (_, reason) => {
      if (reason === "time") {
        await interaction.editReply({
          embeds: [
            buildEmbed()
              .setTitle("⏰ Đã hết thời gian chờ")
              .setDescription("Vui lòng thử lại.")
              .setColor("Red"),
          ],
          components: buildButtons(true),
        }).catch(() => {});
      }
    });
  }

  // ─── _handleSend ─────────────────────────────────────────────────────────

  async _handleSend(interaction, guildId, guildData, channelId, dashboardMessageId) {
    const panels = guildData?.ticketConfig?.panels || [];

    if (!panels.length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Server chưa có panel ticket nào.")
            .setColor("Red"),
        ],
        ephemeral: true,
      });
    }

    // Show a ChannelSelectMenu to pick the target channel
    const msg = await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setTitle("📤 Gửi Panel Ticket")
          .setDescription("Chọn kênh để gửi panel ticket vào.")
          .setColor(this.client.config.GeneralSettings.EmbedColor),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ChannelSelectMenuBuilder()
            .setCustomId("tkt-dash-send-channel")
            .setChannelTypes(ChannelType.GuildText)
            .setMaxValues(1),
        ),
      ],
      fetchReply: true,
    });

    try {
      const sel = await msg.awaitMessageComponent({
        componentType: ComponentType.ChannelSelect,
        filter: (i) => i.user.id === interaction.user.id,
        time: 60_000,
      });

      const targetChannelId = sel.values[0];
      const targetChannel = interaction.guild.channels.cache.get(targetChannelId);

      if (!targetChannel) {
        await sel.update({
          embeds: [
            new EmbedBuilder().setTitle("❌ Kênh không hợp lệ.").setColor("Red"),
          ],
          components: [],
        });
        return;
      }

      // Build panel components (buttons or select menu)
      const messageType = guildData?.ticketConfig?.messageType || "buttons";
      const actionRows = [];

      if (messageType === "buttons") {
        let row = new ActionRowBuilder();
        for (const panel of panels) {
          const btn = new ButtonBuilder()
            .setCustomId(`tkt-${panel.customId}`)
            .setStyle(panel.style)
            .setEmoji(panel.emoji);
          if (panel.label) btn.setLabel(panel.name);
          row.addComponents(btn);
          if (row.components.length === 5) {
            actionRows.push(row);
            row = new ActionRowBuilder();
          }
        }
        if (row.components.length > 0) actionRows.push(row);
      } else {
        actionRows.push(
          new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("tkt-menu")
              .setOptions(
                panels.map((p) => ({ label: p.name, value: p.customId, emoji: p.emoji })),
              ),
          ),
        );
      }

      const replaceAll = require("./replaceAll").default;
      const panelListStr = panels
        .map((p) =>
          replaceAll(this.client.messages.Embeds.CreateTicketEmbed.panelsFormat, {
            "{emoji}": p.emoji,
            "{name}": p.name,
          }),
        )
        .join("\n");

      let embedData;
      let content = null;
      if (guildData?.ticketConfig?.customEmbed) {
        const custom = guildData.ticketConfig.customEmbed;
        content = custom.content || null;
        const raw = custom.embeds ? custom.embeds[0] : custom;
        embedData = replaceAll(raw, { "{panels}": panelListStr });
      } else {
        embedData = replaceAll(this.client.messages.Embeds.CreateTicketEmbed, {
          "{panels}": panelListStr,
        });
      }

      await targetChannel.send({ content, embeds: [embedData], components: actionRows });

      await sel.update({
        embeds: [
          new EmbedBuilder()
            .setTitle("✅ Panel ticket đã được gửi tới kênh")
            .setColor(this.client.config.GeneralSettings.EmbedColor),
        ],
        components: [],
      });

      // Refresh dashboard
      if (channelId && dashboardMessageId) {
        await this._refreshDashboard(guildId, channelId, dashboardMessageId);
      }
    } catch (err) {
      logger.error(`[DashboardManager] _handleSend error: ${err}`);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder().setTitle("❌ Đã xảy ra lỗi.").setColor("Red"),
        ],
        components: [],
      }).catch(() => {});
    }
  }

  // ─── _handleDelete ───────────────────────────────────────────────────────

  async _handleDelete(interaction, guildId, guildData, channelId, dashboardMessageId) {
    const panels = guildData?.ticketConfig?.panels || [];

    if (!panels.length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Server chưa có panel ticket nào.")
            .setColor("Red"),
        ],
        ephemeral: true,
      });
    }

    const msg = await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setTitle("🗑 Xóa Panel Ticket")
          .setDescription("Chọn panel muốn xóa.")
          .setColor(this.client.config.GeneralSettings.EmbedColor),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("tkt-dash-delete-select")
            .addOptions(
              panels.map((p) => ({ label: p.name, emoji: p.emoji, value: p.customId })),
            ),
        ),
      ],
      fetchReply: true,
    });

    try {
      const sel = await msg.awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id,
        time: 60_000,
      });

      const targetCustomId = sel.values[0];
      const panel = panels.find((p) => p.customId === targetCustomId);

      await GuildModel.updateOne(
        { guildId },
        { $pull: { "ticketConfig.panels": { customId: targetCustomId } } },
      );

      await sel.update({
        embeds: [
          new EmbedBuilder()
            .setTitle(`✅ Đã xóa panel '${panel?.name || targetCustomId}' thành công`)
            .setColor(this.client.config.GeneralSettings.EmbedColor),
        ],
        components: [],
      });

      // Refresh dashboard
      if (channelId && dashboardMessageId) {
        await this._refreshDashboard(guildId, channelId, dashboardMessageId);
      }
    } catch (err) {
      logger.error(`[DashboardManager] _handleDelete error: ${err}`);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder().setTitle("❌ Đã xảy ra lỗi.").setColor("Red"),
        ],
        components: [],
      }).catch(() => {});
    }
  }
}

module.exports = { DashboardManager };
