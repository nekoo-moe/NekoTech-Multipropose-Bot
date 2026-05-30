/**
 * Bug Condition Exploration Tests
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.6, 1.7
 *
 * CRITICAL: These tests are EXPECTED TO FAIL on the original (unfixed) code.
 * Failure confirms the bugs exist. DO NOT fix the code or tests when they fail.
 *
 * Test cases:
 * 1. DB Error Test     — balance.js has no try/catch → interaction.reply NOT called on DB error
 * 2. Rob Anti-pattern  — rob.js uses throw instead of return → unhandled rejection
 * 3. Null Member Test  — warn.js accesses d.id on null → crash
 * 4. Localization Test — messages.yml contains 30+ English strings in Logs/Strings sections
 */

"use strict";

const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Build a minimal mock interaction object.
 * @param {object} overrides
 */
function makeMockInteraction(overrides = {}) {
  const interaction = {
    guildId: "guild-123",
    replied: false,
    deferred: false,
    reply: jest.fn().mockResolvedValue(undefined),
    followUp: jest.fn().mockResolvedValue(undefined),
    user: {
      id: "user-111",
      tag: "TestUser#0001",
      displayAvatarURL: () => "https://example.com/avatar.png",
    },
    member: {
      id: "user-111",
      roles: {
        highest: { position: 5 },
      },
    },
    guild: {
      id: "guild-123",
      name: "Test Guild",
      members: {
        cache: new Map(),
        fetch: jest.fn(),
      },
    },
    options: {
      getUser: jest.fn(),
      getMember: jest.fn(),
      getString: jest.fn(),
      getInteger: jest.fn(),
      getSubcommand: jest.fn(),
    },
    ...overrides,
  };
  return interaction;
}

/**
 * Build a minimal mock client with messages loaded from messages.yml.
 */
function makeMockClient() {
  const messagesPath = path.join(__dirname, "../config/messages.yml");
  const messages = yaml.load(fs.readFileSync(messagesPath, "utf8"));
  return {
    user: { id: "bot-999", tag: "Bot#0000" },
    messages,
  };
}

// ─── Test 1: DB Error Test ───────────────────────────────────────────────────

describe("DB Error Test — balance.js without try/catch", () => {
  /**
   * Property 1: Bug Condition
   * Validates: Requirements 1.1, 1.3
   *
   * On the original code, balance.js has NO try/catch around the async DB call.
   * When querys.users().economy().get() throws, the exception propagates unhandled
   * and interaction.reply is NEVER called.
   *
   * Expected on unfixed code: interaction.reply is NOT called → test FAILS
   * Expected after fix: interaction.reply IS called with error embed → test PASSES
   */
  test("interaction.reply should be called even when DB throws an error", async () => {
    // Arrange: mock the querys module so that economy().get() throws
    jest.resetModules();

    // We need to mock the querys module before requiring balance.js
    jest.mock(
      path.join(__dirname, "../src/helpers/querys"),
      () => ({
        guilds: () => ({
          get: jest.fn().mockRejectedValue(new Error("DB connection failed")),
        }),
        users: () => ({
          economy: () => ({
            get: jest.fn().mockRejectedValue(new Error("DB connection failed")),
          }),
        }),
      }),
      { virtual: false }
    );

    const balanceModule = require(path.join(
      __dirname,
      "../src/commands/economy/balance"
    ));
    const balanceCommand = balanceModule.default;

    const interaction = makeMockInteraction();
    interaction.options.getUser.mockReturnValue(null); // will fall back to interaction.user

    const client = makeMockClient();

    // Act: run the command — on unfixed code this will throw unhandled
    try {
      await balanceCommand.run({ interaction, client });
    } catch (e) {
      // Swallow — we only care whether reply was called
    }

    // Assert: interaction.reply MUST have been called (error handling)
    // On unfixed code: reply is NOT called → this assertion FAILS (confirming bug)
    expect(interaction.reply).toHaveBeenCalled();
  });
});

// ─── Test 2: Rob Anti-pattern Test ──────────────────────────────────────────

