"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  Event_1 = require("../../structures/Event"),
  __1 = require("../.."),
  { DashboardManager } = require("../../helpers/dashboardManager");
exports.default = new Event_1.Event("ready", (e) =>
  tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const dm = new DashboardManager(__1.client);
    yield dm.init();
  }),
);
