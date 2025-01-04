const { EmbedBuilder } = require("discord.js");
const Playlist = require("../../Components/playlist.js"); // Ensure correct path

module.exports = {
    name: "playlist-addcurrent",
    aliases: ["pl-addcurrent"],
    category: "Playlist",
    description: "Saves Current Song To Playlist.",
    args: true,
    usage: "<playlist name>",
    permissions: {
        isPremium: false,
        client: [],
        user: [],
        dev: false,
        voteRequired: false
    },
      async execute(client, message, args, prefix, color, dispatcher) {

        const Name = args[0];
        const data = await Playlist.findOne({ userId: message.author.id, playlistName: Name });
          const player = client.dispatcher.players.get(message.guildId);

        if (!player.queue.current) {
            let thing = new EmbedBuilder()
                .setColor("#2f3136")
                .setDescription("There is no music playing.");
            return message.reply({ embeds: [thing] });
        }
        if (!data) {
            return message.reply({ embeds: [new EmbedBuilder().setColor("#2F3136").setDescription(`<:AresCross:1093062761069690890> | You don't have any Playlist named **${Name}**.`)] });
        }
        const song = player.queue.current;
        let oldSong = data.playlist;
        if (!Array.isArray(oldSong)) oldSong = [];
        oldSong.push({
            "title": song.title,
            "uri": song.uri,
            "author": song.author,
            "duration": song.duration
        });
        await Playlist.updateOne({
            userId: message.author.id,
            playlistName: Name
        },
        {
            $set: {
                playlist: oldSong
            }
        });
        const embed = new EmbedBuilder()
            .setColor("#2F3136")
            .setAuthor(`Added Song To Playlist ${Name}`, message.author.displayAvatarURL({ dynamic: true }), "https://discord.gg/ejSESjpgsF")
            .setDescription(`<:queue:1066040371576057936> [${song.title.substring(0, 63)}](${song.uri})`);
        return message.channel.send({ embeds: [embed] });

    }
};
