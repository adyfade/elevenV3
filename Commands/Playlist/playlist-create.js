const { EmbedBuilder } = require("discord.js");
const db = require("../../Models/Playlist.js");

module.exports = {
    name: "playlist-create",
    aliases: ["pl-create"],
    category: "Playlist",
    description: "Creates a new playlist.",
    args: true,
    usage: "<playlist name>",
    permissions: {
        isPremium: false,
        client: [],
        user: [],
        dev: false,
        voteRequired: false
    },
    execute: async (client, message, args, prefix, color) => {
        const Name = args[0];
        if (Name.length > 10) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setDescription(
                            "Playlist Name Cant Be Greater Than `10` Charecters",
                        ),
                ],
            });
        }
        let data = await db.find({
            UserId: message.author.id,
            PlaylistName: Name,
        });

        if (data.length > 0) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setDescription(
                            `This playlist already Exists! delete it using: \`${prefix}\`delete \`${Name}\``,
                        ),
                ],
            });
        }
        let userData = db.find({
            UserId: message.author.id,
        });
        if (userData.length >= 10) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setDescription(`You Can Only Create \`10\` Playlist`),
                ],
            });
        }

        const newData = new db({
            UserName: message.author.tag,
            UserId: message.author.id,
            PlaylistName: Name,
            CreatedOn: Math.round(Date.now() / 1000),
        });
        await newData.save();
        const embed = new EmbedBuilder()
            .setDescription(
                `Successfully created a playlist for you **${Name}**`,
            )
            .setColor(color);
        return message.channel.send({ embeds: [embed] });
    },
};
