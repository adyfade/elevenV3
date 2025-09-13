import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leaves the voice channel'),

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
        active: false,
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
                            .setDescription('❌ I am not connected to any voice channel!')
                    ],
                    ephemeral: true
                });
            }

            const voiceChannel = client.channels.cache.get(player.voiceId);
            
            player.destroy();

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({
                    name: 'Voice Channel',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`👋 Left ${voiceChannel || 'the voice channel'}`)
                .addFields([
                    {
                        name: '🗑️ Cleanup',
                        value: 'Queue cleared and player destroyed',
                        inline: false
                    }
                ])
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Leave command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while leaving the voice channel.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};