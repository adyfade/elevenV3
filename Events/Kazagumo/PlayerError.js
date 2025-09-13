import { EmbedBuilder } from 'discord.js';

export default {
    name: 'playerException',

    /**
     * Execute when a player encounters an error
     * @param {import('../../index.js').default} client 
     * @param {import('kazagumo').KazagumoPlayer} player 
     * @param {Object} error 
     */
    async execute(client, player, error) {
        try {
            console.error(`🚨 Player error in guild ${player.guildId}:`, error);

            const channel = client.channels.cache.get(player.textId);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({
                    name: 'Player Error',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription('❌ An error occurred while playing music')
                .addFields([
                    {
                        name: '🔍 Error Details',
                        value: `\`\`\`${error.message || 'Unknown error'}\`\`\``,
                        inline: false
                    },
                    {
                        name: '🛠️ What to do?',
                        value: '• Try playing a different track\n• Check if the source is available\n• Use `/leave` and `/join` to reconnect',
                        inline: false
                    }
                ])
                .setTimestamp();

            await channel.send({ embeds: [embed] });

            // Skip to next track if available
            if (player.queue.size > 0) {
                setTimeout(async () => {
                    try {
                        await player.skip();
                    } catch (skipError) {
                        console.error('Error skipping after player error:', skipError);
                    }
                }, 2000);
            }

        } catch (handlerError) {
            console.error('PlayerError event handler error:', handlerError);
        }
    }
};