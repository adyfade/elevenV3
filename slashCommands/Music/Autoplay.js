import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('autoplay')
        .setDescription('Toggle autoplay to keep music going after the queue ends'),

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

            // Toggle autoplay
            const newAutoplay = !player.data.get('autoplay');
            player.data.set('autoplay', newAutoplay);

            const embed = new EmbedBuilder()
                .setColor(newAutoplay ? '#00ff00' : '#ff0000')
                .setAuthor({
                    name: 'Autoplay Settings',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`🔄 Autoplay has been **${newAutoplay ? 'enabled' : 'disabled'}**`)
                .addFields([
                    {
                        name: '💡 Info',
                        value: newAutoplay 
                            ? 'The bot will automatically add similar tracks when the queue ends'
                            : 'The bot will stop playing when the queue ends',
                        inline: false
                    }
                ])
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Autoplay command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while toggling autoplay.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};