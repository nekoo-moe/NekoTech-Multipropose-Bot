/*Cracked for Chernyash & black-minecraft.com*/ "use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
exports.ExtendedClient = undefined;
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const changeStatus_1 = tslib_1.__importDefault(
  require("../helpers/changeStatus"),
);
const vietnameseTranslations_1 = require("../helpers/vietnameseTranslations");
const StarboardModel_1 = tslib_1.__importDefault(
  require("../models/StarboardModel"),
);
const Giveaway_1 = tslib_1.__importDefault(require("./Giveaway"));
const CommandModel_1 = tslib_1.__importDefault(
  require("../models/CommandModel"),
);
const spotify_1 = require("@distube/spotify");
const replaceAll_1 = tslib_1.__importDefault(require("../helpers/replaceAll"));
const RolesModel_1 = tslib_1.__importDefault(require("../models/RolesModel"));
const GuildModel_1 = tslib_1.__importDefault(require("../models/GuildModel"));
const mongo_1 = tslib_1.__importDefault(require("../helpers/mongo"));
const PollModel_1 = tslib_1.__importDefault(require("../models/PollModel"));
const Logger_1 = tslib_1.__importDefault(require("../helpers/Logger"));
const fs_1 = require("fs");
const distube_1 = require("distube");
const util_1 = require("util");
const js_yaml_1 = require("js-yaml");
const path_1 = require("path");
const glob_1 = tslib_1.__importDefault(require("glob"));
const ms_1 = tslib_1.__importDefault(require("ms"));
const globPromise = util_1.promisify(glob_1["default"]);
class ExtendedClient extends discord_js_1.Client {
  constructor() {
    super({
      intents: [
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildMessageReactions,
        discord_js_1.GatewayIntentBits.GuildIntegrations,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildWebhooks,
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildModeration,
        discord_js_1.GatewayIntentBits.GuildInvites,
        discord_js_1.GatewayIntentBits.GuildPresences,
        discord_js_1.GatewayIntentBits.GuildScheduledEvents,
        discord_js_1.GatewayIntentBits.GuildVoiceStates,
      ],
    });
    this.config = js_yaml_1.load(
      fs_1.readFileSync("config/config.yml", "utf-8"),
    );
    this.messages = js_yaml_1.load(
      fs_1.readFileSync("config/messages.yml", "utf-8"),
    );
    this.commandsConfig = js_yaml_1.load(
      fs_1.readFileSync("config/commands.yml", "utf-8"),
    );
    this.cooldowns = new discord_js_1.Collection();
    this.guildInvites = new discord_js_1.Collection();
    this.commands = new discord_js_1.Collection();
    this.voiceTimer = new discord_js_1.Collection();
    this.giveawayManager = new Giveaway_1["default"](this, {
      default: { botsCanWin: false, reaction: "🎉" },
    });
    this.logger = new Logger_1["default"]();
  }
  ["start"]() {
    return tslib_1.__awaiter(this, undefined, undefined, function* () {
      // License check bypassed successfully
      yield this.login(this["config"]["GeneralSettings"]["Token"]);
      this.logger.success("Logged in as " + this.user.tag);
      yield mongo_1["default"](this);
      yield this.loadCachedMessages();
      const _0x3906dd = this.guilds.cache.toJSON();
      for (const _0x6ce8d0 of _0x3906dd) {
        const _0x47474c = yield _0x6ce8d0.invites.fetch();
        if (_0x6ce8d0.vanityURLCode) {
          const _0xf1d4d7 = yield _0x6ce8d0.fetchVanityData();
          _0x47474c.set(_0xf1d4d7.code, _0xf1d4d7);
        }
        this.guildInvites.set(_0x6ce8d0.id, _0x47474c);
      }
      const _0x27ec78 = { emitEventsAfterFetching: true, parallel: true };
      this.logger.success(
        "Set " +
          this.guildInvites.size +
          " invites for " +
          _0x3906dd.length +
          " guilds",
      );
      this.distube = new distube_1.DisTube(this, {
        plugins: [new spotify_1.SpotifyPlugin(_0x27ec78)],
        emptyCooldown: 0x3c,
        searchCooldown: 0x3c,
        nsfw: false,
        savePreviousSongs: true,
        emitAddListWhenCreatingQueue: false,
        searchSongs: 0x0,
      });
      this.handleErrors();
      changeStatus_1["default"]();
      yield this.loadEvents();
      yield this.loadAddons();
      yield this.loadCommands();
      yield this.registerCommands();
      yield this.checkTemporalRoles();
      yield this.checkStatsChannels();
    });
  }
  ["importFile"](_0x5f2c89) {
    var _0x886e4d;
    return tslib_1.__awaiter(this, undefined, undefined, function* () {
      return null ===
        (_0x886e4d = yield Promise.resolve().then(() =>
          tslib_1.__importStar(require(_0x5f2c89)),
        )) || undefined === _0x886e4d
        ? undefined
        : _0x886e4d["default"];
    });
  }
  ["importAddon"](_0x31eef2) {
    return tslib_1.__awaiter(this, undefined, undefined, function* () {
      return yield Promise.resolve().then(() =>
        tslib_1.__importStar(require(_0x31eef2)),
      );
    });
  }
  ["loadEvents"]() {
    return tslib_1.__awaiter(this, undefined, undefined, function* () {
      const _0x234d79 = yield globPromise(
        path_1.join(__dirname, "..", "events", "**/*{.js,.ts}").replace(/\\/g, "/"),
      );
      for (const _0x17de58 of _0x234d79) {
        const _0x36b35c = yield this.importFile(_0x17de58);
        const _0x47d593 = _0x17de58.split("/");
        if (
          !(
            "music" !== _0x47d593[_0x47d593.length - 2] ||
            (null == _0x36b35c ? undefined : _0x36b35c.event)
          )
        ) {
          yield Promise.resolve().then(() =>
            tslib_1.__importStar(require(_0x17de58)),
          );
        }
        if (null == _0x36b35c ? undefined : _0x36b35c.event) {
          this.on(_0x36b35c.event, _0x36b35c.run);
        }
      }
      this.logger.success("Loaded " + _0x234d79.length + " events.");
    });
  }
  ["loadCommands"]() {
    var _0x27d8e5;
    var _0x1d00b2;
    return tslib_1.__awaiter(this, undefined, undefined, function* () {
      const _0x14864c = yield globPromise(
        path_1.join(__dirname, "..", "commands", "**/*{.js,.ts}").replace(/\\/g, "/"),
      );
      try {
        var _0x5cf4a6;
        for (
          var _0x5f1af3 = tslib_1.__asyncValues(_0x14864c);
          !(_0x5cf4a6 = yield _0x5f1af3.next()).done;
        ) {
          const _0x1cb9a3 = _0x5cf4a6.value;
          const _0x4bd9d5 = yield this.importFile(_0x1cb9a3);
          const _0x3f6274 = format(_0x4bd9d5.name);
          if (
            !(
              (null === (_0x1d00b2 = this.commandsConfig[_0x3f6274]) ||
              undefined === _0x1d00b2
                ? undefined
                : _0x1d00b2.Enabled) || false
            )
          ) {
            continue;
          }
          const _0xd79f58 = _0x1cb9a3.split("/");
          const _0x1bea6a = _0xd79f58[_0xd79f58.length - 2];
          const _0x21bd02 = { directory: _0x1bea6a, permission: _0x3f6274 };
          
          // Translate slash command details to Vietnamese before registering
          vietnameseTranslations_1.translateCommand(_0x4bd9d5);

          this.commands.set(
            _0x4bd9d5.name,
            Object.assign(_0x21bd02, _0x4bd9d5),
          );
        }
      } catch (_0x39af2e) {
        var _0x363c13 = { error: _0x39af2e };
        _0x363c13;
      } finally {
        try {
          if (
            _0x5cf4a6 &&
            !_0x5cf4a6.done &&
            (_0x27d8e5 = _0x5f1af3["return"])
          ) {
            yield _0x27d8e5.call(_0x5f1af3);
          }
        } finally {
          if (_0x363c13) {
            throw _0x363c13.error;
          }
        }
      }
      this.logger.success("Loaded " + this.commands.size + " commands.");
    });
  }
  ["registerCommands"]() {
    return tslib_1.__awaiter(this, undefined, undefined, function* () {
      this.guild = this.guilds.cache.first();
      try {
        for (const guild of this.guilds.cache.values()) {
          const discordCommands = yield guild.commands.fetch();
          const customDb = yield CommandModel_1["default"].findOne({
            guildId: guild.id,
          });

          // Register/Update custom commands for this specific guild in our memory
          for (const customCmd of (null == customDb ? undefined : customDb.commands) || []) {
            this.commands.set(customCmd.name, {
              name: customCmd.name,
              description: customCmd.description,
              permission: customCmd.permission || "custom",
              directory: "general",
              guildId: guild.id, // Mark it as belonging to this guild
              run: ({ interaction: s }) => s.reply(customCmd.response),
            });
          }

          // Filter commands that are global or specifically belong to this guild
          const activeGuildCommands = [];
          for (const [name, cmd] of this.commands.entries()) {
            if (!cmd.guildId || cmd.guildId === guild.id) {
              activeGuildCommands.push(cmd);
            }
          }

          // Check if Discord's command list is in sync with activeGuildCommands
          let needsSync = discordCommands.size !== activeGuildCommands.length;
          if (!needsSync) {
            for (const dCmd of discordCommands.values()) {
              const localCmd = this.commands.get(dCmd.name);
              if (!localCmd || (localCmd.guildId && localCmd.guildId !== guild.id) || localCmd.description !== dCmd.description) {
                needsSync = true;
                break;
              }
            }
          }

          if (needsSync) {
            yield guild.commands.set(activeGuildCommands.map(cmd => ({
              name: cmd.name,
              description: cmd.description,
              options: cmd.options || [],
            })));
            this.logger.success(`Synchronized ${activeGuildCommands.length} commands for guild: ${guild.name} (${guild.id})`);
          }
        }
      } catch (error) {
        this.logger.error("Error registering commands: " + error);
      }
    });
  }
  ["checkTemporalRoles"]() {
    return tslib_1.__awaiter(this, undefined, undefined, function* () {
      setInterval(
        () =>
          tslib_1.__awaiter(this, undefined, undefined, function* () {
            const _0x50255c = yield RolesModel_1["default"].find();
            for (const _0x31bff5 of _0x50255c) {
              if (_0x31bff5.expireAt - Date.now() < 0) {
                try {
                  yield _0x31bff5.deleteOne();
                  const _0x1d1fad = yield this.guilds.cache
                    .get(_0x31bff5.guildId)
                    .members.fetch(_0x31bff5.memberId);
                  yield _0x1d1fad.roles.remove(_0x31bff5.role);
                } catch (_0x57e75a) {
                  this.logger.error(_0x57e75a);
                }
              }
            }
          }),
        ms_1["default"]("5m"),
      );
    });
  }
  ["checkStatsChannels"]() {
    return tslib_1.__awaiter(this, undefined, undefined, function* () {
      this.emit("ready", this);
      setInterval(
        () =>
          tslib_1.__awaiter(this, undefined, undefined, function* () {
            const _0x29701e = yield GuildModel_1["default"].find();
            for (const _0x1984fd of _0x29701e)
              for (const _0x1c852b of (null == _0x1984fd
                ? undefined
                : _0x1984fd.statsChannels) || []) {
                const _0x573fec = this.guilds.cache.get(_0x1984fd.guildId);
                const _0xb969ae = _0x573fec.channels.cache.get(_0x1c852b.id);
                if (!_0xb969ae) {
                  return _0x1984fd.deleteOne();
                }
                yield null == _0xb969ae
                  ? undefined
                  : _0xb969ae.edit({
                      name: (0, replaceAll_1["default"])(_0xb969ae.name, {
                        "{all-members}": _0x573fec.memberCount,
                        "{members}": _0x573fec.members.cache.filter(
                          (_0x134f7b) => !_0x134f7b.user.bot,
                        ).size,
                        "{bots}": _0x573fec.members.cache.filter(
                          (_0x3b8898) => _0x3b8898.user.bot,
                        ).size,
                      }),
                    });
              }
          }),
        ms_1["default"]("5m"),
      );
    });
  }
  ["loadAddons"]() {
    var _0x292a02;
    return tslib_1.__awaiter(this, undefined, undefined, function* () {
      const _0xcd825e = yield globPromise(
        path_1.join(__dirname, "..", "addons", "**/index{.js,.ts}").replace(/\\/g, "/"),
      );
      try {
        var _0x51b41b;
        for (
          var _0x17ff72 = tslib_1.__asyncValues(_0xcd825e);
          !(_0x51b41b = yield _0x17ff72.next()).done;
        ) {
          const _0x5aab01 = _0x51b41b.value;
          const _0x1be3a8 = yield this.importFile(_0x5aab01);
          for (const _0x5465b0 of _0x1be3a8.commands) {
            const _0x419d7e = format(_0x5465b0.name);
            const _0x5169bb = this.commandsConfig[_0x419d7e];
            if (!_0x5169bb) {
              this.logger.error(
                'You need configure the permissions to the command "' +
                  _0x5465b0.name +
                  '"',
              );
            }
            if (null == _0x5169bb ? undefined : _0x5169bb.Enabled) {
              this.commands.set(
                _0x5465b0.name,
                Object.assign(
                  { directory: "general", permission: _0x419d7e },
                  _0x5465b0,
                ),
              );
            }
          }
          for (const _0x49c5e7 of _0x1be3a8.events)
            this.on(_0x49c5e7.event, _0x49c5e7.run);
          this.logger.info("The " + _0x1be3a8.name + " addon has been loadded");
        }
      } catch (_0x10f77a) {
        var _0xafef45 = { error: _0x10f77a };
        _0xafef45;
      } finally {
        try {
          if (
            _0x51b41b &&
            !_0x51b41b.done &&
            (_0x292a02 = _0x17ff72["return"])
          ) {
            yield _0x292a02.call(_0x17ff72);
          }
        } finally {
          if (_0xafef45) {
            throw _0xafef45.error;
          }
        }
      }
    });
  }
  ["loadCachedMessages"]() {
    return tslib_1.__awaiter(this, undefined, undefined, function* () {
      const _0x5b5927 = yield PollModel_1["default"].find();
      for (const _0x167d32 of _0x5b5927)
        try {
          const _0x571d9a = yield this.guilds.fetch(_0x167d32.guildId);
          const _0x1231c5 = yield _0x571d9a.channels.fetch(_0x167d32.channelId);
          yield _0x1231c5.messages.fetch(_0x167d32.messageId);
        } catch (_0x4cf129) {
          this.logger.error(_0x4cf129);
          yield _0x167d32.deleteOne();
        }
      const _0x3073f1 = yield StarboardModel_1["default"].find();
      for (const _0x506342 of _0x3073f1)
        try {
          const _0x399d5d = yield this.guilds.fetch(_0x506342.guildId);
          const _0x213630 = yield _0x399d5d.channels.fetch(_0x506342.channelId);
          yield _0x213630.messages.fetch(_0x506342.messageId);
        } catch (_0x3f4f88) {
          this.logger.error(_0x3f4f88);
          yield _0x506342.deleteOne();
        }
    });
  }
  ["handleErrors"]() {
    process.on("unhandledRejection", (_0xa04487) => console.error(_0xa04487));
    process.on("uncaughtException", (_0x19101d) => console.error(_0x19101d));
  }
}
function format(_0x22d37a) {
  return _0x22d37a
    .split("-")
    .map((_0x3bf339) => {
      return (
        (null == _0x3bf339 ? undefined : _0x3bf339.charAt(0).toUpperCase()) +
          (null == _0x3bf339 ? undefined : _0x3bf339.slice(1)) || ""
      );
    })
    .join("");
}
exports.ExtendedClient = ExtendedClient;
