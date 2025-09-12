const { PermissionsBitField, ChannelType, Collection } = require('discord.js');
const DjSchema = require('../../Models/Dj');
const Blacklist = require('../../Models/black');

module.exports = {
    name: "CommandInteraction",
    /**
     * @param {import("../../Main")} client 
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(client, interaction) {
        if (!interaction.isCommand()) return;
        
        const command = client.applicationCommands.get(interaction.commandName);
        if (!command) return;

        const color = client.color;

        try {
            // Check if user is blacklisted
            const blacklistData = await Blacklist.findOne({ userId: interaction.user.id });
            if (blacklistData) {
                return await interaction.reply({
                    content: "You are blacklisted from using this bot.",
                    ephemeral: true
                });
            }

            // Auto Permission Return
            const permissions = interaction.guild.members.cache.get(client.user.id).permissionsIn(interaction.channel);
            if (!permissions.has(PermissionsBitField.Flags.SendMessages)) {
                return await interaction.reply({ 
                    content: `I don't have **\`SEND_MESSAGES\`** permission to execute this **\`${command.data.name}\`** command.`, 
                    ephemeral: true 
                });
            }
            if (!permissions.has(PermissionsBitField.Flags.ViewChannel)) {
                return await interaction.reply({ 
                    content: `I don't have **\`VIEW_CHANNEL\`** permission to execute this **\`${command.data.name}\`** command.`, 
                    ephemeral: true 
                });
            }
            if (!permissions.has(PermissionsBitField.Flags.EmbedLinks)) {
                return await interaction.reply({ 
                    content: `I don't have **\`EMBED_LINKS\`** permission to execute this **\`${command.data.name}\`** command.`, 
                    ephemeral: true 
                });
            }

            // Permission for handler
            if (command.permissions) {
                if (command.permissions.client) {
                    if (!permissions.has(PermissionsBitField.resolve(command.permissions.client) || [])) {
                        return await interaction.reply({ 
                            content: `I don't have \`${command.permissions.client.join(', ')}\` permission(s) to execute this command.`, 
                            ephemeral: true 
                        });
                    }
                }
                if (command.permissions.user) {
                    const userPermissions = interaction.guild.members.cache.get(interaction.user.id).permissionsIn(interaction.channel);
                    if (!userPermissions.has(PermissionsBitField.resolve(command.permissions.user) || [])) {
                        return await interaction.reply({ 
                            content: `You don't have \`${command.permissions.user.join(', ')}\` permission(s) to use this command.`, 
                            ephemeral: true 
                        });
                    }
                }
                if (command.permissions.dev) {
                    if (client.owners && !client.owners.includes(interaction.user.id)) {
                        return await interaction.reply({ 
                            content: `Sorry! This is an owner-based command you can't use it.`, 
                            ephemeral: true 
                        });
                    }
                }
                if (command.permissions.voteRequired) {
                    try {
                        let voted = await client.Topgg.hasVoted(interaction.user.id);
                        if (!voted && !client.owners.includes(interaction.user.id)) {
                            return await interaction.reply({
                                embeds: [client.embed().setColor(client.color).setDescription(`You Need To [Vote](https://top.gg/bot/${client.user.id}/vote) For Me To Use This Command!`)],
                                components: [client.row().addComponents(client.button().setStyle(5).setLabel("Vote").setURL(`https://top.gg/bot/${client.user.id}/vote`))],
                                ephemeral: true
                            });
                        }
                    } catch (error) {
                        console.error(`Error checking vote status for user ${interaction.user.id}:`, error);
                    }
                }
            }

            const dispatcher = client.dispatcher.players.get(interaction.guildId);

            if (command.player) {
                if (command.player.voice) {
                    if (!interaction.member.voice.channel) {
                        return await interaction.reply({ 
                            content: `> <:11:1288062188854050887> **You must be connected to a voice channel to use this \`${command.data.name}\` command.**`, 
                            ephemeral: true 
                        });
                    }
                    if (!permissions.has(PermissionsBitField.Flags.Connect)) {
                        return await interaction.reply({ 
                            content: `I don't have \`CONNECT\` permission to execute this \`${command.data.name}\` command.`, 
                            ephemeral: true 
                        });
                    }
                    if (!permissions.has(PermissionsBitField.Flags.Speak)) {
                        return await interaction.reply({ 
                            content: `I don't have \`SPEAK\` permission to execute this \`${command.data.name}\` command.`, 
                            ephemeral: true 
                        });
                    }
                    if (interaction.member.voice.channel.type === ChannelType.GuildStageVoice && 
                        !permissions.has(PermissionsBitField.Flags.RequestToSpeak)) {
                        return await interaction.reply({ 
                            content: `I don't have \`REQUEST TO SPEAK\` permission to execute this \`${command.data.name}\` command.`, 
                            ephemeral: true 
                        });
                    }
                    if (interaction.guild.members.cache.get(client.user.id).voice.channel) {
                        if (interaction.guild.members.cache.get(client.user.id).voice.channel !== interaction.member.voice.channel) {
                            return await interaction.reply({
                                content: `You are not connected to ${interaction.guild.members.cache.get(client.user.id).voice.channel} to use this \`${command.data.name}\` command.`,
                                ephemeral: true,
                            });
                        }
                    }
                }
                if (command.player.active) {
                    try {
                        const playerInstance = client.dispatcher.players.get(interaction.guildId);
                        if (!playerInstance || !playerInstance.queue || !playerInstance.queue.current) {
                            return await interaction.reply({ 
                                content: 'Nothing is playing right now!', 
                                ephemeral: true 
                            });
                        }
                    } catch (error) {
                        console.error(`Error checking player instance for command ${command.data.name}:`, error);
                    }
                }
                if (command.player.dj) {
                    try {
                        const data = await DjSchema.findOne({ _id: interaction.guildId });
                        let perm = PermissionsBitField.Flags.MuteMembers || PermissionsBitField.Flags.ManageGuild || PermissionsBitField.Flags.Administrator;
                        if (command.player.djPerm) perm = command.player.djPerm;
                        if (!data) {
                            if (!interaction.guild.members.cache.get(interaction.user.id).permissionsIn(interaction.channel).has(perm)) {
                                return await interaction.reply({ 
                                    content: 'You don\'t have enough permissions or the DJ role to use this command.', 
                                    ephemeral: true 
                                });
                            }
                        } else if (data.mode) {
                            let pass = false;
                            if (data.roles.length > 0) {
                                interaction.member.roles.cache.forEach(x => {
                                    if (data.roles.includes(x.id)) pass = true;
                                });
                            }
                            if (!pass && !interaction.guild.members.cache.get(interaction.user.id).permissionsIn(interaction.channel).has(perm)) {
                                return await interaction.reply({ 
                                    content: 'You don\'t have enough permissions or the DJ role to use this command.', 
                                    ephemeral: true 
                                });
                            }
                        }
                    } catch (error) {
                        console.error(`Error checking DJ role permissions for command ${command.data.name}:`, error);
                    }
                }
            }

            // Cooldown management
            if (!client.Cooldown.has(command.data.name)) client.Cooldown.set(command.data.name, new Collection());
            const cooldown = client.Cooldown.get(command.data.name);
            const cooldownAmount = command.cooldown && command.cooldown > 0 ? command.cooldown * 1000 : 3000;
            if (cooldown.has(interaction.user.id) && !client.owners.includes(interaction.user.id)) {
                const expiretime = cooldown.get(interaction.user.id);
                const timeleft = cooldownAmount - (Date.now() - expiretime);
                if (timeleft > 0) {
                    return await interaction.reply({ 
                        content: `Please wait for \`[ ${client.util.msToTime(timeleft)} ]\` before reusing the \`${command.data.name}\` command!`, 
                        ephemeral: true 
                    });
                }
            } else {
                cooldown.set(interaction.user.id, Date.now());
            }
            setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownAmount);

            try {
                await command.execute(interaction, client, color, dispatcher);
            } catch (error) {
                console.error(`Error executing command ${command.data.name}:`, error);
                const errorMessage = { 
                    content: `There was an error while executing this command.`, 
                    ephemeral: true 
                };
                
                if (interaction.deferred || interaction.replied) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            const errorMessage = { 
                content: `An error occurred while processing your request.`, 
                ephemeral: true 
            };
            
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }
};