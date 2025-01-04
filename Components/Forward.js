module.exports = {
    name: "forward",
    description: "Forwards the track by a specified amount of seconds.",
    category: "Music",
    cooldown: 10,
    usage: "[seconds]",
    aliases: ["f"],
    examples: ["forward", "forward 30", "f", "f 15"],
    sub_commands: [],
    args: false,
    permissions: {
        isPremium: false,
        client: [],
        user: [],
        dev: false,
        voteRequired: false,
    },
    player: { voice: true, active: true, dj: true, djPerm: null },

    /**
     * @param {import("../../../Main")} client
     * @param {import("discord.js").Message} message
     * @param {String[]} args
     * @param {String} prefix
     * @param {String} color
     * @param {import('kazagumo').KazagumoPlayer} dispatcher
     */
    async execute(client, message, args, prefix, color, dispatcher) {
        // Check if the current track is seekable
        if (!dispatcher.queue.current.isSeekable) {
            return await client.util.msgReply(
                message,
                "Unable to forward this track.",
                color,
            );
        }

        // Check if the player is paused
        if (dispatcher.paused) {
            return await client.util.msgReply(
                message,
                "Unable to forward this track as the player is paused.",
                color,
            );
        }

        // Parse the forward time from arguments or default to 10 seconds
        let forwardTime = 10; // default forward time in seconds
        if (args[0]) {
            const parsedTime = parseInt(args[0], 10);
            if (isNaN(parsedTime) || parsedTime <= 0) {
                return await client.util.msgReply(
                    message,
                    "Please provide a valid number of seconds to forward.",
                    color,
                );
            }
            forwardTime = parsedTime;
        }

        // Calculate the new seek position in milliseconds
        const currentPosition = dispatcher.shoukaku.position;
        const trackLength = dispatcher.queue.current.length;
        const seekPosition = currentPosition + forwardTime * 1000;

        // Check if the new seek position exceeds the track length
        if (seekPosition >= trackLength) {
            return await client.util.msgReply(
                message,
                "Cannot forward any further in this track.",
                color,
            );
        }

        // Seek to the new position
        dispatcher.shoukaku.seekTo(seekPosition);

        // Send confirmation message
        return await client.util.msgReply(
            message,
            `Forwarded the track by \`${client.util.msToTime(forwardTime * 1000)}\`. Current position: \`${client.util.msToTime(seekPosition)} / ${client.util.msToTime(trackLength)}\`.`,
            color,
        );
    },
};
