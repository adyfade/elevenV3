const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clears filter/queue."),

    async execute(interaction, client) {
        const color = '#3498db';  // Set this to whatever color you want to use.
        const dispatcher = client.player.get(interaction.guild.id); // Assuming you're using a player manager that attaches to the guild

        const but = new ButtonBuilder()
            .setCustomId('cqueue')
            .setLabel('Queue')
            .setStyle(ButtonStyle.Primary);

        const but2 = new ButtonBuilder()
            .setCustomId('cfilter')
            .setLabel('Filter')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(but, but2);

        const embed = new EmbedBuilder()
            .setColor(color)
            .setDescription('Which one do you want to clear?');

        const m = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        const collector = m.createMessageComponentCollector({
            filter: (b) => b.user.id === interaction.user.id,
            max: 1,
            time: 60000,
            idle: 30000
        });

        collector.on('end', async () => {
            await m.edit({ components: [new ActionRowBuilder().addComponents(but.setDisabled(true), but2.setDisabled(true))] }).catch(() => { });
        });

        collector.on('collect', async (b) => {
            if (b.customId === 'cqueue') {
                await b.deferUpdate().catch(() => { });

                if (!dispatcher || !dispatcher.queue) {
                    const embedQueue = new EmbedBuilder().setColor(color).setDescription('There Is Nothing In The Queue');
                    return interaction.followUp({ embeds: [embedQueue], ephemeral: true });
                }

                dispatcher.queue.clear();
                await client.util.update(dispatcher, client);
                await m.edit({ embeds: null, components: [new ActionRowBuilder().addComponents(but.setDisabled(true), but2.setDisabled(true))] });
                return interaction.followUp({ embeds: [new EmbedBuilder().setDescription('Cleared the Queue.').setColor(color)] });
            }

            if (b.customId === 'cfilter') {
                await b.deferUpdate().catch(() => { });

                await dispatcher.clearfilter();
                await client.util.update(dispatcher, client);
                await m.edit({ embeds: null, components: [new ActionRowBuilder().addComponents(but.setDisabled(true), but2.setDisabled(true))] });
                return interaction.followUp({ embeds: [new EmbedBuilder().setDescription('Cleared the Filter.').setColor(color)] });
            }
        });
    }
};
