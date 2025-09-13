import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Displays what\'s playing now'),

    category: 'Music',
    cooldown: 3,
    
    permissions: {
        user: [],
        bot: [],
        dj: false
    },

    player: {
        voice: false,
        dj: false,
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

            const track = player.queue.current;
            const position = player.position;
            const duration = track.length;

            // Create progress bar
            const progressBar = this.createProgressBar(position, duration);

            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({
                    name: 'Now Playing',
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle(track.title)
                .setURL(track.uri)
                .setDescription(`👨‍🎤 **${track.author || 'Unknown Artist'}**`)
                .addFields([
                    {
                        name: '⏱️ Progress',
                        value: track.isStream 
                            ? '🔴 Live Stream' 
                            : `${progressBar}\n\`${this.formatDuration(position)} / ${this.formatDuration(duration)}\``,
                        inline: false
                    },
                    {
                        name: '👤 Requested by',
                        value: track.requester?.toString() || 'Unknown',
                        inline: true
                    },
                    {
                        name: '🔊 Volume',
                        value: `${Math.round(player.volume * 100)}%`,
                        inline: true
                    },
                    {
                        name: '🔄 Loop',
                        value: this.getLoopStatus(player.loop),
                        inline: true
                    },
                    {
                        name: '📋 Queue',
                        value: `${player.queue.size} track${player.queue.size !== 1 ? 's' : ''}`,
                        inline: true
                    },
                    {
                        name: '⏸️ Status',
                        value: player.paused ? '⏸️ Paused' : '▶️ Playing',
                        inline: true
                    },
                    {
                        name: '🎵 Source',
                        value: track.sourceName || 'Unknown',
                        inline: true
                    }
                ])
                .setTimestamp();

            if (track.thumbnail) {
                embed.setThumbnail(track.thumbnail);
            }

            // Create control buttons
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('music_previous')
                        .setEmoji('⏮️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(!player.queue.previous),
                    new ButtonBuilder()
                        .setCustomId('music_pause')
                        .setEmoji(player.paused ? '▶️' : '⏸️')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('music_skip')
                        .setEmoji('⏭️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(player.queue.size === 0),
                    new ButtonBuilder()
                        .setCustomId('music_stop')
                        .setEmoji('⏹️')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('music_queue')
                        .setEmoji('📋')
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.reply({
                embeds: [embed],
                components: [row]
            });

        } catch (error) {
            console.error('NowPlaying command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while displaying the current track.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    createProgressBar(current, total, length = 20) {
        if (total === 0) return '▬'.repeat(length);
        
        const progress = Math.round((current / total) * length);
        const emptyProgress = length - progress;
        
        const progressText = '▬'.repeat(progress);
        const emptyProgressText = '▬'.repeat(emptyProgress);
        
        return `${progressText}🔘${emptyProgressText}`;
    },

    formatDuration(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor(ms / (1000 * 60 * 60));

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },

    getLoopStatus(loopMode) {
        switch (loopMode) {
            case 'track': return '🔂 Track';
            case 'queue': return '🔁 Queue';
            default: return '➡️ Off';
        }
    }
};