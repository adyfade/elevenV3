import { EmbedBuilder } from 'discord.js';

export default {
    name: 'playerEmpty',

    /**
     * Execute when player queue becomes empty
     * @param {import('../../index.js').default} client 
     * @param {import('kazagumo').KazagumoPlayer} player 
     */
    async execute(client, player) {
        try {
            const channel = client.channels.cache.get(player.textId);
            if (!channel) return;

            // Clean up now playing message
            const nowPlayingMessage = player.data.get('nowPlayingMessage');
            if (nowPlayingMessage && nowPlayingMessage.deletable) {
                try {
                    await nowPlayingMessage.delete();
                } catch (error) {
                    // Ignore deletion errors
                }
                player.data.delete('nowPlayingMessage');
            }

            // Send queue empty message
            const embed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setAuthor({
                    name: 'Queue Finished',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription('🎵 The music queue has ended. Use `/play` to add more tracks!')
                .addFields([
                    {
                        name: '💡 Tip',
                        value: 'You can use `/play` with a playlist URL to add multiple tracks at once!',
                        inline: false
                    }
                ])
                .setTimestamp();

            const message = await channel.send({ embeds: [embed] });

            // Auto-delete after 30 seconds
            setTimeout(async () => {
                try {
                    if (message && message.deletable) {
                        await message.delete();
                    }
                } catch (error) {
                    // Ignore deletion errors
                }
            }, 30000);

            // Disconnect after 5 minutes of inactivity
            setTimeout(() => {
                if (player && player.queue.size === 0 && !player.playing) {
                    player.destroy();
                }
            }, 300000); // 5 minutes

        } catch (error) {
            console.error('PlayerEmpty event error:', error);
        }
    }
};