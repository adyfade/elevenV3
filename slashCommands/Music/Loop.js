const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Toggle track or queue loop.")
        .addStringOption(option =>
            option.setName("mode")
                .setDescription("The mode for looping: track, queue, or off.")
                .setRequired(true)
                .addChoices(
                    { name: "track", value: "track" },
                    { name: "queue", value: "queue" },
                    { name: "off", value: "off" }
                )
        ),

    /**
     * 
     * @param {import("../../../Main")} client 
     * @param {import("discord.js").Interaction} interaction
     * @param {import('kazagumo').KazagumoPlayer} dispatcher
     */

    async execute(interaction, client, dispatcher) {
        const enable = ['enabled', 'activated'];
        const disable = ['disabled', 'deactivated'];

        // Get the mode from the slash command input
        const mode = interaction.options.getString("mode");

        if (mode === 'track') {
            if (dispatcher.loop !== 'track') {
                dispatcher.setLoop('track');
                await client.util.update(dispatcher, client);
                return await interaction.reply({
                    content: `Looping the current song **${enable[Math.floor(Math.random() * enable.length)]}**.`,
                    ephemeral: false
                });
            } else {
                dispatcher.setLoop('none');
                await client.util.update(dispatcher, client);
                return await interaction.reply({
                    content: `Looping the current song **${disable[Math.floor(Math.random() * disable.length)]}**.`,
                    ephemeral: false
                });
            }
        } else if (mode === 'queue') {
            if (dispatcher.loop !== 'queue') {
                dispatcher.setLoop('queue');
                await client.util.update(dispatcher, client);
                return await interaction.reply({
                    content: `Looping the queue **${enable[Math.floor(Math.random() * enable.length)]}**.`,
                    ephemeral: false
                });
            } else {
                dispatcher.setLoop('none');
                await client.util.update(dispatcher, client);
                return await interaction.reply({
                    content: `Looping the queue **${disable[Math.floor(Math.random() * disable.length)]}**.`,
                    ephemeral: false
                });
            }
        } else if (mode === 'off') {
            dispatcher.setLoop('none');
            await client.util.update(dispatcher, client);
            return await interaction.reply({
                content: `Looping is now **${disable[Math.floor(Math.random() * disable.length)]}**.`,
                ephemeral: false
            });
        } else {
            return await interaction.reply({
                content: "Please provide a valid sub-command.",
                ephemeral: true
            });
        }
    }
};
