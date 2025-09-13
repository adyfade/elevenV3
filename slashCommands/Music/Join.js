import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Joins your voice channel'),

    category: 'Music',
    cooldown: 3,
    
    permissions: {
        user: [],
        bot: ['Connect', 'Speak'],
        dj: false
    },

    player: {
        voice: true,
        dj: false,
        active: false,
        djPerm: null
    },

    async execute(interaction, client) {
        try {
            const member = interaction.member;
            const guild = interaction.guild;

            if (!member.voice?.channel) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription('❌ You need to be in a voice channel!')
                    ],
                    ephemeral: true
                });
            }

            const permissions = member.voice.channel.permissionsFor(guild.members.me);
            if (!permissions.has(['Connect', 'Speak'])) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription('❌ I need `Connect` and `Speak` permissions in your voice channel!')
                    ],
                    ephemeral: true
                });
            }

            let player = client.kazagumo.players.get(guild.id);
            
            if (player && player.voiceId === member.voice.channel.id) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ffaa00')
                            .setDescription(`❌ I'm already connected to ${member.voice.channel}!`)
                    ],
                    ephemeral: true
                });
            }

            if (player && player.voiceId !== member.voice.channel.id) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription(`❌ I'm already connected to <#${player.voiceId}>!`)
                    ],
                    ephemeral: true
                });
            }

            player = await client.kazagumo.createPlayer({
                guildId: guild.id,
                textId: interaction.channel.id,
                voiceId: member.voice.channel.id,
                volume: 80,
                deaf: true
            });

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({
                    name: 'Voice Channel',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`🔗 Successfully joined ${member.voice.channel}`)
                .addFields([
                    {
                        name: '🎵 Ready to play',
                        value: 'Use `/play` to start playing music!',
                        inline: false
                    }
                ])
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Join command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while joining the voice channel.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};