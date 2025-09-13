import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffles the current queue'),

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

            if (player.queue.size < 2) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ffaa00')
                            .setDescription('❌ Need at least 2 tracks in the queue to shuffle!')
                    ],
                    ephemeral: true
                });
            }

            const queueSize = player.queue.size;
            player.queue.shuffle();

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({
                    name: 'Queue Shuffled',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`🔀 Successfully shuffled **${queueSize}** track${queueSize !== 1 ? 's' : ''}`)
                .addFields([
                    {
                        name: '👤 Shuffled by',
                        value: interaction.user.toString(),
                        inline: true
                    },
                    {
                        name: '🎵 Next Track',
                        value: player.queue[0] ? `[${player.queue[0].title}](${player.queue[0].uri})` : 'None',
                        inline: true
                    }
                ])
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Shuffle command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while shuffling the queue.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};