const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require("discord.js");
const db = require("../../Models/Playlist.js");
const ms = require("ms");
const lodash = require("lodash");

module.exports = new Object({
    name: "playlist-info",
    description: "Gives you the information of a playlist.",
    category: "Playlist",
    cooldown: 5,
    usage: "<playlist name>",
    aliases: ["pl-info"],
    examples: ["playlist-info myPlaylist"],
    sub_commands: [],
    args: true,
    permissions: {
        isPremium: false,
        client: [],
        user: [],
        dev: false,
        voteRequired: false
    },
    player: { voice: false, active: false, dj: false, djPerm: null },

    async execute(client, message, args, prefix, color, dispatcher) {
        const Name = args[0];
        const data = await db.findOne({
            UserId: message.author.id,
            PlaylistName: Name,
        });
        if (!data) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setDescription(
                            `You don't have a playlist with **${Name}** name`,
                        ),
                ],
            });
        }
        let tracks = data.Playlist.map(
            (x, i) =>
                `\`${+i}\` - ${x.title && x.uri ? `[${x.title}](${x.uri})` : `${x.title}`}${
                    x.duration ? ` - \`${ms(Number(x.duration))}\`` : ""
                }`,
        );
        let pname = data.PlaylistName;
        let plist = data.Playlist.length;

        const pages = lodash.chunk(tracks, 10).map((x) => x.join("\n"));
        let page = 0;
        const embed = new EmbedBuilder()
            .setTitle(`${message.author.username}'s Playlists`)
            .setColor(color)
            .setDescription(
                `**Playlist Name** ${pname} **Total Tracks** \`${plist}\`\n\n${pages[page]}`,
            );
        if (pages.length <= 1) {
            return await message.reply({ embeds: [embed] });
        } else {
            let previousbut = new ButtonBuilder()
                .setCustomId("Previous")
                .setEmoji("⏪")
                .setStyle(ButtonStyle.Secondary);

            let nextbut = new ButtonBuilder()
                .setCustomId("Next")
                .setEmoji("⏩")
                .setStyle(ButtonStyle.Secondary);

            let stopbut = new ButtonBuilder()
                .setCustomId("stop")
                .setEmoji("⏹️")
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder().addComponents(
                previousbut,
                stopbut,
                nextbut,
            );

            const m = await message.reply({
                embeds: [embed],
                components: [row],
            });

            const collector = m.createMessageComponentCollector({
                filter: (b) =>
                    b.user.id === message.author.id
                        ? true
                        : false && b.deferUpdate().catch(() => {}),
                time: 60000 * 5,
                idle: (60000 * 5) / 2,
            });

            collector.on("end", async () => {
                if (!m) return;
                await m.edit({
                    components: [
                        new MessageActionRow().addComponents(
                            previousbut.setDisabled(true),
                            stopbut.setDisabled(true),
                            nextbut.setDisabled(true),
                        ),
                    ],
                });
            });

            collector.on("collect", async (b) => {
                if (!b.deferred) await b.deferUpdate().catch(() => {});
                if (b.customId === "Previous") {
                    page = page - 1 < 0 ? pages.length - 1 : --page;
                    if (!m) return;

                    embed.setDescription(
                        `**Playlist Name** ${pname} **Total Tracks** \`${plist}\`\n\n${pages[page]}`,
                    );

                    return await m.edit({ embeds: [embed] });
                } else if (b.customId === "Stop") {
                    return collector.stop();
                } else if (b.customId === "playlist_cmd_uwu-next")
                    page = page + 1 >= pages.length ? 0 : ++page;
                if (!m) return;

                embed.setDescription(
                    `**Playlist Name** ${pname} **Total Tracks** \`${plist}\`\n\n${pages[page]}`,
                );

                return await m.edit({ embeds: [embed] });
            });
        }
    },
});
