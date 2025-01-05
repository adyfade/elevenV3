const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("forward")
        .setDescription("Forwards the track to the given position.")
        .addIntegerOption(option => 
            option.setName("position")
            .setDescription("The position (in seconds) to forward the track.")
            .setRequired(false)
        ),

    /**
     * 
     * @param {import("../../../Main")} client
     * @param {import("discord.js").Interaction} interaction
     * @param {import('kazagumo').KazagumoPlayer} dispatcher
     */

    async execute(interaction, client, dispatcher) {
        if (!dispatcher.queue.current.isSeekable) {
            return await interaction.reply({
                content: "Unable to forward this track.",
                ephemeral: true
            });
        }

        // Get the position in seconds from the interaction (slash command input)
        let position = interaction.options.getInteger("position") || 10; // Default to 10 seconds if no argument is provided
        position = position * 1000; // Convert to milliseconds

        let seekPosition = dispatcher.shoukaku.position + position;
        if (seekPosition >= dispatcher.queue.current.length) {
            return await interaction.reply({
                content: "Cannot forward any further in this track.",
                ephemeral: true
            });
        }

        dispatcher.shoukaku.seekTo(seekPosition);

        await interaction.reply({
            content: `Forwarded \`[ ${client.util.msToTime(position)} ]\` to \`[ ${client.util.msToTime(dispatcher.shoukaku.position)} / ${client.util.msToTime(dispatcher.queue.current.length)} ]\`.`,
            ephemeral: false
        });
    },
};
