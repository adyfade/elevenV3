import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('clearqueue')
        .setDescription('Clears the current player queue'),

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

            const queueSize = player.queue.size;

            if (queueSize === 0) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ffaa00')
                            .setDescription('❌ The queue is already empty!')
                    ],
                    ephemeral: true
                });
            }

            player.queue.clear();

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({
                    name: 'Queue Cleared',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`🗑️ Successfully cleared **${queueSize}** track${queueSize !== 1 ? 's' : ''} from the queue`)
                .addFields([
                    {
                        name: '👤 Cleared by',
                        value: interaction.user.toString(),
                        inline: true
                    },
                    {
                        name: '🎵 Current Track',
                        value: player.queue.current ? `[${player.queue.current.title}](${player.queue.current.uri})` : 'None',
                        inline: true
                    }
                ])
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('ClearQueue command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while clearing the queue.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};