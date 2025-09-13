import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Changes the player volume')
        .addIntegerOption(option =>
            option
                .setName('level')
                .setDescription('Volume level (0-100)')
                .setMinValue(0)
                .setMaxValue(100)
                .setRequired(false)
        ),

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

            const volume = interaction.options.getInteger('level');
            const currentVolume = Math.round(player.volume * 100);

            if (volume === null) {
                // Show current volume
                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setAuthor({
                        name: 'Volume Settings',
                        iconURL: client.user.displayAvatarURL()
                    })
                    .setDescription(`🔊 Current volume: **${currentVolume}%**`)
                    .addFields([
                        {
                            name: '💡 Usage',
                            value: 'Use `/volume <level>` to change the volume (0-100)',
                            inline: false
                        }
                    ])
                    .setTimestamp();

                return await interaction.reply({ embeds: [embed] });
            }

            player.setVolume(volume / 100);

            const volumeEmoji = this.getVolumeEmoji(volume);
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({
                    name: 'Volume Changed',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`${volumeEmoji} Volume set to **${volume}%**`)
                .addFields([
                    {
                        name: '📊 Previous Volume',
                        value: `${currentVolume}%`,
                        inline: true
                    },
                    {
                        name: '👤 Changed by',
                        value: interaction.user.toString(),
                        inline: true
                    }
                ])
                .setTimestamp();

            if (volume === 0) {
                embed.addFields([
                    {
                        name: '⚠️ Warning',
                        value: 'Volume is set to 0% (muted)',
                        inline: false
                    }
                ]);
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Volume command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while changing the volume.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    getVolumeEmoji(volume) {
        if (volume === 0) return '🔇';
        if (volume <= 30) return '🔈';
        if (volume <= 70) return '🔉';
        return '🔊';
    }
};