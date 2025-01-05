const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skips the current track or the provided number of tracks.")
        .addIntegerOption(option => 
            option.setName("position")
                  .setDescription("The track number to skip to")
                  .setRequired(false)
        ),

    /**
     * 
     * @param {import("discord.js").CommandInteraction} interaction 
     * @param {import("../../../Main")} client
     */

    async execute(interaction, client) {
        const dispatcher = client.dispatcher.players.get(interaction.guild.id);
        const color = client.config.EmbedColor;
        const trackNumber = interaction.options.getInteger("position");

        if (!dispatcher) {
            return interaction.reply({
                embeds: [
                    client.embed().setColor(color).setDescription("There is no active player in this guild."),
                ],
                ephemeral: true,
            });
        }

        const title = dispatcher.queue.current.title;

        if (trackNumber) {
            if (trackNumber <= 0 || trackNumber > dispatcher.queue.size) {
                return interaction.reply({
                    embeds: [
                        client.embed().setColor(client.config.redColor).setDescription("You've provided an invalid track/song number to skip to."),
                    ],
                    ephemeral: true,
                });
            }
            dispatcher.queue.splice(0, trackNumber - 1);
            dispatcher.shoukaku.stopTrack();
            await client.util.update(dispatcher, client);
            return interaction.reply({
                embeds: [
                    client.embed().setColor(color).setDescription(`**Skipped to track number \`[ ${trackNumber} ]\` in the queue.**`),
                ],
            });
        }

        dispatcher.skip();
        await client.util.update(dispatcher, client);
        return interaction.reply({
            embeds: [
                client.embed().setColor(color).setDescription(`Skipped \`${title}\``),
            ],
        });
    },
};
