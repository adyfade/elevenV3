const db = require('../../Models/247');

module.exports = {
    name: "ignore",
    description: "Blacklist a channel to prevent the bot from sending messages there.",
    category: "Settings",
    usage: "[channel]",
    cooldown: 5,
    args: true,
    permissions: {
        client: [],
        user: ['Administrator', 'ManageGuild'],
    },
    async execute(client, message, args) {
        // Get the mentioned channel or use the provided ID
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        if (!channel) {
            return message.reply('Please mention a valid channel or provide a valid channel ID.');
        }

        // Fetch or create the guild data
        let data = await db.findOne({ _id: message.guildId });
        if (!data) {
            data = new db({ _id: message.guildId, blacklist: [] });
        }

        // Add or remove the channel from the blacklist
        if (data.blacklist.includes(channel.id)) {
            data.blacklist = data.blacklist.filter(ch => ch !== channel.id); // Remove from blacklist
            await data.save();
            return message.reply(`The bot is no longer ignoring <#${channel.id}>.`);
        } else {
            data.blacklist.push(channel.id); // Add to blacklist
            await data.save();
            return message.reply(`The bot will now ignore <#${channel.id}>.`);
        }
    }
};
