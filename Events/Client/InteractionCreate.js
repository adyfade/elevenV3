import { EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';

export default {
    name: 'interactionCreate',

    /**
     * Handle all interactions
     * @param {import('../../index.js').default} client 
     * @param {import('discord.js').Interaction} interaction 
     */
    async execute(client, interaction) {
        try {
            // Handle slash commands
            if (interaction.isChatInputCommand()) {
                await this.handleSlashCommand(client, interaction);
            }
            // Handle button interactions
            else if (interaction.isButton()) {
                await this.handleButtonInteraction(client, interaction);
            }
            // Handle select menu interactions
            else if (interaction.isStringSelectMenu()) {
                await this.handleSelectMenuInteraction(client, interaction);
            }
            // Handle autocomplete
            else if (interaction.isAutocomplete()) {
                await this.handleAutocomplete(client, interaction);
            }
        } catch (error) {
            console.error('Interaction handler error:', error);
        }
    },

    /**
     * Handle slash command interactions
     * @param {import('../../index.js').default} client 
     * @param {import('discord.js').ChatInputCommandInteraction} interaction 
     */
    async handleSlashCommand(client, interaction) {
        const command = client.slashCommands.get(interaction.commandName);
        
        if (!command) {
            return await interaction.reply({
                content: '❌ This command is not available.',
                ephemeral: true
            });
        }

        try {
            // Check cooldowns
            if (await this.checkCooldown(client, interaction, command)) return;

            // Check permissions
            if (await this.checkPermissions(client, interaction, command)) return;

            // Check player requirements
            if (await this.checkPlayerRequirements(client, interaction, command)) return;

            // Execute command
            await command.execute(interaction, client);

        } catch (error) {
            console.error(`Error executing command ${interaction.commandName}:`, error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while executing this command.');

            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    /**
     * Handle button interactions
     * @param {import('../../index.js').default} client 
     * @param {import('discord.js').ButtonInteraction} interaction 
     */
    async handleButtonInteraction(client, interaction) {
        const button = client.buttons.get(interaction.customId.split('_')[0]);
        
        if (!button) return;

        try {
            await button.execute(interaction, client);
        } catch (error) {
            console.error(`Error executing button ${interaction.customId}:`, error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ An error occurred while processing this button.',
                    ephemeral: true
                });
            }
        }
    },

    /**
     * Handle select menu interactions
     * @param {import('../../index.js').default} client 
     * @param {import('discord.js').StringSelectMenuInteraction} interaction 
     */
    async handleSelectMenuInteraction(client, interaction) {
        const selectMenu = client.selectMenus.get(interaction.customId);
        
        if (!selectMenu) return;

        try {
            await selectMenu.execute(interaction, client);
        } catch (error) {
            console.error(`Error executing select menu ${interaction.customId}:`, error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ An error occurred while processing this selection.',
                    ephemeral: true
                });
            }
        }
    },

    /**
     * Handle autocomplete interactions
     * @param {import('../../index.js').default} client 
     * @param {import('discord.js').AutocompleteInteraction} interaction 
     */
    async handleAutocomplete(client, interaction) {
        const command = client.slashCommands.get(interaction.commandName);
        
        if (!command || !command.autocomplete) return;

        try {
            await command.autocomplete(interaction, client);
        } catch (error) {
            console.error(`Error in autocomplete for ${interaction.commandName}:`, error);
        }
    },

    /**
     * Check command cooldowns
     * @param {import('../../index.js').default} client 
     * @param {import('discord.js').ChatInputCommandInteraction} interaction 
     * @param {Object} command 
     * @returns {boolean} True if on cooldown
     */
    async checkCooldown(client, interaction, command) {
        if (!command.cooldown || client.config.owners.includes(interaction.user.id)) {
            return false;
        }

        const cooldownKey = `${command.data.name}_${interaction.user.id}`;
        const cooldownTime = command.cooldown * 1000;

        if (client.cooldowns.has(cooldownKey)) {
            const expirationTime = client.cooldowns.get(cooldownKey) + cooldownTime;
            
            if (Date.now() < expirationTime) {
                const timeLeft = Math.round((expirationTime - Date.now()) / 1000);
                
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ffaa00')
                            .setDescription(`⏰ Please wait ${timeLeft} second(s) before using \`/${command.data.name}\` again.`)
                    ],
                    ephemeral: true
                });
                return true;
            }
        }

        client.cooldowns.set(cooldownKey, Date.now());
        setTimeout(() => client.cooldowns.delete(cooldownKey), cooldownTime);
        
        return false;
    },

    /**
     * Check command permissions
     * @param {import('../../index.js').default} client 
     * @param {import('discord.js').ChatInputCommandInteraction} interaction 
     * @param {Object} command 
     * @returns {boolean} True if permission check failed
     */
    async checkPermissions(client, interaction, command) {
        if (!command.permissions) return false;

        const member = interaction.member;
        const botMember = interaction.guild.members.me;

        // Check bot permissions
        if (command.permissions.bot && command.permissions.bot.length > 0) {
            const missingBotPerms = command.permissions.bot.filter(perm => 
                !botMember.permissions.has(PermissionFlagsBits[perm])
            );

            if (missingBotPerms.length > 0) {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription(`❌ I need the following permissions: \`${missingBotPerms.join(', ')}\``)
                    ],
                    ephemeral: true
                });
                return true;
            }
        }

        // Check user permissions
        if (command.permissions.user && command.permissions.user.length > 0) {
            const missingUserPerms = command.permissions.user.filter(perm => 
                !member.permissions.has(PermissionFlagsBits[perm])
            );

            if (missingUserPerms.length > 0) {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription(`❌ You need the following permissions: \`${missingUserPerms.join(', ')}\``)
                    ],
                    ephemeral: true
                });
                return true;
            }
        }

        return false;
    },

    /**
     * Check player requirements
     * @param {import('../../index.js').default} client 
     * @param {import('discord.js').ChatInputCommandInteraction} interaction 
     * @param {Object} command 
     * @returns {boolean} True if requirements not met
     */
    async checkPlayerRequirements(client, interaction, command) {
        if (!command.player) return false;

        const member = interaction.member;
        const botMember = interaction.guild.members.me;

        // Check if user needs to be in voice channel
        if (command.player.voice && !member.voice?.channel) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ff0000')
                        .setDescription('❌ You need to be in a voice channel to use this command!')
                ],
                ephemeral: true
            });
            return true;
        }

        // Check if bot and user are in same voice channel
        if (command.player.voice && botMember.voice?.channel && 
            member.voice?.channel?.id !== botMember.voice.channel.id) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ff0000')
                        .setDescription(`❌ You need to be in ${botMember.voice.channel} to use this command!`)
                ],
                ephemeral: true
            });
            return true;
        }

        // Check if player is required to be active
        if (command.player.active) {
            const player = client.kazagumo.players.get(interaction.guild.id);
            
            if (!player || !player.queue.current) {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription('❌ There is no music playing in this server!')
                    ],
                    ephemeral: true
                });
                return true;
            }
        }

        return false;
    }
};