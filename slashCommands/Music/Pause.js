import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses the current song'),

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
            
            if (!player || !player.queue.current) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription('❌ There is no music playing in this server!')
                    ],
                    ephemeral: true
                });
            }

            if (player.paused) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ffaa00')
                            .setDescription('❌ The music is already paused!')
                    ],
                    ephemeral: true
                });
            }

            player.pause(true);

            const embed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setAuthor({
                    name: 'Music Paused',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`⏸️ Paused: **${player.queue.current.title}**`)
                .addFields([
                    {
                        name: '👤 Paused by',
                        value: interaction.user.toString(),
                        inline: true
                    },
                    {
                        name: '💡 Tip',
                        value: 'Use `/resume` to continue playing',
                        inline: true
                    }
                ])
                .setTimestamp();

            if (player.queue.current.thumbnail) {
                embed.setThumbnail(player.queue.current.thumbnail);
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Pause command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while pausing the music.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};