const { ChannelType, PermissionsBitField, ButtonStyle } = require("discord.js");
const db = require("../../Models/Setup");
const db4 = require(`../../Models/noprefix`);
const targetUserId = "<@747321055319949312>";
const emojiReaction = "<a:akshat:1275524913683365898>";

module.exports = new Object({
    name: "messageCreate",
    /**
     * @param {import("../../Main")} client
     * @param {import("discord.js").Message} message
     */
    async execute(client, message) {
        if (
            message.author.bot ||
            message.webhookId ||
            !message.guild ||
            !message.channel
        )
            return;
        if (
            message.channel.type == ChannelType.DM ||
            message.channel.type == ChannelType.GuildForum
        )
            return;
        if (message.partial) await message.fetch();

        // New code to check if the target user is mentioned and react with the emoji
        if (message.mentions.has(targetUserId)) {
            await message.react(emojiReaction).catch(() => {});
        }

        // Existing code logic continues...
        const data = await db.findOne({ _id: message.guildId });
        if (data && data.channel && message.channelId === data.channel)
            return client.emit("requestChannel", message);
        let prefix = await client.util.getPrefix(message.guildId, client);
        const color = client.color;
        const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);
        if (message.content.match(mention)) {
            if (
                message.guild.members.cache
                    .get(client.user.id)
                    .permissionsIn(message.channel)
                    .has(PermissionsBitField.Flags.SendMessages)
            ) {
                const msg = await message.reply({
                    embeds: [
                        client
                            .embed()
                            .setAuthor({
                                name: `heya ${message.author.displayName}, My Prefix is : ${prefix}`,
                                url: `https://discord.gg/teamkronix`,
                                iconURL: message.author.displayAvatarURL(),
                            })
                            .setColor(color),
                    ],
                    components: [
                        client
                            .row()
                            .addComponents(
                                client
                                    .button()
                                    .setStyle(ButtonStyle.Success)
                                    .setLabel("Read More..")
                                    .setCustomId("gethelp"),
                            ),
                    ],
                }).catch(() => {});
        
                const filter = (interaction) => interaction.customId === 'gethelp' && interaction.user.id === message.author.id;
                const collector = msg.createMessageComponentCollector({ filter, time: 600000000 });
        
                collector.on('collect', async (interaction) => {
                    await interaction.reply({
                        content: `https://discord.gg/teamkronix`,
                        embeds: [
                            client
                                .embed()
                                .setAuthor({
                                    name: `Detailed Information`,
                                    url: `https://discord.gg/teamkronix`,
                                    iconURL: message.author.displayAvatarURL(), 
                                })
                                .setDescription(`
                                    
                                    `)
                                .setColor(color),
                        ],
                        ephemeral: true, // This makes the response ephemeral
                    });
                });
            }
        }
        
        let np = [];
        let npData = await db4.findOne({
            userId: message.author.id,
            noprefix: true,
        });
        if (npData) np.push(message.author.id);

        let regex = new RegExp(`^<@!?${client.user.id}>`);
        let pre = message.content.match(regex)
            ? message.content.match(regex)[0]
            : prefix;

        // Check if the user is in the noprefix array
        if (!np.includes(message.author.id)) {
            if (!message.content.startsWith(pre)) return;
        }

        // Adjust args parsing based on whether the user is in the noprefix array
        const args = np.includes(message.author.id)
            ? message.content.trim().split(/ +/) // No prefix needed
            : message.content.slice(pre.length).trim().split(/ +/); // Use prefix

        const commandName = args.shift().toLowerCase();
        const command =
            client.Commands.get(commandName) ||
            client.Commands.get(client.Aliases.get(commandName));

        if (!command) return;

        //Auto Permission Return
        if (
            !message.guild.members.cache
                .get(client.user.id)
                .permissionsIn(message.channel)
                .has(PermissionsBitField.Flags.SendMessages)
        )
            return await message.author
                .send({
                    content: `I don't have **\`SEND_MESSAGES\`** permission in <#${message.channelId}> to execute this **\`${command.name}\`** command.`,
                })
                .catch(() => {});
        if (
            !message.guild.members.cache
                .get(client.user.id)
                .permissionsIn(message.channel)
                .has(PermissionsBitField.Flags.ViewChannel)
        )
            return;
        if (
            !message.guild.members.cache
                .get(client.user.id)
                .permissionsIn(message.channel)
                .has(PermissionsBitField.Flags.EmbedLinks)
        )
            return await message
                .reply({
                    content: `I don't have **\`EMBED_LINKS\`** permission to execute this **\`${command.name}\`** command.`,
                })
                .catch(() => {});
        // Permission for handler
        if (command.permissions) {
            if (command.permissions.client) {
                if (
                    !message.guild.members.cache
                        .get(client.user.id)
                        .permissionsIn(message.channel)
                        .has(
                            PermissionsBitField.resolve(
                                command.permissions.client,
                            ) || [],
                        )
                )
                    return await client.util.oops(
                        message.channel,
                        `I don't have \`${command.permissions.client.join(", ")}\` permission(s) to execute this command.`,
                        color,
                    );
            }
            if (command.permissions.user) {
                if (
                    !message.guild.members.cache
                        .get(message.author.id)
                        .permissionsIn(message.channel)
                        .has(
                            PermissionsBitField.resolve(
                                command.permissions.user,
                            ) || [],
                        )
                )
                    return await client.util.oops(
                        message.channel,
                        `You don't have \`${command.permissions.user.join(", ")}\` permissions to use this command.`,
                        color,
                    );
            }
            if (command.permissions.dev) {
                if (client.owners) {
                    const findDev = client.owners.find(
                        (x) => x === message.author.id,
                    );
                    if (!findDev)
                        return message.reply({
                            content: `Sorry! This is a owner based command you cant use it.`,
                        });
                }
            }
            if (
                command.permissions.voteRequired &&
                !client.owners.includes(message.author.id)
            ) {
                let voted = await client.Topgg.hasVoted(message.author.id);
                if (!voted) {
                    return message.reply({
                        embeds: [
                            client
                                .embed()
                                .setColor(client.color)
                                .setDescription(
                                    `You Need To [Vote](https://top.gg/bot/990494496817049690/vote) For Me To Use This Command!`,
                                ),
                        ],
                        components: [
                            client
                                .row()
                                .addComponents(
                                    client
                                        .button()
                                        .setStyle(client.config.button.link)
                                        .setLabel("Vote")
                                        .setURL(
                                            "https://top.gg/bot/990494496817049690/vote",
                                        ),
                                ),
                        ],
                    });
                }
            }
        }
        const dispatcher = client.dispatcher.players.get(message.guildId);
        // const dispatcher = client
        if (command.player) {
            if (command.player.voice) {
                if (!message.member.voice.channel)
                    return await client.util.oops(
                        message.channel,
                        `> <:11:1288062188854050887> **You must be connected to a voice channel to use this \`${command.name}\` command.**`,
                        color,
                    );
                if (
                    !message.guild.members.cache
                        .get(client.user.id)
                        .permissionsIn(message.channel)
                        .has(PermissionsBitField.Flags.Connect)
                )
                    return await client.util.oops(
                        message.channel,
                        `I don't have \`CONNECT\` permissions to execute this \`${command.name}\` command.`,
                        color,
                    );
                if (
                    !message.guild.members.cache
                        .get(client.user.id)
                        .permissionsIn(message.channel)
                        .has(PermissionsBitField.Flags.Speak)
                )
                    return await client.util.oops(
                        message.channel,
                        `I don't have \`SPEAK\` permissions to execute this \`${command.name}\` command.`,
                        color,
                    );
                if (
                    message.member.voice.channel.type ==
                        ChannelType.GuildStageVoice &&
                    !message.guild.members.cache
                        .get(client.user.id)
                        .permissionsIn(message.channel)
                        .has(PermissionsBitField.Flags.RequestToSpeak)
                )
                    return await client.util.oops(
                        message.channel,
                        `I don't have \`REQUEST TO SPEAK\` permission to execute this \`${command.name}\` command.`,
                        color,
                    );
                if (
                    message.guild.members.cache.get(client.user.id).voice
                        .channel
                ) {
                    if (
                        message.guild.members.cache.get(client.user.id).voice
                            .channel !== message.member.voice.channel
                    )
                        return await client.util.oops(
                            message.channel,
                            `You are not connected to ${message.guild.members.cache.get(client.user.id).voice.channel} to use this \`${command.name}\` command.`,
                            color,
                        );
                }
            }
            if (command.player.active) {
                const playerInstance = client.dispatcher.players.get(
                    message.guildId,
                );
                if (
                    !playerInstance ||
                    !playerInstance.queue ||
                    !playerInstance.queue.current
                )
                    return client.util.oops(
                        message.channel,
                        `Nothing is playing right now!`,
                        color,
                    );
            }
        }
        if (command.dev && !client.owners.includes(message.author.id))
            return await client.util.oops(
                message.channel,
                `This command can only be used by developers.`,
                color,
            );
        const now = Date.now();
        if (client.Cooldown.has(`${command.name}${message.author.id}`)) {
            const expirationTime =
                client.Cooldown.get(`${command.name}${message.author.id}`) +
                command.Cooldown;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return await client.util.oops(
                    message.channel,
                    `Please wait ${timeLeft.toFixed(
                        1,
                    )} more second(s) before reusing the \`${command.name}\` command.`,
                    color,
                );
            }
        }
        client.Cooldown.set(`${command.name}${message.author.id}`, now);
        setTimeout(() => {
            client.Cooldown.delete(`${command.name}${message.author.id}`);
        }, command.Cooldown);
        const userinfo = {
            id: message.author.id,
            username: message.author.username,
            avatar: message.author.avatar,
            discriminator: message.author.discriminator,
        };
        try {
            command.execute(client, message, args, prefix, color, dispatcher);
        } catch (error) {
            console.error(error);
        }
    },
});
