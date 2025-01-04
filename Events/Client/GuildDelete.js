const { WebhookClient } = require('discord.js');
const setup = require('../../Models/Setup');
const dj = require('../../Models/Dj');
const announce = require('../../Models/Announce');
const prefix = require('../../Models/Prefix');
const _247 = require('../../Models/247');

module.exports = new Object({
    name: 'guildDelete',

    async execute(client, guild) {
        const data1 = await setup.findOne({ _id: guild.id });
        const data3 = await dj.findOne({ _id: guild.id });
        const data4 = await announce.findOne({ _id: guild.id });
        const data5 = await _247.findOne({ _id: guild.id });
        const data6 = await prefix.findOne({ _id: guild.id });

        if (data1) await data1.delete();
        if (data3) await data3.delete();
        if (data4) await data4.delete();
        if (data5) await data5.delete();
        if (data6) await data6.delete();

        const hook = new WebhookClient({ url: client.config.hooks.guildRemove });
        const embed = client.embed()
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
            .setTitle(`📤 Left a Guild !!`)
            .addFields(
                { name: "Guild Name", value: `\`\`\`yml\n` + guild.name + ' -' + guild.id + `\`\`\``, inline: true },
                { name: "Guild Member Count", value: `\`${guild.memberCount}\``, inline: true },
                { name: "Guild Created At", value: `${"<t:" + parseInt(guild.createdAt / 1000) + ":f>"}`, inline: true },
                { name: "Guild Joined At", value: `${"<t:" + parseInt(guild.joinedAt / 1000) + ":f>"}`, inline: true },
                { name: "Guild Verification Level", value: '`' + guild.verificationLevel + '`', inline: true },
                { name: "Guild Explicit Content Filter", value: '`' + guild.explicitContentFilter + '`', inline: true },
                { name: "Guild Default Message Notifications", value: '`' + guild.defaultMessageNotifications + '`', inline: true },
                { name: "Guild Count", value: `\`${client.guilds.cache.size}\``, inline: true },
            )
            .setColor(client.color);
        if (hook) await hook.send({ embeds: [embed] }).catch(() => {});

        try {
            // Fetching the guild owner with fetchOwner() for more reliability
            const owner = await guild.fetchOwner();
            const farewellEmbed = client.embed()
                .setTitle(`Oops! ${client.user.username} was removed!`)
                .setDescription(`<:Warning:1277945371271626825> ${client.user.username} was just removed from ${guild.name}. \n <:Warning:1277945371271626825> Sorry for all and any of the bad experience/(s) you had with me! \n <:Warning:1277945371271626825> Please leave a feedback or report any issues you had at my **[Support Server](${client.config.links.support})** so that it can be fixed / worked on as soon as possible.`);

            await owner.send({ embeds: [farewellEmbed] });
        } catch (e) {
            console.error(`Could not send farewell message to the guild owner (${guild.name}, ID: ${guild.id}): ${e.message}`);
        }
    },
});
