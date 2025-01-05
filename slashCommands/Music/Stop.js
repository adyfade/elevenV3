const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stops the song and clears the queue."),

    /**
     * 
     * @param {import("discord.js").CommandInteraction} interaction 
     * @param {import("../../../Main")} client
     */

    async execute(interaction, client) {
        const dispatcher = client.dispatcher.players.get(interaction.guild.id);
        const color = client.config.EmbedColor;

        if (!dispatcher) {
            return interaction.reply({
                embeds: [
                    client.embed().setColor(color).setDescription("There is no active player in this guild."),
                ],
                ephemeral: true,
            });
        }

        dispatcher.queue.clear();
        dispatcher.shoukaku.stopTrack();
        await client.util.update(dispatcher, client);

        return interaction.reply({
            embeds: [
                client.embed().setColor(color).setDescription("Stopped the music and cleared the queue."),
            ],
        });
    },
};
