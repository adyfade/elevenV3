module.exports = new Object({
    name: "nowplaying",
    description: "Shows the info related to the current playing track.",
    category: "Music",
    cooldown: 10,
    usage: '',
    aliases: ['np'],
    examples: [''],
    sub_commands: [],
    args: false,
    permissions: {
        isPremium: false,
        client: [],
        user: [],
        dev: false,
        voteRequired: false
    },
    player: { voice: true, active: true, dj: false, djPerm: null },

    /**
     * 
     * @param {import("../../Main")} client 
     * @param {import("discord.js").Message} message
     * @param {String[]} args
     * @param {String} prefix
     * @param {String} color
     * @param {import('kazagumo').KazagumoPlayer} dispatcher
     */

    async execute(client, message, args, prefix, color, dispatcher) {
        const duration = dispatcher.queue.current.length;
        const currentDuration = dispatcher.shoukaku.position;
        const track = dispatcher.queue.current;
        const parsedCurrentDuration = client.util.duration(currentDuration || 0);
        const parsedDuration = client.util.duration(duration);
        const part = Math.floor((currentDuration / duration) * 13);
        const percentage = currentDuration / duration;
        let field = [];
        field.push(
            {
                name: 'Duration:',
                value: `\`${parsedDuration}\``,
                inline: true,
            },
            {
                name: 'Track Author(s)',
                value: dispatcher.queue.current.author,
                inline: true,
            },
            
        );
        const embed = client.embed()
            .setTitle('Now Playing')
            .setColor(color)
            .setDescription(`[${dispatcher.queue.current.title}](${dispatcher.queue.current.uri})`)
            .setThumbnail(dispatcher.queue.current.thumbnail)
            .addFields(field)
            .setFooter({ text: `Requested by ${track.requester.tag}`, iconURL: track.requester.displayAvatarURL() })
        return message.reply({ embeds: [embed] });
    }
})