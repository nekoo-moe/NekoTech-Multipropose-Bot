"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib");
const sqliteDb = tslib_1.__importStar(require("./sqliteDb"));

function startDatabase(e) {
  return tslib_1.__awaiter(this, void 0, void 0, function* () {
    try {
      const s = yield sqliteDb.connect();
      return (e.logger.success("Successfully database connected (SQLite via better-sqlite3)."), s);
    } catch (t) {
      e.logger.error(`Error connecting to SQLite database - ${t.message}`);
      process.exit(1);
    }
  });
}
exports.default = startDatabase;
