const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription("Disconnect the bot from the voice channel."),

    async execute(interaction, client) {
        const color = '#3498db'; // Set to desired color
        const dispatcher = client.player.get(interaction.guild.id); // Assuming you're using a player manager for the guild

        if (dispatcher) {
            dispatcher.destroy();
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription('Player is now destroyed.')] });
        } else {
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription('There is no player.')], ephemeral: true });
        }
    }
};

