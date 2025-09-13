import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('skipto')
        .setDescription('Skips to a specific track in the queue')
        .addIntegerOption(option =>
            option
                .setName('position')
                .setDescription('Position of the track to skip to')
                .setMinValue(1)
                .setRequired(true)
        ),

    category: 'Music',
    cooldown: 3,
    
    permissions: {
        user: [],
        bot: [],
        dj: true
    },

    player: {
        voice: true,
        dj: true,
        active: true,
        djPerm: null
    },

    async execute(interaction, client) {
        try {
            const player = client.kazagumo.players.get(interaction.guild.id);
            
            if (!player || !player.queue.current) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription('❌ There is no music playing in this server!')
                    ],
                    ephemeral: true
                });
            }

            const position = interaction.options.getInteger('position');

            if (position > player.queue.size) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription(`❌ Invalid position! The queue only has ${player.queue.size} tracks.`)
                    ],
                    ephemeral: true
                });
            }

            const targetTrack = player.queue[position - 1];
            const skippedTracks = position - 1;

            // Remove tracks before the target position
            for (let i = 0; i < skippedTracks; i++) {
                player.queue.remove(0);
            }

            await player.skip();

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({
                    name: 'Skipped to Track',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`⏭️ Skipped to position **${position}**`)
                .addFields([
                    {
                        name: '🎵 Now Playing',
                        value: `[${targetTrack.title}](${targetTrack.uri})`,
                        inline: false
                    },
                    {
                        name: '👨‍🎤 Artist',
                        value: targetTrack.author || 'Unknown',
                        inline: true
                    },
                    {
                        name: '⏱️ Duration',
                        value: targetTrack.isStream ? '🔴 Live' : this.formatDuration(targetTrack.length),
                        inline: true
                    },
                    {
                        name: '🗑️ Skipped Tracks',
                        value: `${skippedTracks} track${skippedTracks !== 1 ? 's' : ''}`,
                        inline: true
                    },
                    {
                        name: '👤 Requested by',
                        value: targetTrack.requester?.toString() || 'Unknown',
                        inline: true
                    },
                    {
                        name: '📋 Queue Remaining',
                        value: `${player.queue.size} track${player.queue.size !== 1 ? 's' : ''}`,
                        inline: true
                    }
                ])
                .setTimestamp();

            if (targetTrack.thumbnail) {
                embed.setThumbnail(targetTrack.thumbnail);
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('SkipTo command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while skipping to the track.');

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