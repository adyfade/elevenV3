module.exports = new Object({
    name: "say",
    description: "Says something.",
    category: "Misc",
    usage: "",
    cooldown: 10,
    usage: '',
    aliases: [],
    examples: [''],
    sub_commands: [],
    args: false,
    permissions: {
        client: [],
        user: ['ManageMessages'],
        dev: false,
        voteRequired: false
    },
    player: { voice: false, active: false, dj: false, djPerm: null },
    /**
     * 
     * @param {import("../../../Main")} client 
     * @param {import("discord.js").Message} message
     * @param {String[]} args
     * @param {String} prefix
     * @param {String} color
     */
    async execute(client, message, args, prefix, color) {
        if (!args[0]) return await client.util.msgReply(message, 'You need to specify something to say.', color);

        const text = args.join(' ');

     
        if (text.includes('@everyone') || text.includes('@here')) {
            return await client.util.msgReply(message, 'You are not allowed to mention `@everyone` or `@here`.', color);
        }

    
        const linkPattern = /https?:\/\/[^\s]+|discord\.gg\/[^\s]+/i;
        if (linkPattern.test(text)) {
            return await client.util.msgReply(message, 'You are not allowed to send links or Discord invite links.', color);
        }

        return await message.channel.send(text);
    }
});
