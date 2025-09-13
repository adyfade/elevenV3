import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Loops track, queue, or disables looping')
        .addStringOption(option =>
            option
                .setName('mode')
                .setDescription('Loop mode to set')
                .setRequired(false)
                .addChoices(
                    { name: 'Track', value: 'track' },
                    { name: 'Queue', value: 'queue' },
                    { name: 'Off', value: 'off' }
                )
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

            const mode = interaction.options.getString('mode');
            let newMode;

            if (!mode) {
                // Cycle through modes
                switch (player.loop) {
                    case 'none':
                        newMode = 'track';
                        break;
                    case 'track':
                        newMode = 'queue';
                        break;
                    case 'queue':
                        newMode = 'none';
                        break;
                    default:
                        newMode = 'track';
                }
            } else {
                newMode = mode === 'off' ? 'none' : mode;
            }

            player.setLoop(newMode);

            const loopEmojis = {
                'none': '➡️',
                'track': '🔂',
                'queue': '🔁'
            };

            const loopNames = {
                'none': 'Off',
                'track': 'Track',
                'queue': 'Queue'
            };

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({
                    name: 'Loop Settings',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`${loopEmojis[newMode]} Loop mode set to **${loopNames[newMode]}**`)
                .addFields([
                    {
                        name: '💡 Info',
                        value: this.getLoopDescription(newMode),
                        inline: false
                    }
                ])
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Loop command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while setting loop mode.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    getLoopDescription(mode) {
        switch (mode) {
            case 'track':
                return 'The current track will repeat indefinitely';
            case 'queue':
                return 'The entire queue will repeat when it reaches the end';
            case 'none':
                return 'No looping - tracks will play once';
            default:
                return 'Unknown loop mode';
        }
    }
};