import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Removes a song from the queue')
        .addIntegerOption(option =>
            option
                .setName('position')
                .setDescription('Position of the track to remove')
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
            
            if (!player) {
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

            if (player.queue.size === 0) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription('❌ The queue is empty!')
                    ],
                    ephemeral: true
                });
            }

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

            const removedTrack = player.queue[position - 1];
            player.queue.remove(position - 1);

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({
                    name: 'Track Removed',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`🗑️ Removed from position **${position}**`)
                .addFields([
                    {
                        name: '🎵 Track',
                        value: `[${removedTrack.title}](${removedTrack.uri})`,
                        inline: false
                    },
                    {
                        name: '👨‍🎤 Artist',
                        value: removedTrack.author || 'Unknown',
                        inline: true
                    },
                    {
                        name: '⏱️ Duration',
                        value: removedTrack.isStream ? '🔴 Live' : this.formatDuration(removedTrack.length),
                        inline: true
                    },
                    {
                        name: '👤 Removed by',
                        value: interaction.user.toString(),
                        inline: true
                    },
                    {
                        name: '📋 Queue Size',
                        value: `${player.queue.size} track${player.queue.size !== 1 ? 's' : ''} remaining`,
                        inline: false
                    }
                ])
                .setTimestamp();

            if (removedTrack.thumbnail) {
                embed.setThumbnail(removedTrack.thumbnail);
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Remove command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while removing the track.');

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