describe("Rob Anti-pattern Test — rob.js throws instead of returning", () => {
  /**
   * Property 1: Bug Condition
   * Validates: Requirements 1.1, 1.2
   *
   * On the original code, rob.js does:
   *   throw (e.reply({...}), new Error("exclude"))
   * when user tries to rob themselves. This is an anti-pattern — it throws
   * AFTER calling reply, causing an unhandled rejection to propagate.
   *
   * Expected on unfixed code: the run() promise rejects → test FAILS
   * Expected after fix: run() resolves normally (return instead of throw) → test PASSES
   */
  test("rob.js run() should not throw/reject when user tries to rob themselves", async () => {
    jest.resetModules();

    // Mock querys — the self-rob check happens before any DB call, but we mock anyway
    jest.mock(
      path.join(__dirname, "../src/helpers/querys"),
      () => ({
        guilds: () => ({
          get: jest.fn().mockResolvedValue({ economyConfig: { coin: "🪙" } }),
        }),
        users: () => ({
          economy: () => ({
            get: jest.fn().mockResolvedValue({
              balance: { money: 1000, bank: 500 },
              save: jest.fn().mockResolvedValue(undefined),
            }),
          }),
        }),
      }),
      { virtual: false }
    );

    const robModule = require(path.join(
      __dirname,
      "../src/commands/economy/rob"
    ));
    const robCommand = robModule.default;

    const SAME_USER_ID = "user-self-111";

    const interaction = makeMockInteraction({
      user: {
        id: SAME_USER_ID,
        tag: "SelfRobber#0001",
        displayAvatarURL: () => "https://example.com/avatar.png",
      },
    });

    // options.getUser('user') returns the SAME user → triggers self-rob path
    interaction.options.getUser.mockReturnValue({
      id: SAME_USER_ID,
      tag: "SelfRobber#0001",
      bot: false,
    });

    const client = makeMockClient();

    // Act & Assert: run() should resolve (not reject)
    // On unfixed code: run() throws new Error("exclude") → promise rejects → test FAILS
    await expect(
      robCommand.run({ interaction, client })
    ).resolves.not.toThrow();
  });
});

// ─── Test 3: Null Member Test ────────────────────────────────────────────────

describe("Null Member Test — warn.js crashes on null member", () => {
  /**
   * Property 1: Bug Condition
   * Validates: Requirements 1.2, 1.3
   *
   * On the original code, warn.js calls:
   *   const d = r.options.getMember("member")
   * and then accesses d.id and d.roles.highest.position WITHOUT checking if d is null.
   * If the member has left the server, getMember returns null → TypeError crash.
   *
   * Expected on unfixed code: TypeError: Cannot read properties of null → test FAILS
   * Expected after fix: null-check handles gracefully → test PASSES
   */
  test("warn.js run() should not crash when getMember returns null", async () => {
    jest.resetModules();

    // Mock PunishModel
    jest.mock(
      path.join(__dirname, "../src/models/PunishModel"),
      () => ({
        default: {
          findOne: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ warns: [], cases: 0 }),
          updateOne: jest.fn().mockResolvedValue(undefined),
        },
      }),
      { virtual: false }
    );

    const warnModule = require(path.join(
      __dirname,
      "../src/commands/moderation/warn"
    ));
    const warnCommand = warnModule.default;

    const interaction = makeMockInteraction();
    // getMember returns null — member has left the server
    interaction.options.getMember.mockReturnValue(null);
    interaction.options.getString.mockReturnValue("Test reason");
    interaction.options.getSubcommand.mockReturnValue("add");

    const client = makeMockClient();

    // Act & Assert: run() should not throw a TypeError
    // On unfixed code: d.id on null → TypeError → test FAILS
    let thrownError = null;
    try {
      await warnCommand.run({ interaction, client });
    } catch (e) {
      thrownError = e;
    }

    // The command should either resolve or reply with an error — NOT throw TypeError
    expect(thrownError).toBeNull();
  });
});

// ─── Test 4: Localization Test ───────────────────────────────────────────────

