export default {
    name: 'playerDestroy',

    /**
     * Execute when a player is destroyed
     * @param {import('../../index.js').default} client 
     * @param {import('kazagumo').KazagumoPlayer} player 
     */
    async execute(client, player) {
        try {
            // Clean up now playing message
            const nowPlayingMessage = player.data.get('nowPlayingMessage');
            if (nowPlayingMessage && nowPlayingMessage.deletable) {
                try {
                    await nowPlayingMessage.delete();
                } catch (error) {
                    // Ignore deletion errors
                }
            }

            // Clear player data
            player.data.clear();

            console.log(`🗑️ Player destroyed for guild ${player.guildId}`);

        } catch (error) {
            console.error('PlayerDestroy event error:', error);
        }
    }
};