"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const tslib_1 = require("tslib"),
  discord_js_1 = require("discord.js"),
  Command_1 = require("../../structures/Command"),
  ms_1 = tslib_1.__importDefault(require("ms"));

exports.default = new Command_1.Command({
  name: "giveaway",
  description: "Quản lý và thiết lập các sự kiện Giveaway (Quà tặng)",
  run: ({ interaction: e, client: t }) =>
    tslib_1.__awaiter(void 0, void 0, void 0, function* () {
      const s = (e = !1) => [
        new discord_js_1.ActionRowBuilder().addComponents(
          new discord_js_1.ButtonBuilder()
            .setCustomId("create")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setLabel("Tạo mới")
            .setDisabled(e)
            .setEmoji("🎉"),
          new discord_js_1.ButtonBuilder()
            .setCustomId("pause")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setLabel("Tạm dừng")
            .setDisabled(e)
            .setEmoji("⏸️"),
          new discord_js_1.ButtonBuilder()
            .setCustomId("resume")
            .setLabel("Tiếp tục")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(e)
            .setEmoji("▶️"),
          new discord_js_1.ButtonBuilder()
            .setCustomId("reroll")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setLabel("Quay lại giải")
            .setDisabled(e)
            .setEmoji("🔁"),
          new discord_js_1.ButtonBuilder()
            .setCustomId("end")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setLabel("Kết thúc")
            .setDisabled(e)
            .setEmoji("⏹️"),
        ),
      ];
      
      let i = {
        channel: null,
        time: null,
        winners: null,
        prize: "",
        description: "",
        image: "",
        requirements: { levels: "", messages: "", invites: "" },
      };

      const n = (e = !1) => {
        const {
          channel: t,
          time: s,
          winners: n,
          prize: o,
          description: r,
          image: d,
          requirements: a,
        } = i,
        l = [
          new discord_js_1.ActionRowBuilder().addComponents(
            new discord_js_1.ButtonBuilder()
              .setCustomId("cr-channel")
              .setDisabled(e)
              .setStyle(
                t
                  ? discord_js_1.ButtonStyle.Primary
                  : discord_js_1.ButtonStyle.Secondary,
              )
              .setLabel("Kênh chat")
              .setEmoji("🛒"),
            new discord_js_1.ButtonBuilder()
              .setCustomId("cr-time")
              .setDisabled(e)
              .setStyle(
                s
                  ? discord_js_1.ButtonStyle.Primary
                  : discord_js_1.ButtonStyle.Secondary,
              )
              .setLabel("Thời gian")
              .setEmoji("⏳"),
            new discord_js_1.ButtonBuilder()
              .setCustomId("cr-winners")
              .setDisabled(e)
              .setStyle(
                n
                  ? discord_js_1.ButtonStyle.Primary
                  : discord_js_1.ButtonStyle.Secondary,
              )
              .setLabel("Số người thắng")
              .setEmoji("👑"),
            new discord_js_1.ButtonBuilder()
              .setCustomId("cr-prize")
              .setDisabled(e)
              .setStyle(
                o
                  ? discord_js_1.ButtonStyle.Primary
                  : discord_js_1.ButtonStyle.Secondary,
              )
              .setLabel("Phần quà")
              .setEmoji("🎁"),
            new discord_js_1.ButtonBuilder()
              .setCustomId("cr-description")
              .setDisabled(e)
              .setStyle(
                r
                  ? discord_js_1.ButtonStyle.Primary
                  : discord_js_1.ButtonStyle.Secondary,
              )
              .setLabel("Mô tả")
              .setEmoji("📰"),
          ),
          new discord_js_1.ActionRowBuilder().addComponents(
            new discord_js_1.ButtonBuilder()
              .setCustomId("cr-image")
              .setDisabled(e)
              .setStyle(
                d
                  ? discord_js_1.ButtonStyle.Primary
                  : discord_js_1.ButtonStyle.Secondary,
              )
              .setLabel("Hình ảnh")
              .setEmoji("🖼"),
            new discord_js_1.ButtonBuilder()
              .setCustomId("cr-requirements")
              .setDisabled(e)
              .setStyle(
                Object.values(a).some((e) => "" !== e)
                  ? discord_js_1.ButtonStyle.Primary
                  : discord_js_1.ButtonStyle.Secondary,
              )
              .setLabel("Yêu cầu")
              .setEmoji("🍱"),
            new discord_js_1.ButtonBuilder()
              .setCustomId("cr-back")
              .setStyle(discord_js_1.ButtonStyle.Secondary)
              .setEmoji("⬅️")
              .setDisabled(e)
              .setLabel("Quay lại"),
          ),
        ];
        return (
          t &&
            s &&
            n &&
            o &&
            r &&
            l[1].addComponents(
              new discord_js_1.ButtonBuilder()
                .setCustomId("cr-finish")
                .setDisabled(e)
                .setStyle(discord_js_1.ButtonStyle.Success)
                .setLabel("Hoàn tất & Bắt đầu")
                .setEmoji("✔️"),
            ),
          l
        );
      };

      const o = (e = !1) => [
        new discord_js_1.ActionRowBuilder().addComponents(
          new discord_js_1.ButtonBuilder()
            .setCustomId("rq-levels")
            .setDisabled(e)
            .setStyle(
              i.requirements.levels
                ? discord_js_1.ButtonStyle.Primary
                : discord_js_1.ButtonStyle.Secondary,
            )
            .setLabel("Cấp độ")
            .setEmoji("✨"),
          new discord_js_1.ButtonBuilder()
            .setCustomId("rq-invites")
            .setDisabled(e)
            .setStyle(
              i.requirements.invites
                ? discord_js_1.ButtonStyle.Primary
                : discord_js_1.ButtonStyle.Secondary,
            )
            .setLabel("Lượt mời")
            .setEmoji("👥"),
          new discord_js_1.ButtonBuilder()
            .setCustomId("rq-messages")
            .setDisabled(e)
            .setStyle(
              i.requirements.messages
                ? discord_js_1.ButtonStyle.Primary
                : discord_js_1.ButtonStyle.Secondary,
            )
            .setLabel("Tin nhắn")
            .setEmoji("🌟"),
          new discord_js_1.ButtonBuilder()
            .setCustomId("rq-back")
            .setDisabled(e)
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setLabel("Quay lại")
            .setEmoji("⬅️"),
        ),
      ];

      const r = (e = !1, s) => ({
        embeds: [
          new discord_js_1.EmbedBuilder()
            .setTitle("⚙️ Cấu hình yêu cầu tham gia Giveaway")
            .setDescription(
              s || "Sử dụng các nút bên dưới để thiết lập các điều kiện tham gia cho sự kiện Giveaway này.",
            )
            .setColor(t.config.GeneralSettings.EmbedColor),
        ],
        components: o(e),
      });

      const d = (e = !1, customDesc) => ({
        embeds: [
          new discord_js_1.EmbedBuilder()
            .setTitle("🎉 Hệ thống Thiết lập Giveaway mới")
            .setDescription(
              customDesc || "Bấm vào các nút bên dưới để thiết lập thông tin cho sự kiện Giveaway của bạn.",
            )
            .setColor(t.config.GeneralSettings.EmbedColor),
        ],
        components: n(e),
      });

      const a = (s, i) => {
        let actionVi = "tạm dừng";
        if (i === "resume") actionVi = "tiếp tục";
        if (i === "reroll") actionVi = "quay thưởng lại";
        if (i === "end") actionVi = "kết thúc";
        
        return {
          embeds: [
            new discord_js_1.EmbedBuilder()
              .setTitle("🎁 Quản lý sự kiện Giveaway")
              .setDescription(`${e.user}, vui lòng chọn sự kiện Giveaway bạn muốn **${actionVi}** bên dưới.`)
              .setColor(t.config.GeneralSettings.EmbedColor),
          ],
          components: [
            new discord_js_1.ActionRowBuilder().addComponents(
              new discord_js_1.StringSelectMenuBuilder()
                .setPlaceholder("🔎 Chọn sự kiện Giveaway từ danh sách...")
                .setCustomId("select-panel")
                .setOptions(
                  s.map((e) => ({
                    label: `${e.prize}`,
                    value: e.messageId,
                    emoji: "🎁",
                  })),
                ),
            ),
          ],
        };
      };

      const l = (e, i) => ({
        embeds: [
          new discord_js_1.EmbedBuilder()
            .setTitle("🎉 Hệ thống Quản lý Giveaway")
            .setDescription(
              e || "Bấm vào các nút bên dưới tương ứng với hành động bạn muốn thực hiện.",
            )
            .setColor(i || t.config.GeneralSettings.EmbedColor),
        ],
        components: s(),
        fetchReply: !0,
      });

      const c = yield e.reply(
        Object.assign(Object.assign({}, l()), { fetchReply: !0 }),
      );

      const u = c.createMessageComponentCollector({
        filter: (t) => t.user.id === e.user.id,
        componentType: discord_js_1.ComponentType.Button,
        time: 180000,
      });

      u.on("collect", (s) =>
        tslib_1.__awaiter(void 0, void 0, void 0, function* () {
          u.resetTimer();
          const { customId: m } = s;
          
          if (m.startsWith("cr-")) {
            ((s, o) => {
              tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                yield s.deferUpdate();
                
                if ("finish" === o) {
                  yield t.giveawayManager.start(i.channel, {
                    prize: i.prize,
                    hostedBy: e.user,
                    winnerCount: parseInt(i.winners),
                    duration: i.time,
                    extraData: {
                      description: i.description,
                      image: i.image,
                      requirements: i.requirements,
                    },
                    messages: {
                      winMessage: t.messages.Strings.GiveawayWinMessage,
                      giveaway: t.messages.Strings.GiveawayContentMessage,
                      giveawayEnded: t.messages.Strings.GiveawayContentEnded,
                      noWinner: t.messages.Strings.GiveawayContentNoWinners,
                    },
                  });
                  i = {
                    channel: null,
                    time: 0,
                    winners: "",
                    prize: "",
                    description: "",
                    image: "",
                    requirements: { invites: "", levels: "", messages: "" },
                  };
                  return e.editReply(l("🎉 Sự kiện Giveaway đã được khởi tạo và gửi đi thành công!"));
                }
                
                if ("requirements" === o) return e.editReply(r());
                if ("back" === o) return e.editReply(l());
                
                // Show clear prompt on what to type
                let promptText = "";
                if (o === "channel") promptText = "👉 **[THIẾT LẬP KÊNH CHAT]**: Vui lòng đề cập (tag) kênh chat bạn muốn gửi tin nhắn Giveaway vào trong phòng chat này (Ví dụ: `#giveaways`).";
                if (o === "time") promptText = "👉 **[THIẾT LẬP THỜI GIAN]**: Vui lòng nhập thời gian diễn ra sự kiện (Ví dụ: `30m` (30 phút), `1h` (1 giờ), `1d` (1 ngày)).";
                if (o === "winners") promptText = "👉 **[THIẾT LẬP NGƯỜI THẮNG]**: Vui lòng nhập số lượng người may mắn sẽ trúng giải giải thưởng này (Ví dụ: `1`, `3`, `5`).";
                if (o === "prize") promptText = "👉 **[THIẾT LẬP PHẦN QUÀ]**: Vui lòng nhập tên phần thưởng của sự kiện này (Ví dụ: `Discord Nitro Classic`, `2,500 Xu`).";
                if (o === "description") promptText = "👉 **[THIẾT LẬP MÔ TẢ]**: Vui lòng nhập đoạn tin nhắn hoặc mô tả chi tiết của sự kiện này vào phòng chat.";
                if (o === "image") promptText = "👉 **[THIẾT LẬP HÌNH ẢNH]**: Vui lòng tải và đăng trực tiếp một tệp hình ảnh lên kênh chat này để dùng làm ảnh bìa.";
                
                yield e.editReply(d(!0, promptText));
                
                const a = yield s.channel.awaitMessages({
                  filter: (t) => t.author.id === e.user.id,
                  max: 1,
                  time: 60000
                });
                
                if (!a.size) {
                  return e.editReply(d(!1, "⏱️ Đã hết thời gian chờ nhập thông tin (1 phút). Vui lòng nhấn lại nút để thiết lập."));
                }
                
                yield a.first().delete().catch();
                let c = a.first().content;
                
                if ("channel" === o) {
                  c = a.first().mentions.channels.first();
                  if (!c) {
                    return e.editReply({
                      embeds: [
                        new discord_js_1.EmbedBuilder()
                          .setTitle("❌ Lỗi thiết lập")
                          .setColor("Red")
                          .setDescription("Bạn cần phải đề cập chính xác một kênh chat trong máy chủ (Ví dụ: `#kênh-chat`)."),
                      ],
                      components: n(),
                    });
                  }
                }
                
                if ("time" === o) {
                  const parsedTime = (0, ms_1.default)(c);
                  if (!parsedTime) {
                    return e.editReply({
                      embeds: [
                        new discord_js_1.EmbedBuilder()
                          .setTitle("❌ Lỗi thiết lập")
                          .setColor("Red")
                          .setDescription("Thời gian không hợp lệ! Vui lòng thử lại với định dạng: `30m`, `1h`, `1d`..."),
                      ],
                      components: n(),
                    });
                  }
                  c = parsedTime;
                }
                
                if ("winners" === o) {
                  const winCount = parseInt(c);
                  if (isNaN(winCount) || winCount <= 0) {
                    return e.editReply({
                      embeds: [
                        new discord_js_1.EmbedBuilder()
                          .setTitle("❌ Lỗi thiết lập")
                          .setColor("Red")
                          .setDescription("Số người trúng thưởng phải là một số nguyên dương lớn hơn 0!"),
                      ],
                      components: n(),
                    });
                  }
                  c = winCount;
                }
                
                if ("image" === o) {
                  const img = a.first().attachments.first();
                  if (!img || !img.contentType.startsWith("image/")) {
                    return e.editReply({
                      embeds: [
                        new discord_js_1.EmbedBuilder()
                          .setTitle("❌ Lỗi thiết lập")
                          .setColor("Red")
                          .setDescription("Tệp tải lên không hợp lệ! Vui lòng đính kèm một hình ảnh thực tế trực tiếp vào kênh chat."),
                      ],
                      components: n(),
                    });
                  }
                  c = img.url;
                }
                
                i[o] = c;
                return e.editReply(d());
              });
            })(s, m.slice(3));
          } 
          
          else if (m.startsWith("rq-")) {
            ((t, s) => {
              tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                yield t.deferUpdate();
                
                if ("back" === s) return e.editReply(d());
                
                let requirementName = "";
                if (s === "levels") requirementName = "Cấp độ (Level)";
                if (s === "invites") requirementName = "Lượt mời (Invites)";
                if (s === "messages") requirementName = "Tin nhắn (Messages)";
                
                yield e.editReply(
                  r(
                    !0,
                    `👉 **[THIẾT LẬP YÊU CẦU]**: Thành viên cần có tối thiểu bao nhiêu **${requirementName}** để tham gia?\n*Gõ số \`0\` để gỡ bỏ yêu cầu này.*`,
                  ),
                );
                
                const n = yield t.channel.awaitMessages({
                  filter: (t) => t.author.id === e.user.id,
                  max: 1,
                  time: 60000
                });
                
                if (!n.size) {
                  return e.editReply(r(!1, "⏱️ Đã hết thời gian chờ nhập thông tin (1 phút). Vui lòng nhấn lại nút để thiết lập."));
                }
                
                yield n.first().delete().catch();
                let a = parseInt(n.first().content);
                
                if (isNaN(a) || a < 0) {
                  return e.editReply({
                    embeds: [
                      new discord_js_1.EmbedBuilder()
                        .setTitle("❌ Lỗi thiết lập")
                        .setColor("Red")
                        .setDescription("Yêu cầu nhập vào phải là một số nguyên dương không âm!"),
                    ],
                    components: o(!0),
                  });
                }
                
                if (a === 0) a = "";
                i.requirements[s] = a;
                return e.editReply(r());
              });
            })(s, m.slice(3));
          } 
          
          else {
            yield s.deferUpdate();
            
            if ("create" === m) {
              yield e.editReply(d());
            }
            
            if ("pause" === m) {
              const s = t.giveawayManager.giveaways.filter(
                (e) => e.endAt !== 1 / 0,
              );
              if (s.length === 0) {
                return e.editReply(l("❌ Hiện tại không có sự kiện Giveaway nào đang hoạt động để tạm dừng."));
              }
              yield e.editReply(a(s, m));
              const i = yield c.awaitMessageComponent({
                componentType: discord_js_1.ComponentType.SelectMenu,
                filter: (t) => t.user.id === e.user.id,
                time: 60000
              });
              yield i.deferUpdate();
              try {
                const s = i.values[0];
                yield t.giveawayManager.pause(s);
                return e.editReply(l("🎉 Sự kiện Giveaway đã được tạm dừng thành công!"));
              } catch (t) {
                console.error(t);
                return e.editReply(l(`❌ Có lỗi xảy ra: ${t.message}`, "Red"));
              }
            }
            
            if ("resume" === m) {
              const s = t.giveawayManager.giveaways.filter(
                (e) => e.endAt === 1 / 0,
              );
              if (s.length === 0) {
                return e.editReply(l("❌ Hiện tại không có sự kiện Giveaway nào đang bị tạm dừng để tiếp tục."));
              }
              yield e.editReply(a(s, m));
              const i = yield c.awaitMessageComponent({
                componentType: discord_js_1.ComponentType.SelectMenu,
                filter: (t) => t.user.id === e.user.id,
                time: 60000
              });
              yield i.deferUpdate();
              try {
                const s = i.values[0];
                yield t.giveawayManager.unpause(s);
                return e.editReply(l("🎉 Sự kiện Giveaway đã được tiếp tục hoạt động thành công!"));
              } catch (t) {
                console.error(t);
                return e.editReply(l(`❌ Có lỗi xảy ra: ${t.message}`, "Red"));
              }
            }
            
            if ("reroll" === m) {
              const s = t.giveawayManager.giveaways.filter((e) => e.ended);
              if (s.length === 0) {
                return e.editReply(l("❌ Hiện tại không có sự kiện Giveaway nào đã kết thúc để quay thưởng lại."));
              }
              yield e.editReply(a(s, m));
              const i = yield c.awaitMessageComponent({
                componentType: discord_js_1.ComponentType.SelectMenu,
                filter: (t) => t.user.id === e.user.id,
                time: 60000
              });
              yield i.deferUpdate();
              try {
                const s = i.values[0];
                yield t.giveawayManager.reroll(s);
                return e.editReply(l("🎉 Đã chọn lại người thắng cuộc may mắn mới thành công!"));
              } catch (t) {
                console.error(t);
                return e.editReply(l(`❌ Có lỗi xảy ra: ${t.message}`, "Red"));
              }
            }
            
            if ("end" === m) {
              const s = t.giveawayManager.giveaways.filter((e) => !e.ended);
              if (s.length === 0) {
                return e.editReply(l("❌ Hiện tại không có sự kiện Giveaway nào đang chạy để kết thúc."));
              }
              yield e.editReply(a(s, m));
              const i = yield c.awaitMessageComponent({
                componentType: discord_js_1.ComponentType.SelectMenu,
                filter: (t) => t.user.id === e.user.id,
                time: 60000
              });
              yield i.deferUpdate();
              try {
                const s = i.values[0];
                yield t.giveawayManager.end(s);
                return e.editReply(l("🎉 Sự kiện Giveaway đã được dừng và chốt người thắng cuộc thành công!"));
              } catch (t) {
                console.error(t);
                return e.editReply(l(`❌ Có lỗi xảy ra: ${t.message}`, "Red"));
              }
            }
          }
        })
      );

      u.once("end", (t, s) => {
        if ("time" === s) {
          e.editReply({
            embeds: [
              new discord_js_1.EmbedBuilder()
                .setTitle("⏱️ Hết thời gian chờ")
                .setDescription("Đã quá 3 phút mà không thấy bạn phản hồi thao tác menu. Vui lòng gõ lại lệnh nếu muốn tiếp tục.")
                .setColor("Red"),
            ],
            components: [],
          });
        }
      });
    }),
});
