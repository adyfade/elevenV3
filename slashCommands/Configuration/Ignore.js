import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import Guild from '../../Models/Guild.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ignore')
        .setDescription('Manage which channels the bot ignores')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a channel to the ignore list')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel to ignore')
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a channel from the ignore list')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel to stop ignoring')
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all ignored channels')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear all ignored channels')
        ),

    category: 'Configuration',
    cooldown: 5,
    
    permissions: {
        user: ['ManageGuild'],
        bot: [],
        dj: false
    },

    player: {
        voice: false,
        dj: false,
        active: false,
        djPerm: null
    },

    async execute(interaction, client) {
        try {
            const subcommand = interaction.options.getSubcommand();
            
            let guildData = await Guild.findById(interaction.guild.id);
            if (!guildData) {
                guildData = new Guild({ _id: interaction.guild.id });
            }

            switch (subcommand) {
                case 'add':
                    await this.handleAdd(interaction, guildData);
                    break;
                case 'remove':
                    await this.handleRemove(interaction, guildData);
                    break;
                case 'list':
                    await this.handleList(interaction, guildData, client);
                    break;
                case 'clear':
                    await this.handleClear(interaction, guildData);
                    break;
            }

        } catch (error) {
            console.error('Ignore command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while managing ignored channels.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    async handleAdd(interaction, guildData) {
        const channel = interaction.options.getChannel('channel');
        
        if (guildData.ignoredChannels.includes(channel.id)) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ffaa00')
                        .setDescription(`❌ ${channel} is already being ignored!`)
                ],
                ephemeral: true
            });
        }

        guildData.ignoredChannels.push(channel.id);
        await guildData.save();

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setAuthor({
                name: 'Channel Ignored',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setDescription(`✅ Added ${channel} to the ignore list`)
            .addFields([
                {
                    name: '📝 Note',
                    value: 'The bot will no longer respond to commands in this channel',
                    inline: false
                }
            ])
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handleRemove(interaction, guildData) {
        const channel = interaction.options.getChannel('channel');
        
        if (!guildData.ignoredChannels.includes(channel.id)) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ffaa00')
                        .setDescription(`❌ ${channel} is not being ignored!`)
                ],
                ephemeral: true
            });
        }

        guildData.ignoredChannels = guildData.ignoredChannels.filter(id => id !== channel.id);
        await guildData.save();

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setAuthor({
                name: 'Channel Unignored',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setDescription(`✅ Removed ${channel} from the ignore list`)
            .addFields([
                {
                    name: '📝 Note',
                    value: 'The bot will now respond to commands in this channel',
                    inline: false
                }
            ])
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handleList(interaction, guildData, client) {
        if (guildData.ignoredChannels.length === 0) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#3498db')
                        .setDescription('📋 No channels are currently being ignored')
                ]
            });
        }

        const channelList = guildData.ignoredChannels
            .map(id => {
                const channel = client.channels.cache.get(id);
                return channel ? `${channel}` : `<#${id}> (Deleted)`;
            })
            .join('\n');

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({
                name: 'Ignored Channels',
                iconURL: client.user.displayAvatarURL()
            })
            .setDescription(channelList)
            .setFooter({
                text: `${guildData.ignoredChannels.length} channel${guildData.ignoredChannels.length !== 1 ? 's' : ''} ignored`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handleClear(interaction, guildData) {
        if (guildData.ignoredChannels.length === 0) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ffaa00')
                        .setDescription('❌ No channels are currently being ignored!')
                ],
                ephemeral: true
            });
        }

        const count = guildData.ignoredChannels.length;
        guildData.ignoredChannels = [];
        await guildData.save();

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setAuthor({
                name: 'Ignore List Cleared',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setDescription(`✅ Cleared ${count} channel${count !== 1 ? 's' : ''} from the ignore list`)
            .addFields([
                {
                    name: '📝 Note',
                    value: 'The bot will now respond to commands in all channels',
                    inline: false
                }
            ])
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};