const { WebhookClient, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = new Object({
    name: 'guildCreate',
    /**
     * @param {import("../../Main")} client
     * @param {import("discord.js").Guild} guild
     */
    async execute(client, guild) {
        const hook = new WebhookClient({ url: client.config.hooks.guildAdd });
        if (!hook) return;

        const embed = client.embed() // Uses the new embed method
            .setColor(client.color)
            .setAuthor({ name: `${client.user.username} has been added to a guild.`, iconURL: guild.iconURL({ dynamic: true }), url: client.config.links.support })
            .setTitle(`${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields([
                { name: 'Created On', value: `<t:${Math.round(guild.createdTimestamp / 1000)}>`, inline: false },
                { name: 'Added On', value: `<t:${Math.round(Date.now() / 1000)}>`, inline: false },
                { name: 'Guild Id', value: `\`${guild.id}\``, inline: false },
                { name: 'Owner', value: `<@${guild.ownerId}> (\`id: ${guild.ownerId}\`)`, inline: false },
                { name: 'Total Members Count', value: `\`[ ${guild.memberCount} ]\``, inline: false },
            ]);

        const owner = await client.users.fetch(guild.ownerId).catch(() => null);

        if (owner) {
            let desc = `<:tick_icon:1275390587801178123> \`${client.user.username}\` has been successfully added to \`${guild.name}\`.\n\n` +
                `<:MekoSetting:1275400005053845525> You can report any issues at my **[Support Server](${client.config.links.support})** or reach out to my **[Developers](${client.config.links.support})** for more information.`;

            let thankYouEmbed = client.embed() 
                .setTitle(`Thank you for choosing ${client.user.username}!`)
                .setDescription(desc);

            try {
                await owner.send({
                    embeds: [thankYouEmbed],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setLabel('Support Server')
                                .setURL(client.config.links.support)
                                .setStyle(ButtonStyle.Link),
                            new ButtonBuilder()
                                .setLabel('Get Your Own Eleven')
                                .setURL(client.config.links.premium || client.config.links.support)
                                .setStyle(ButtonStyle.Link)
                        ),
                    ],
                });
            } catch (error) {
                console.error('Could not send thank-you message to the guild owner:', error);
            }
        }

        return await hook.send({ embeds: [embed] }).catch(() => { });
    },
});
