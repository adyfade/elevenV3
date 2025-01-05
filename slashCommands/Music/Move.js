const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("move")
        .setDescription("Moves the track to a position.")
        .addSubcommand(subcommand =>
            subcommand
                .setName('track')
                .setDescription('Moves a track to a new position in the queue.')
                .addIntegerOption(option => 
                    option.setName('track_number')
                        .setDescription('The track number to move')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('position')
                        .setDescription('The new position for the track')
                        .setRequired(true))
        ),

    async execute(interaction, client) {
        const color = '#3498db'; // Set this to your desired color
        const dispatcher = client.player.get(interaction.guild.id); // Assuming you're using a player manager for the guild

        const trackNumber = interaction.options.getInteger('track_number');
        const toPosition = interaction.options.getInteger('position');

        if (!dispatcher || !dispatcher.queue.size) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription('There is no active player or queue.')], ephemeral: true });
        }

        if (trackNumber <= 0 || trackNumber > dispatcher.queue.size) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription('You\'ve provided an invalid track position to move.')], ephemeral: true });
        }

        if (toPosition <= 0 || toPosition > dispatcher.queue.size) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription('You\'ve provided an invalid position to move the track.')], ephemeral: true });
        }

        if (trackNumber === toPosition) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`This track is already at the position \`[ ${toPosition} ]\`.`)], ephemeral: true });
        }

        const trackIndex = trackNumber - 1;
        const newIndex = toPosition - 1;

        // Assuming you have a utility method to move the array item
        const movedQueue = client.util.moveArray(dispatcher.queue, trackIndex, newIndex);

        dispatcher.queue.clear();
        dispatcher.queue.add(movedQueue);

        await client.util.update(dispatcher, client);

        return interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`Moved track number \`[ ${trackNumber} ]\` to \`[ ${toPosition} ]\` in the queue.`)] });
    },
};
