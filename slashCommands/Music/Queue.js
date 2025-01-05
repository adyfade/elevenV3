const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Shows the server song queue."),

    async execute(interaction, client) {
        // Check if the user is in a voice channel
        if (!interaction.member.voice.channel) {
            return await interaction.reply({ content: "You need to be in a voice channel to use this command!", ephemeral: true });
        }

        // Get the player
        const player = client.kazagumo.players.get(interaction.guildId);

        if (!player) {
            return await interaction.reply({ content: "There is no music playing in this server.", ephemeral: true });
        }

        if (!player.queue.length) {
            return await interaction.reply(`Now Playing - [${player.queue.current.title}](https://discord.gg/teamkronix)`);
        }

        const queuedSongs = player.queue.map((track, i) => `\`${i + 1}.\` [${track.title.length > 64 ? track.title.substring(0, 64) + '...' : track.title}](https://discord.gg/teamkronix) | (${track.isStream ? 'LIVE' : client.util.duration(track.length)}) | ${track.requester}\n`);
        const mapping = client.util.chunk(queuedSongs, 10);
        const pages = mapping.map((s) => s.join('\n'));
        let page = 0;

        if (queuedSongs.length <= 10) {
            const embed = new EmbedBuilder()
                .setColor(client.config.color)
                .setAuthor({ name: 'Queue', iconURL: client.user.displayAvatarURL(), url: client.config.links.support })
                .setDescription(`**Queued Songs**\n\n${pages[page]}`);

            return await interaction.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`**Queued Songs**\n\n${pages[page]}`)
                .setFooter({ text: `Page ${page + 1}/${pages.length}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('queue_first')
                    .setLabel('First')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('queue_prev')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('queue_page')
                    .setLabel(`${page + 1}/${pages.length}`)
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('queue_next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('queue_last')
                    .setLabel('Last')
                    .setStyle(ButtonStyle.Secondary)
            );

            const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

            const collector = message.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id,
                time: 60000 * 5,
                idle: 30e3,
            });

            collector.on('collect', async (i) => {
                if (!i.deferred) await i.deferUpdate();

                switch (i.customId) {
                    case 'queue_first':
                        page = 0;
                        break;
                    case 'queue_prev':
                        page = page > 0 ? --page : pages.length - 1;
                        break;
                    case 'queue_next':
                        page = page + 1 < pages.length ? ++page : 0;
                        break;
                    case 'queue_last':
                        page = pages.length - 1;
                        break;
                }

                row.components[0].setDisabled(page === 0);
                row.components[1].setDisabled(page === 0);
                row.components[2].setLabel(`${page + 1}/${pages.length}`);
                row.components[3].setDisabled(page === pages.length - 1);
                row.components[4].setDisabled(page === pages.length - 1);

                embed.setDescription(`**Queued Songs**\n\n${pages[page]}`)
                    .setFooter({ text: `Page ${page + 1} of ${pages.length}`, iconURL: interaction.user.displayAvatarURL() });

                await i.editReply({ embeds: [embed], components: [row] });
            });

            collector.on('end', async () => {
                row.components.forEach(button => button.setDisabled(true));
                await message.edit({ components: [row] });
            });
        }
    }
};