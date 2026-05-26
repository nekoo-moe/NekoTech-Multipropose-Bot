"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  Command_1 = require("../../structures/Command"),
  discord_js_1 = require("discord.js"),
  fs_1 = require("fs"),
  js_yaml_1 = require("js-yaml");
exports.default = new Command_1.Command({
  name: "reload",
  description: "Reload the bot configuration files and commands",
  run: ({ client: e, interaction: s }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      yield s.deferReply();
      try {
        const o = (0, js_yaml_1.load)(
            (0, fs_1.readFileSync)("config/commands.yml", "utf-8"),
          ),
          i = (0, js_yaml_1.load)(
            (0, fs_1.readFileSync)("config/messages.yml", "utf-8"),
          );
        e.commandsConfig = o;
        e.messages = i;

        // Clear require cache for commands so they can be re-imported
        for (const key in require.cache) {
          if (key.includes("/commands/") || key.includes("\\commands\\")) {
            delete require.cache[key];
          }
        }

        // Clear memory cache of commands
        e.commands.clear();

        // Reload commands from disk and sync with Discord API
        yield e.loadCommands();
        yield e.registerCommands();

        yield s.editReply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle("👋 Bot đã được tải lại")
              .setDescription("✅ Cấu hình và lệnh đã được nạp lại thành công và đã đồng bộ với Discord!")
              .setColor(e.config.GeneralSettings.EmbedColor),
          ],
        });
      } catch (error) {
        console.error(error);
        yield s.editReply({
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle("❌ Lỗi khi tải lại bot")
              .setDescription(`Đã xảy ra lỗi: \`\`\`${error.message}\`\`\``)
              .setColor("Red"),
          ],
        });
      }
    }),
});
