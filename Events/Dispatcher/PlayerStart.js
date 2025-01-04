const db = require("../../Models/Setup");
const db2 = require("../../Models/Announce");
const { trackStartHandler } = require("../../Handler/RequestChannelEvent");
const { Token } = require("../../Config.js");
const axios = require("axios");
const {
    WebhookClient,
    AttachmentBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");
const { muzicard } = require("muzicard");
const moment = require("moment");

module.exports = {
    name: "playerStart",
    /**
     * @param {import("../../Main")} client
     * @param {import("kazagumo").KazagumoPlayer} dispatcher
     * @param {import("kazagumo").KazagumoTrack} track
     * @param {import("kazagumo")} kazagumo
     */
    async execute(client, dispatcher, track, kazagumo) {
        try {
           
            const isRadioMode = dispatcher.data.get("radioMode") === true;
            const isAIDJMode = dispatcher.metadata?.source === "AIDJMode";  

            const status = isRadioMode
                ? "Now playing a radio station"
                : isAIDJMode
                ? "Now playing AI DJ"
                : `Now playing: ${track.title}`;

            const botToken = Token;
            await axios.put(
                `https://discord.com/api/v9/channels/${dispatcher.voiceId}/voice-status`,
                { status },
                {
                    headers: {
                        Authorization: `Bot ${botToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

           
            const card = new muzicard()
                .setName(isRadioMode ? "Radio Station" : isAIDJMode ? "AI DJ" : track.title)
                .setAuthor(isRadioMode ? "Radio" : isAIDJMode ? "AI DJ" : "Kronix")
                .setColor(isRadioMode ? "#FF5733" : isAIDJMode ? "#00BFFF" : "auto")
                .setTheme(isRadioMode ? "dynamic" : isAIDJMode ? "dynamic" : "dynamic")
                .setBrightness(isRadioMode ? 85 : isAIDJMode ? 70 : 69)
                .setThumbnail(track.thumbnail)
                .setProgress(isRadioMode ? 0 : 15)
                .setStartTime(isRadioMode ? "Radio Live" : isAIDJMode ? "AI DJ Live" : "0:10")
                .setEndTime(isRadioMode ? "Live" : isAIDJMode ? "Live" : track.length);

            const buffer = await card.build();
            if (!buffer) {
                console.error("Buffer is null or undefined");
                return;
            }

            const attachment = new AttachmentBuilder(buffer, {
                name: "muzicard.png",
            });
            const color = client.color || "#f50a83";
            dispatcher.data.set("autoplayfunction", track);
            const guild = client.guilds.cache.get(dispatcher.guildId);
            if (!guild) return;
            let channel = guild.channels.cache.get(dispatcher.textId);
            if (!channel) return;

            const [data, data2] = await Promise.all([
                db.findOne({ _id: guild.id }),
                db2.findOne({ _id: guild.id }),
            ]);
            const author = track.author || "Unknown";

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("highvolume_but")
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("<:11volup:1288550774871425034>"),
                new ButtonBuilder()
                    .setCustomId("previous_but")
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("<:11prev:1288550025173143654>"),
                new ButtonBuilder()
                    .setCustomId("pause_but")
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("<:11pause:1288549936107094056>"),
                new ButtonBuilder()
                    .setCustomId("skip_but")
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("<:11next:1288549983049486411>"),
                new ButtonBuilder()
                    .setCustomId("lowvolume_but")
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("<:11voldown:1288550964151849070>")
            );
            const components = [buttons];

            const sendMessage = async (channel, description) => {
                try {
                    const url = `https://discord.com/users/${track.requester.id}`;
                    const formattedTitle = isRadioMode
                        ? "Radio Station"
                        : isAIDJMode
                        ? "AI DJ"
                        : track.title.length > 25
                        ? track.title.slice(0, 25) + "..."
                        : track.title + "...";

                    const requester = track.requester.id
                        ? `<@${track.requester.id}>`
                        : `<${client.user.id}>`;

                    const embedDescription = isRadioMode
                        ? `<:MekoStatusRole:1275400008278999116> Now Playing a Radio Station`
                        : isAIDJMode
                        ? `<:MekoStatusRole:1275400008278999116> Ai is Playing a Song`
                        : `> <:MekoStatusRole:1275400008278999116> Now Playing **[${formattedTitle}](https://discord.gg/E6M6DnSwdt)**\n> <:Team:1278274780906262649> Requested by: ${requester}`;

                    const footerText = isRadioMode
                        ? `with love for all of you ~ akshat`
                        : isAIDJMode
                        ? `with love for all of you ~ akshat`
                        : `with love for all of you ~ akshat - Duration: ${moment.duration(track.length).format("hh:mm:ss")}`;

                    const message = await channel.send({
                        embeds: [
                            client
                                .embed()
                                .setImage("attachment://muzicard.png")
                                .setAuthor({
                                    iconURL: `https://cdn.discordapp.com/emojis/1288060047728840725.webp?size=96&quality=lossless`,
                                    name: `Player Information`,
                                    url: `https://discord.gg/teamkronix`,
                                })
                                .setDescription(embedDescription)
                                .setFooter({ text: footerText, iconURL: `https://cdn.discordapp.com/emojis/1287835131633209446.webp?size=96&quality=lossless` })
                                .setColor(String(color)),
                        ],
                        files: [attachment],
                        components,
                    });

                    if (data2 && data2.prunning) {
                        await dispatcher.setNowplayingMessage(message);
                    }

                    createCollector(message);
                } catch (error) {
                    console.error(error);
                    await channel.send({
                        embeds: [
                            client
                                .embed()
                                .setImage("attachment://muzicard.png")
                                .setDescription(description)
                                .setColor(String(color)),
                        ],
                        files: [attachment],
                        components,
                    });
                }
            };

            const createCollector = (message) => {
                const collector = message.createMessageComponentCollector({
                    time: 60000, // Collect for 60 seconds
                });

                collector.on("collect", async (interaction) => {
                    if (!interaction.isButton()) return;

                    const customId = interaction.customId;
                    const player = kazagumo.player.get(dispatcher.guildId);

                    if (player) {
                        switch (customId) {
                            case "highvolume_but":
                                const newVolumeUp = Math.min(player.volume + 10, 100);
                                await player.setVolume(newVolumeUp);
                                await interaction.reply({
                                    content: `Volume increased to ${newVolumeUp}%`,
                                    ephemeral: true,
                                });
                                break;
                            case "lowvolume_but":
                                const newVolumeDown = Math.max(player.volume - 10, 0);
                                await player.setVolume(newVolumeDown);
                                await interaction.reply({
                                    content: `Volume decreased to ${newVolumeDown}%`,
                                    ephemeral: true,
                                });
                                break;
                            case "previous_but":
                                await player.skip();
                                await interaction.reply({
                                    content: "Skipped to the previous track.",
                                    ephemeral: true,
                                });
                                break;
                            case "pause_but":
                                await player.pause();
                                await interaction.reply({
                                    content: "Playback paused.",
                                    ephemeral: true,
                                });
                                break;
                            case "skip_but":
                                await player.skip();
                                await interaction.reply({
                                    content: "Skipped to the next track.",
                                    ephemeral: true,
                                });
                                break;
                            default:
                                await interaction.reply({
                                    content: "Unknown button interaction",
                                    ephemeral: true,
                                });
                        }
                    } else {
                        await interaction.reply({
                            content: "No active player found",
                            ephemeral: true,
                        });
                    }
                });
            };

            const description = isRadioMode
                ? `<:MekoStatusRole:1275400008278999116> Now Playing a Radio Station`
                : isAIDJMode
                ? `<:MekoStatusRole:1275400008278999116> AI DJ Mode Activated! Playing **[${track.title.slice(0, 20)}.....](https://discord.gg/E6M6DnSwdt)**`
                : `<:MekoStatusRole:1275400008278999116> Now Playing **[${track.title.slice(0, 20)}.....](https://discord.gg/E6M6DnSwdt)**`;
            sendMessage(channel, description);
        } catch (error) {
            console.error(error);
        }
    },
};
