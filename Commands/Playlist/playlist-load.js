const { EmbedBuilder } = require("discord.js");
const db = require("../../Components/playlist.js");

module.exports = new Object({
    name: "playlist-load",
    description: "Loads all songs of a playlist to the queue.",
    category: "Playlist",
    cooldown: 5,
    usage: "<playlist name>",
    aliases: ["pl-load"],
    examples: ["playlist-load MyPlaylist"],
    sub_commands: [],
    args: true,
    permissions: {
        isPremium: false,
        client: [],
        user: [],
        dev: false,
        voteRequired: false,
    },
    player: { voice: true, active: false, dj: false, djPerm: null },

    async execute(client, message, args, prefix, color, dispatcher) {
        const Name = args[0];
        const player = client.dispatcher.createPlayer({
            guild: message.guild.id,
            voiceChannel: message.member.voice.channel.id,
            textChannel: message.channel.id,
            volume: 100,
            selfDeafen: true,
        });

        if (player && player.state !== "CONNECTED") player.connect();

        const data = await db.findOne({
            UserId: message.author.id,
            PlaylistName: Name,
        });

        if (!data) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2F3136")
                        .setDescription(
                            `<:cross1:1074564046134718474> | You don't have any Playlist named **${Name}**.`,
                        ),
                ],
            });
        }

        if (!player) return;

        let count = 0;
        const m = await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#2F3136")
                    .setDescription(
                        `Started loading **${data.Playlist.length}** tracks from Playlist **${Name}**`,
                    ),
            ],
        });

        try {
            for (const track of data.Playlist) {
                let s = await player.search(
                    track.uri ? track.uri : track.title,
                    message.author,
                );
                if (
                    s.loadType === "TRACK_LOADED" ||
                    s.loadType === "SEARCH_RESULT"
                ) {
                    if (player.state !== "CONNECTED") player.connect();
                    if (player) player.queue.add(s.tracks[0]);
                    ++count;
                }
            }
        } catch (err) {}

        if (player && !player.queue.current) player.destroy();
        if (!player.playing && player.queue.size) player.play();

        if (count <= 0) {
            return await m
                .edit({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#2F3136")
                            .setDescription(
                                `<:cross1:1074564046134718474> | Can't load tracks from Playlist **${Name}**`,
                            ),
                    ],
                })
                .catch((err) => {});
        }

        return await m
            .edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2F3136")
                        .setDescription(
                            `<:Success:1074564018385211424> | Successfully loaded **${count}** tracks from Playlist **${Name}**`,
                        ),
                ],
            })
            .catch((err) => {});
    },
});
