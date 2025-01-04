const { EmbedBuilder } = require("discord.js");
const Playlist = require("../../Components/playlist.js"); // Ensure the path is correct

module.exports = {
    name: "playlist-addqueue",
    aliases: ["pl-addqueue"],
    category: "Playlist",
    description: "Saves Current Queue To Playlist",
    args: true,
    usage: "<playlist name>",
    permissions: {
        isPremium: false,
        client: [],
        user: [],
        dev: false,
        voteRequired: false,
    },
    async execute(client, message, args, prefix, color, dispatcher) {
        const Name = args[0];
        const player = client.dispatcher.players.get(message.guild.id);
        if (!player.queue.current) {
            let thing = new EmbedBuilder()
                .setColor("#2f3136")
                .setDescription("There is no music playing.");
            return message.reply({ embeds: [thing] });
        }
        const data = await Playlist.findOne({
            userId: message.author.id,
            playlistName: Name,
        });
        if (!data) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2F3136")
                        .setDescription(
                            `<:AresCross:1093062761069690890> | You don't have any Playlist named **${Name}**.`,
                        ),
                ],
            });
        }
        const song = player.queue.current;
        const tracks = player.queue;

        let oldSong = data.playlist;
        if (!Array.isArray(oldSong)) oldSong = [];
        const newSong = [];
        if (player.queue.current) {
            newSong.push({
                title: song.title,
                uri: song.uri,
                author: song.author,
                duration: song.duration,
            });
        }
        for (const track of tracks)
            newSong.push({
                title: track.title,
                uri: track.uri,
                author: track.author,
                duration: track.duration,
            });
        const playlist = oldSong.concat(newSong);
        await Playlist.updateOne(
            {
                userId: message.author.id,
                playlistName: Name,
            },
            {
                $set: {
                    playlist: playlist,
                },
            },
        );
        const embed = new EmbedBuilder()
            .setAuthor(
                `Added Queue To Playlist ${Name}`,
                message.author.displayAvatarURL({ dynamic: true }),
                "https://discord.gg/ejSESjpgsF",
            )
            .setDescription(
                `<:queue:1066040371576057936> **Total Tracks Added: ${playlist.length - oldSong.length}**`,
            )
            .setColor("#2F3136");
        return message.channel.send({ embeds: [embed] });
    },
};
