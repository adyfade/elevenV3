import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    name: 'playerStart',

    /**
     * Execute when a track starts playing
     * @param {import('../../index.js').default} client 
     * @param {import('kazagumo').KazagumoPlayer} player 
     * @param {import('kazagumo').KazagumoTrack} track 
     */
    async execute(client, player, track) {
        try {
            const channel = client.channels.cache.get(player.textId);
            if (!channel) return;

            // Create now playing embed
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({
                    name: 'Now Playing',
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle(track.title)
                .setURL(track.uri)
                .setDescription(`👨‍🎤 **${track.author || 'Unknown Artist'}**`)
                .addFields([
                    {
                        name: '⏱️ Duration',
                        value: track.isStream ? '🔴 Live Stream' : this.formatDuration(track.length),
                        inline: true
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
                        name: '🎵 Source',
                        value: track.sourceName || 'Unknown',
                        inline: true
                    }
                ])
                .setTimestamp();

            // Add thumbnail if available
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

            // Send the now playing message
            const message = await channel.send({
                embeds: [embed],
                components: [row]
            });

            // Store message for later updates
            player.data.set('nowPlayingMessage', message);

            // Auto-delete after track ends (with some buffer time)
            if (!track.isStream && track.length) {
                setTimeout(async () => {
                    try {
                        if (message && message.deletable) {
                            await message.delete();
                        }
                    } catch (error) {
                        // Ignore deletion errors
                    }
                }, track.length + 10000); // 10 second buffer
            }

        } catch (error) {
            console.error('PlayerStart event error:', error);
        }
    },

    /**
     * Format duration from milliseconds
     * @param {number} ms 
     * @returns {string}
     */
    formatDuration(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor(ms / (1000 * 60 * 60));

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },

    /**
     * Get loop status display
     * @param {string} loopMode 
     * @returns {string}
     */
    getLoopStatus(loopMode) {
        switch (loopMode) {
            case 'track': return '🔂 Track';
            case 'queue': return '🔁 Queue';
            default: return '➡️ Off';
        }
    }
};