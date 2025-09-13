import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all available commands')
        .addStringOption(option =>
            option
                .setName('command')
                .setDescription('Get detailed help for a specific command')
                .setRequired(false)
                .setAutocomplete(true)
        ),

    category: 'General',
    cooldown: 5,
    
    permissions: {
        user: [],
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
            const commandName = interaction.options.getString('command');

            if (commandName) {
                return await this.showCommandHelp(interaction, client, commandName);
            }

            const categories = this.getCommandCategories(client);
            
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({
                    name: `${client.user.username} Help`,
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle('📚 Command Categories')
                .setDescription('Select a category from the dropdown menu below to view commands.')
                .addFields([
                    {
                        name: '🎵 Music Commands',
                        value: `${categories.Music?.length || 0} commands`,
                        inline: true
                    },
                    {
                        name: '⚙️ General Commands',
                        value: `${categories.General?.length || 0} commands`,
                        inline: true
                    },
                    {
                        name: '🔧 Configuration',
                        value: `${categories.Configuration?.length || 0} commands`,
                        inline: true
                    }
                ])
                .setFooter({
                    text: `Total: ${client.slashCommands.size} commands`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`help_category_${interaction.user.id}`)
                .setPlaceholder('Choose a category...')
                .addOptions([
                    {
                        label: 'Music Commands',
                        description: 'Play, control, and manage music',
                        value: 'Music',
                        emoji: '🎵'
                    },
                    {
                        label: 'General Commands',
                        description: 'Bot information and utilities',
                        value: 'General',
                        emoji: '⚙️'
                    },
                    {
                        label: 'Configuration',
                        description: 'Server settings and preferences',
                        value: 'Configuration',
                        emoji: '🔧'
                    }
                ]);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const response = await interaction.reply({
                embeds: [embed],
                components: [row],
                fetchReply: true
            });

            const collector = response.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id && i.customId === `help_category_${interaction.user.id}`,
                time: 300000
            });

            collector.on('collect', async (i) => {
                const category = i.values[0];
                const commands = categories[category] || [];

                const categoryEmbed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setAuthor({
                        name: `${client.user.username} Help`,
                        iconURL: client.user.displayAvatarURL()
                    })
                    .setTitle(`${this.getCategoryEmoji(category)} ${category} Commands`)
                    .setDescription(
                        commands.length > 0 
                            ? commands.map(cmd => `\`/${cmd.data.name}\` - ${cmd.data.description}`).join('\n')
                            : 'No commands in this category.'
                    )
                    .setFooter({
                        text: `${commands.length} commands in this category`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setTimestamp();

                await i.update({ embeds: [categoryEmbed] });
            });

            collector.on('end', async () => {
                try {
                    const disabledRow = ActionRowBuilder.from(row);
                    disabledRow.components[0].setDisabled(true);
                    await response.edit({ components: [disabledRow] });
                } catch (error) {
                    // Ignore errors when editing expired interactions
                }
            });

        } catch (error) {
            console.error('Help command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while displaying help.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    async showCommandHelp(interaction, client, commandName) {
        const command = client.slashCommands.get(commandName);
        
        if (!command) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ff0000')
                        .setDescription(`❌ Command \`/${commandName}\` not found.`)
                ],
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({
                name: `Command: /${command.data.name}`,
                iconURL: client.user.displayAvatarURL()
            })
            .setDescription(command.data.description)
            .addFields([
                {
                    name: '📂 Category',
                    value: command.category || 'Unknown',
                    inline: true
                },
                {
                    name: '⏱️ Cooldown',
                    value: command.cooldown ? `${command.cooldown} seconds` : 'None',
                    inline: true
                }
            ]);

        if (command.data.options && command.data.options.length > 0) {
            const options = command.data.options.map(option => {
                const required = option.required ? '**Required**' : 'Optional';
                return `\`${option.name}\` (${option.type}) - ${option.description} - ${required}`;
            }).join('\n');

            embed.addFields([
                {
                    name: '⚙️ Options',
                    value: options,
                    inline: false
                }
            ]);
        }

        if (command.permissions) {
            const perms = [];
            if (command.permissions.user?.length) {
                perms.push(`**User:** ${command.permissions.user.join(', ')}`);
            }
            if (command.permissions.bot?.length) {
                perms.push(`**Bot:** ${command.permissions.bot.join(', ')}`);
            }
            if (command.permissions.dj) {
                perms.push('**DJ Role Required**');
            }

            if (perms.length > 0) {
                embed.addFields([
                    {
                        name: '🔒 Permissions',
                        value: perms.join('\n'),
                        inline: false
                    }
                ]);
            }
        }

        embed.setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async autocomplete(interaction, client) {
        try {
            const focusedValue = interaction.options.getFocused().toLowerCase();
            const commands = Array.from(client.slashCommands.values());
            
            const choices = commands
                .filter(cmd => cmd.data.name.toLowerCase().includes(focusedValue))
                .slice(0, 25)
                .map(cmd => ({
                    name: `/${cmd.data.name} - ${cmd.data.description}`,
                    value: cmd.data.name
                }));

            await interaction.respond(choices);
        } catch (error) {
            console.error('Help autocomplete error:', error);
            await interaction.respond([]);
        }
    },

    getCommandCategories(client) {
        const categories = {};
        
        client.slashCommands.forEach(command => {
            const category = command.category || 'Other';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(command);
        });

        return categories;
    },

    getCategoryEmoji(category) {
        const emojis = {
            'Music': '🎵',
            'General': '⚙️',
            'Configuration': '🔧',
            'Other': '📁'
        };
        return emojis[category] || '📁';
    }
};