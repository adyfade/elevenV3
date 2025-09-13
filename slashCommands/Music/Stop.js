import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the music and clear the queue'),

    category: 'Music',
    cooldown: 5,
    
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

    /**
     * Execute the stop command
     * @param {import('discord.js').ChatInputCommandInteraction} interaction 
     * @param {import('../../index.js').default} client 
     */
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

            const currentTrack = player.queue.current;
            const queueSize = player.queue.size;

            // Stop the player and clear queue
            player.queue.clear();
            await player.stop();

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({
                    name: 'Music Stopped',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription('⏹️ Music has been stopped and queue cleared')
                .setTimestamp();

            if (currentTrack) {
                embed.addFields([
                    {
                        name: '🎵 Last Playing',
                        value: `[${currentTrack.title}](${currentTrack.uri})`,
                        inline: false
                    },
                    {
                        name: '📋 Queue Cleared',
                        value: `${queueSize} track${queueSize !== 1 ? 's' : ''} removed`,
                        inline: true
                    },
                    {
                        name: '👤 Stopped by',
                        value: interaction.user.toString(),
                        inline: true
                    }
                ]);
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Stop command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while trying to stop the music.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};