const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pauses the current track."),

    /**
     * 
     * @param {import("../../../Main")} client 
     * @param {import("discord.js").Interaction} interaction
     * @param {import('kazagumo').KazagumoPlayer} dispatcher
     */

    async execute(interaction, client, dispatcher) {
        if (dispatcher.paused) {
            return await interaction.reply({
                content: `The song is already paused.`,
                ephemeral: true
            });
        } else {
            dispatcher.pause(true);
            await client.util.update(dispatcher, client);
            return await interaction.reply({
                content: `Paused the song.`,
                ephemeral: false
            });
        }
    }
};
