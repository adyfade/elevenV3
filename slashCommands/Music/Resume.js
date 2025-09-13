import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resumes the current song'),

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

            if (!player.paused) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ffaa00')
                            .setDescription('❌ The music is not paused!')
                    ],
                    ephemeral: true
                });
            }

            player.pause(false);

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({
                    name: 'Music Resumed',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`▶️ Resumed: **${player.queue.current.title}**`)
                .addFields([
                    {
                        name: '👤 Resumed by',
                        value: interaction.user.toString(),
                        inline: true
                    },
                    {
                        name: '🎵 Now Playing',
                        value: `[${player.queue.current.title}](${player.queue.current.uri})`,
                        inline: true
                    }
                ])
                .setTimestamp();

            if (player.queue.current.thumbnail) {
                embed.setThumbnail(player.queue.current.thumbnail);
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Resume command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while resuming the music.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};