describe("Localization Test — messages.yml contains English strings", () => {
  /**
   * Property 1: Bug Condition
   * Validates: Requirements 1.6, 1.7
   *
   * On the original code, messages.yml contains 30+ English strings in the
   * Logs and Strings sections. This test asserts that NO English words appear
   * in those sections.
   *
   * Expected on unfixed code: English strings found → test FAILS (confirming bug)
   * Expected after fix: all strings translated to Vietnamese → test PASSES
   */

  let messages;

  beforeAll(() => {
    const messagesPath = path.join(__dirname, "../config/messages.yml");
    messages = yaml.load(fs.readFileSync(messagesPath, "utf8"));
  });

  /**
   * Detect if a string contains English words.
   * We look for sequences of ASCII letters that form common English words.
   * Placeholders like {user-tag}, URLs, Discord format codes are excluded.
   *
   * Strategy: A string is considered "English" only if it contains NO Vietnamese
   * characters AND contains English words. Strings with Vietnamese characters
   * are considered translated (even if they contain loanwords like "Role", "ticket").
   *
   * This prevents false positives where Vietnamese words like "thể" → "the" or
   * "thêm" → "them" match English patterns after diacritic normalization.
   */
  function containsEnglishWords(str) {
    if (typeof str !== "string") return false;

    // Remove placeholders like {user-tag}, {channel}, etc.
    let cleaned = str.replace(/\{[^}]+\}/g, "");
    // Remove URLs
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, "");
    // Remove Discord timestamp formats like <t:123:R>
    cleaned = cleaned.replace(/<[^>]+>/g, "");
    // Remove Discord emoji formats like <:name:id>
    cleaned = cleaned.replace(/<:[^>]+>/g, "");
    // Remove markdown formatting characters
    cleaned = cleaned.replace(/[*_`~|]/g, "");
    // Remove numbers and punctuation
    cleaned = cleaned.replace(/[\d.,!?:;'"()\[\]{}\-\/\\@#$%^&+=]/g, " ");
    // Remove emoji characters (Unicode emoji ranges)
    cleaned = cleaned.replace(/[\u{1F000}-\u{1FFFF}]/gu, " ");
    cleaned = cleaned.replace(/[\u2600-\u27FF]/g, " ");

    // KEY INSIGHT: If the string contains Vietnamese characters (diacritics or
    // special Vietnamese letters like Đ/đ), it has been translated to Vietnamese.
    // We only flag strings that are PURELY ASCII (no Vietnamese characters at all).
    const hasVietnameseChars = /[àáâãèéêìíòóôõùúýăđơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĂĐƠƯẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼẾỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴỶỸ]/i.test(cleaned);

    // If the string has Vietnamese characters, it's been translated — not an English string
    if (hasVietnameseChars) return false;

    // Known loanwords/technical terms intentionally kept in English in Vietnamese
    // Discord context. These are NOT translation bugs.
    const acceptableLoanwords = new Set([
      "role", "roles", "ticket", "tickets", "backup", "backups",
      "giveaway", "giveaways", "id", "bot", "bots", "server",
      "click", "here", "page", "level", "levelup", "rank",
      "online", "offline", "status", "ping", "dm", "vc",
      "emoji", "emojis", "boost", "boosters", "tier",
      "staff", "mod", "admin", "ban", "kick", "mute",
      "hit", "stand", "bust", "blackjack",
      "wordle", "connect", "rps", "ship",
      "afk", "snipe", "nuke", "poll",
      "jump", "message", "messages",
      "none", "counter", "name",
    ]);

    // Common English words that should NOT appear in a fully-translated Vietnamese bot
    // (excluding loanwords handled above)
    const englishWordPattern =
      /\b(the|a|an|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|shall|can|need|dare|ought|used|to|of|in|on|at|by|for|with|about|against|between|into|through|during|before|after|above|below|from|up|down|out|off|over|under|again|further|then|once|here|there|when|where|why|how|all|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|just|but|and|or|if|as|it|its|this|that|these|those|i|me|my|myself|we|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|they|them|their|theirs|themselves|what|which|who|whom|whose|edited|deleted|created|updated|logged|author|type|color|animated|old|new|content|attachments|welcome|win|lose|dealer|wins|tie|values|correctly|written|please|check|waiting|answer|added|removed|account|leveled|interact|component|ended|reason|since|preview|another|robots|rating|channels|correct|number|tries|remaining|unable|complete|game|within|seconds|therefore|was|our|waiting|answer|staff|members|boosters|member|user|users|channel|guild|server)\b/i;

    const words = cleaned.split(/\s+/).filter((w) => w.length > 1);
    return words.some((word) => {
      // Skip acceptable loanwords
      if (acceptableLoanwords.has(word.toLowerCase())) return false;
      return englishWordPattern.test(word);
    });
  }

  /**
   * Recursively collect all string values from an object with their key paths.
   */
  function collectStrings(obj, prefix = "") {
    const results = [];
    if (typeof obj === "string") {
      results.push({ path: prefix, value: obj });
    } else if (Array.isArray(obj)) {
      obj.forEach((item, i) => {
        results.push(...collectStrings(item, `${prefix}[${i}]`));
      });
    } else if (obj && typeof obj === "object") {
      for (const [key, val] of Object.entries(obj)) {
        results.push(...collectStrings(val, prefix ? `${prefix}.${key}` : key));
      }
    }
    return results;
  }

  test("Logs section should contain NO English strings (all should be Vietnamese)", () => {
    expect(messages.Logs).toBeDefined();

    const allStrings = collectStrings(messages.Logs, "Logs");
    const englishStrings = allStrings.filter(({ value }) =>
      containsEnglishWords(value)
    );

    if (englishStrings.length > 0) {
      console.log(
        `\n[COUNTEREXAMPLE] Found ${englishStrings.length} English string(s) in Logs section:`
      );
      englishStrings.forEach(({ path: p, value }) => {
        console.log(`  - ${p}: "${value}"`);
      });
    }

    // On unfixed code: englishStrings.length > 0 → this FAILS (confirming bug)
    expect(englishStrings).toHaveLength(0);
  });

  test("Strings section should contain NO English strings (all should be Vietnamese)", () => {
    expect(messages.Strings).toBeDefined();

    const allStrings = collectStrings(messages.Strings, "Strings");
    const englishStrings = allStrings.filter(({ value }) =>
      containsEnglishWords(value)
    );

    if (englishStrings.length > 0) {
      console.log(
        `\n[COUNTEREXAMPLE] Found ${englishStrings.length} English string(s) in Strings section:`
      );
      englishStrings.forEach(({ path: p, value }) => {
        console.log(`  - ${p}: "${value}"`);
      });
    }

    // On unfixed code: englishStrings.length > 0 → this FAILS (confirming bug)
    expect(englishStrings).toHaveLength(0);
  });

  test("Embeds section should contain NO English strings in known problematic keys", () => {
    expect(messages.Embeds).toBeDefined();

    // Specific embed keys known to contain English strings (from design.md analysis)
    const problematicEmbedPaths = [
      ["LevelUpEmbed", "description"],
      ["StarboardEmbed", "description"],
      ["CantInteractEmbed", "title"],
      ["GuessTheNumberWrongSelect", "description"],
      ["GuessTheNumberOutTime", "description"],
      ["TicketAlertUserEmbed", "description"],
      ["ReactionRoleAddedEmbed", "description"],
      ["ReactionRoleRemovedEmbed", "description"],
      ["TemporalRankAddEmbed", "description"],
      ["TemporalRankRemoveEmbed", "description"],
      ["GiveawayEndEmbed", "title"],
    ];

    const englishFound = [];

    for (const [embedKey, field] of problematicEmbedPaths) {
      const embed = messages.Embeds[embedKey];
      if (!embed) continue;
      const value = embed[field];
      if (typeof value === "string" && containsEnglishWords(value)) {
        englishFound.push({ path: `Embeds.${embedKey}.${field}`, value });
      }
    }

    // Also check field names in WarnListEmbed, BannListEmbed, BackupListEmbed, ServerInfoEmbed
    const embedsWithEnglishFieldNames = [
      "WarnListEmbed",
      "BannListEmbed",
      "BackupListEmbed",
      "AfkListEmbed",
      "SnipeListEmbed",
    ];

    for (const embedKey of embedsWithEnglishFieldNames) {
      const embed = messages.Embeds[embedKey];
      if (!embed || !embed.fields) continue;
      embed.fields.forEach((field, i) => {
        if (typeof field.name === "string" && containsEnglishWords(field.name)) {
          englishFound.push({
            path: `Embeds.${embedKey}.fields[${i}].name`,
            value: field.name,
          });
        }
      });
    }

    // Check SuggestPendingEmbed/AcceptedEmbed/DeclinedEmbed field names
    const suggestEmbeds = [
      "SuggestPendingEmbed",
      "SuggestAcceptedEmbed",
      "SuggestDeclinedEmbed",
    ];
    for (const embedKey of suggestEmbeds) {
      const embed = messages.Embeds[embedKey];
      if (!embed || !embed.fields) continue;
      embed.fields.forEach((field, i) => {
        if (typeof field.name === "string" && containsEnglishWords(field.name)) {
          englishFound.push({
            path: `Embeds.${embedKey}.fields[${i}].name`,
            value: field.name,
          });
        }
      });
    }

    if (englishFound.length > 0) {
      console.log(
        `\n[COUNTEREXAMPLE] Found ${englishFound.length} English string(s) in Embeds section:`
      );
      englishFound.forEach(({ path: p, value }) => {
        console.log(`  - ${p}: "${value}"`);
      });
    }

    // On unfixed code: englishFound.length > 0 → this FAILS (confirming bug)
    expect(englishFound).toHaveLength(0);
  });
});
