const { EmbedBuilder } = require("discord.js");
const db = require("../../Components/playlist.js");

module.exports = new Object({
    name: "playlist-removetrack",
    description: "Removes a track from a playlist.",
    category: "Playlist",
    cooldown: 5,
    usage: '<playlist name> <track number>',
    aliases: ['pl-removetrack'],
    examples: ['playlist-removetrack MyPlaylist 1'],
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
        const data = await db.findOne({ UserId: message.author.id, PlaylistName: Name });

        if (!data) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2F3136")
                        .setDescription(`<:cross1:1074564046134718474> | You don't have any playlist named **${Name}**.`)
                ]
            });
        }

        const Options = args[1];
        if (!Options || isNaN(Options)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2F3136")
                        .setDescription(`<:cross1:1074564046134718474> | Invalid track number provided for playlist ${Name}.`)
                ]
            });
        }

        let tracks = data.Playlist;
        if (Number(Options) >= tracks.length || Number(Options) < 0) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2F3136")
                        .setDescription(`<:cross1:1074564046134718474> | Invalid track number provided for playlist ${Name}.`)
                ]
            });
        }

        await db.updateOne(
            { UserId: message.author.id, PlaylistName: Name },
            { $pull: { Playlist: tracks[Options] } }
        );

        const embed = new EmbedBuilder()
            .setColor("#2F3136")
            .setAuthor(`Removed Song From Playlist ${Name}`, message.author.displayAvatarURL({ dynamic: true }), "https://discord.gg/ejSESjpgsF")
            .setDescription(`<:queue:1066040371576057936> [${tracks[Options].title.substring(0, 63)}](${tracks[Options].uri})`);

        return message.channel.send({ embeds: [embed] });
    }
});
