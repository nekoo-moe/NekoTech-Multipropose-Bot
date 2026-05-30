"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  Command_1 = require("../../structures/Command"),
  replaceAll_1 = tslib_1.__importDefault(require("../../helpers/replaceAll")),
  WEATHER_API_KEY = "1f1da4333e824130aa2175640232107";
exports.default = new Command_1.Command({
  name: "weather",
  description: "Kiểm tra thời tiết của một thành phố",
  options: [
    {
      name: "city",
      description: "Thành phố cần kiểm tra thời tiết",
      type: discord_js_1.ApplicationCommandOptionType.String,
      required: !0,
    },
  ],
  run: ({ client: e, interaction: t }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      try {
      yield t.deferReply();
      const i = t.options.getString("city"),
        r = yield fetch(
          `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${i}&aqi=no`,
        ),
        n = yield r.json();
      if (n.error)
        return t.followUp({
          embeds: [
            (0, replaceAll_1.default)(e.messages.Embeds.WeatherInvalidEmbed),
          ],
        });
      t.followUp({
        embeds: [
          (0, replaceAll_1.default)(e.messages.Embeds.WeatherEmbed, {
            "{time}": n.current.is_day ? "ngày" : "đêm",
            "{description}": n.current.condition.text,
            "{country}": n.location.country,
            "{city}": n.location.name,
            "{icon}": "https:" + n.current.condition.icon,
            "{temp-c}": n.current.temp_c,
            "{temp-f}": n.current.temp_f,
            "{feels-c}": n.current.feelslike_c,
            "{feels-f}": n.current.feelslike_f,
            "{humidity}": n.current.humidity,
            "{wind-dir}": n.current.wind_dir,
            "{wind-mph}": n.current.wind_mph,
            "{wind-kph}": n.current.wind_kph,
            "{vis-km}": n.current.vis_km.toFixed(1),
            "{vis-miles}": n.current.vis_miles.toFixed(1),
            "{wind-degree}": n.current.wind_degree,
          }),
        ],
      });
      } catch (error) {
        console.error("[weather] Error:", error);
        const errorEmbed = new discord_js_1.EmbedBuilder()
          .setTitle("❌ Đã xảy ra lỗi")
          .setDescription("Có lỗi xảy ra khi thực thi lệnh này. Vui lòng thử lại sau.")
          .setColor("Red");
        if (t.replied || t.deferred) {
          t.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        } else {
          t.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        }
      }
    }),
});
