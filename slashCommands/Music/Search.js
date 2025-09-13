import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for songs and choose from the results before playing')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('Song name or search query')
                .setRequired(true)
        ),

    category: 'Music',
    cooldown: 5,
    
    permissions: {
        user: [],
        bot: ['Connect', 'Speak'],
        dj: false
    },

    player: {
        voice: true,
        dj: false,
        active: false,
        djPerm: null
    },

    async execute(interaction, client) {
        try {
            await interaction.deferReply();

            const query = interaction.options.getString('query');
            const member = interaction.member;
            const guild = interaction.guild;

            if (!member.voice?.channel) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription('❌ You need to be in a voice channel to search for music!')
                    ]
                });
            }

            const permissions = member.voice.channel.permissionsFor(guild.members.me);
            if (!permissions.has(['Connect', 'Speak'])) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription('❌ I need `Connect` and `Speak` permissions in your voice channel!')
                    ]
                });
            }

            let player = client.kazagumo.players.get(guild.id);
            
            if (!player) {
                player = await client.kazagumo.createPlayer({
                    guildId: guild.id,
                    textId: interaction.channel.id,
                    voiceId: member.voice.channel.id,
                    volume: 80,
                    deaf: true
                });
            }

            const searchResult = await player.search(query, { requester: interaction.user });

            if (!searchResult.tracks.length) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription(`❌ No results found for: \`${query}\``)
                    ]
                });
            }

            const tracks = searchResult.tracks.slice(0, 10);
            
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({
                    name: 'Search Results',
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle(`🔍 Results for: ${query}`)
                .setDescription(
                    tracks.map((track, index) => 
                        `\`${index + 1}.\` [${track.title}](${track.uri}) - \`${track.isStream ? '🔴 Live' : this.formatDuration(track.length)}\``
                    ).join('\n')
                )
                .setFooter({
                    text: 'Select a track from the dropdown menu below',
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`search_select_${interaction.user.id}`)
                .setPlaceholder('Choose a track to play...')
                .addOptions(
                    tracks.map((track, index) => ({
                        label: track.title.length > 100 ? `${track.title.substring(0, 97)}...` : track.title,
                        description: `${track.author || 'Unknown'} - ${track.isStream ? '🔴 Live' : this.formatDuration(track.length)}`,
                        value: `${index}`
                    }))
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const response = await interaction.editReply({
                embeds: [embed],
                components: [row]
            });

            const collector = response.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id && i.customId === `search_select_${interaction.user.id}`,
                time: 60000
            });

            collector.on('collect', async (i) => {
                try {
                    const selectedIndex = parseInt(i.values[0]);
                    const selectedTrack = tracks[selectedIndex];

                    player.queue.add(selectedTrack);

                    if (!player.playing && !player.paused) {
                        await player.play();
                    }

                    const playEmbed = new EmbedBuilder()
                        .setColor('#00ff00')
                        .setAuthor({
                            name: 'Track Added',
                            iconURL: client.user.displayAvatarURL()
                        })
                        .setTitle(selectedTrack.title)
                        .setURL(selectedTrack.uri)
                        .setDescription(`👨‍🎤 **${selectedTrack.author || 'Unknown'}**`)
                        .addFields([
                            {
                                name: '⏱️ Duration',
                                value: selectedTrack.isStream ? '🔴 Live' : this.formatDuration(selectedTrack.length),
                                inline: true
                            },
                            {
                                name: '📍 Position',
                                value: `${player.queue.size}`,
                                inline: true
                            },
                            {
                                name: '👤 Requested by',
                                value: interaction.user.toString(),
                                inline: true
                            }
                        ])
                        .setTimestamp();

                    if (selectedTrack.thumbnail) {
                        playEmbed.setThumbnail(selectedTrack.thumbnail);
                    }

                    await i.update({
                        embeds: [playEmbed],
                        components: []
                    });

                } catch (error) {
                    console.error('Search selection error:', error);
                    await i.reply({
                        content: '❌ An error occurred while adding the track.',
                        ephemeral: true
                    });
                }
            });

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    try {
                        const timeoutEmbed = new EmbedBuilder()
                            .setColor('#ffaa00')
                            .setDescription('⏰ Search timed out. Please try again.');

                        await interaction.editReply({
                            embeds: [timeoutEmbed],
                            components: []
                        });
                    } catch (error) {
                        // Ignore errors when editing expired interactions
                    }
                }
            });

        } catch (error) {
            console.error('Search command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while searching for tracks.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    formatDuration(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor(ms / (1000 * 60 * 60));

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
};