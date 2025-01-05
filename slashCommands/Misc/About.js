const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const _setupdata = require('../../Models/Setup');
const _djdata = require('../../Models/Dj');
const _tfsdata = require('../../Models/247');
const _announcedata = require('../../Models/Announce');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Shows the information about the bot.'),

    async execute(interaction, client) {
        const player = client.dispatcher.players.get(interaction.guildId);

        let _247data = await _tfsdata.findOne({ _id: interaction.guildId });
        let djdata = await _djdata.findOne({ _id: interaction.guildId });
        let announcedata = await _announcedata.findOne({ _id: interaction.guildId });
        let setupdata = await _setupdata.findOne({ _id: interaction.guildId });

        // Embed 1: About Eleven
        const embed1 = client.embed()
            .setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL(),
                url: client.config.links.support,
            })
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTitle('About Eleven')
            .setColor('#ff0000') // Replace with color if needed
            .setDescription(
                `Eleven - Let Eleven spin the tunes and elevate your vibe! \n Meet Eleven, your personal DJ on Discord! Bringing you the beats, rhythm, and vibes you love, all in one seamless experience.`
            )
            .addFields(
                {
                    name: '__Basic Information__',
                    value: `**NodeJs Version**: v${process.version.slice(1)}\n**Library**: [discord.js](https://discord.js.org/)`,
                    inline: false,
                },
                {
                    name: '__Links__',
                    value: `[Invite](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands) : [Support](https://discord.gg/teamkronix) : [Vote](https://top.gg/bot/${client.user.id}/vote)`,
                    inline: false,
                }
            )
            .setImage('https://github.com/akshew/image-hosting/blob/main/akshat.gif?raw=true')
            .setFooter({
                text: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            });

        // Embed 2: Developers
        const embed2 = client.embed()
            .addFields(
                {
                    name: '<:ndevelopers:1275471400035160097> ・ __Developers__',
                    value: `> \`.\` **[akshat](https://discord.com/users/747321055319949312)**`,
                },
                {
                    name: '<:eg_member:1275390615265480717> ・ __Contributors__',
                    value: `> \`1.\` **[Moon Carli](https://discord.com/users/1219568207719960578)**\n> \`2.\` **[snoww.](https://discord.com/users/1092374628556615690)**`,
                },
                {
                    name: '<:eg_fire:1275390600014725150> ・ __Organisation__',
                    value: `> \`.\` **[Team Kronix](https://discord.gg/teamkronix)**`,
                }
            )
            .setImage('https://github.com/akshew/image-hosting/blob/main/kronix1.png?raw=true');

        // Embed 3: Other Bots
        const embed3 = client.embed()
            .setTitle('Partner Bots')
            .setDescription("**Check out the other bots from Team Kronix!**\n\n> **[TuTu.](https://discord.com/oauth2/authorize?client_id=1250413871391309908) - the cutest discord multipurpose bot**\n tutu is packed with features such as automod, moderation, giveaway, welcomer, ai chatbot, sticky messages and more.\n-# [invite](https://discord.com/oauth2/authorize?client_id=1250413871391309908) **|** [website](https://tutubot.netlify.app)")
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setImage('https://github.com/snowded/tutu.DiscordBot/blob/main/tutubannernew.png?raw=true')
            .setColor('#ff0000'); // Replace with color if needed

        // Navigation buttons
        const navigationRow = (show1, show2, show3) => new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(show1)
                .setLabel('About Eleven')
                .setEmoji('<:eleven:1285522157623050324>')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(show2)
                .setLabel('About Developers')
                .setEmoji('<:ndevelopers:1275471400035160097>')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(show3)
                .setLabel('Other Bots')
                .setEmoji('<:nlink:1275390607145041991>')
                .setStyle(ButtonStyle.Primary),
        );

        // Reply with initial embed and buttons
        const messageResponse = await interaction.reply({
            embeds: [embed1],
            components: [navigationRow('showEmbed1', 'showEmbed2', 'showEmbed3')],
            fetchReply: true, // Fetch the reply to create a collector
        });

        const filter = (i) =>
            ['showEmbed1', 'showEmbed2', 'showEmbed3'].includes(i.customId) &&
            i.user.id === interaction.user.id;

        const collector = messageResponse.createMessageComponentCollector({
            filter,
            time: 60000,
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'showEmbed1') {
                await i.update({
                    embeds: [embed1],
                    components: [navigationRow('showEmbed1', 'showEmbed2', 'showEmbed3')],
                });
            } else if (i.customId === 'showEmbed2') {
                await i.update({
                    embeds: [embed2],
                    components: [navigationRow('showEmbed1', 'showEmbed2', 'showEmbed3')],
                });
            } else if (i.customId === 'showEmbed3') {
                await i.update({
                    embeds: [embed3],
                    components: [navigationRow('showEmbed1', 'showEmbed2', 'showEmbed3')],
                });
            }
        });

        collector.on('end', () => {
            messageResponse.edit({ components: [] });
        });
    },
};
