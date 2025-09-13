export default {
    name: 'playerEnd',

    /**
     * Execute when a track ends
     * @param {import('../../index.js').default} client 
     * @param {import('kazagumo').KazagumoPlayer} player 
     * @param {import('kazagumo').KazagumoTrack} track 
     */
    async execute(client, player, track) {
        try {
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

            // Log track end for debugging
            console.log(`🎵 Track ended: ${track.title} in guild ${player.guildId}`);

        } catch (error) {
            console.error('PlayerEnd event error:', error);
        }
    }
};