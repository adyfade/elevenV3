module.exports = new Object({
    name: "rewind",
    description: "Rewind the track by given positions.",
    category: "Music",
    cooldown: 10,
    usage: "[position1 position2 ...]",
    aliases: ['backward'],
    examples: ["rewind 3 5", "backward 2 10"],
    sub_commands: [],
    args: false,
    permissions: {
        isPremium: false,
        client: [],
        user: [],
        dev: false,
        voteRequired: false
    },
    player: { voice: true, active: true, dj: true, djPerm: null },

    /**
     * 
     * @param {import("../../../Main")} client 
     * @param {import("discord.js").Message} message
     * @param {String[]} args
     * @param {String} prefix
     * @param {String} color
     * @param {import('kazagumo').KazagumoPlayer} dispatcher
     */
    async execute(client, message, args, prefix, color, dispatcher) {
        if (!dispatcher.queue.current.isSeekable) 
            return await client.util.msgReply(message, 'Unable to rewind this track.', color);

        let totalRewind = 0;

        if (args.length > 0) {
            for (const arg of args) {
                const position = parseInt(arg) * 1000;
                if (isNaN(position) || position <= 0) {
                    return await client.util.msgReply(message, `Invalid time value provided: ${arg}.`, color);
                }
                totalRewind += position;
            }
        }

        const currentPosition = dispatcher.shoukaku.position;
        const seekPosition = currentPosition - totalRewind;

        if (seekPosition < 0) 
            return await client.util.msgReply(message, `Cannot rewind further than the start of the track.`, color);

        dispatcher.shoukaku.seekTo(seekPosition);

        return await client.util.msgReply(message, `Rewound by \`[ ${client.util.msToTime(totalRewind)} ]\` to \`[ ${client.util.msToTime(dispatcher.shoukaku.position)} / ${client.util.msToTime(dispatcher.queue.current.length)} ]\``, color);
    }
});
