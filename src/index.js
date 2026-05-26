"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
exports.client = void 0;

const discord_js_1 = require("discord.js");

// Fix for broken webp image avatars and guild icons in Discord embeds
// Force png extension for static assets and gif for animated ones
const originalUserDisplayAvatarURL = discord_js_1.User.prototype.displayAvatarURL;
discord_js_1.User.prototype.displayAvatarURL = function (options = {}) {
  if (!options.extension) {
    if (this.avatar && this.avatar.startsWith("a_")) {
      options.extension = "gif";
    } else {
      options.extension = "png";
    }
  }
  return originalUserDisplayAvatarURL.call(this, options);
};

const originalMemberDisplayAvatarURL = discord_js_1.GuildMember.prototype.displayAvatarURL;
discord_js_1.GuildMember.prototype.displayAvatarURL = function (options = {}) {
  if (!options.extension) {
    if (this.avatar && this.avatar.startsWith("a_")) {
      options.extension = "gif";
    } else {
      options.extension = "png";
    }
  }
  return originalMemberDisplayAvatarURL.call(this, options);
};

const originalGuildIconURL = discord_js_1.Guild.prototype.iconURL;
discord_js_1.Guild.prototype.iconURL = function (options = {}) {
  if (!options.extension) {
    if (this.icon && this.icon.startsWith("a_")) {
      options.extension = "gif";
    } else {
      options.extension = "png";
    }
  }
  return originalGuildIconURL.call(this, options);
};

const Client_1 = require("./structures/Client"),
  canvas_1 = require("@napi-rs/canvas"),
  path_1 = require("path");

exports.client = new Client_1.ExtendedClient();

canvas_1.GlobalFonts.registerFromPath(
  path_1.join(__dirname, "helpers", "assets", "fonts", "Concert.ttf"),
  "CustomFont"
);
canvas_1.GlobalFonts.registerFromPath(
  path_1.join(__dirname, "helpers", "assets", "fonts", "deToks.otf"),
  "deToks"
);
canvas_1.GlobalFonts.registerFromPath(
  path_1.join(__dirname, "helpers", "assets", "fonts", "Poppins.ttf"),
  "Poppins"
);

exports.client.start();

