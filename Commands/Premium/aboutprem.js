const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = new Object({
    name: "aboutprem",
    description: "Shows the premium benefits and pricing plans.",
    category: "Premium",
    usage: "",
    cooldown: 10,
    aliases: ["premium", "prem"],
    examples: [""],
    sub_commands: [],
    args: false,
    permissions: {
        isPremium: false,
    },
    player: { voice: false, active: false, dj: false, djPerm: null },

    async execute(client, message, args, prefix, color) {
        const embed = client
            .embed()
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTitle("> <:11musicWaves:1288060047728840725> Premium Features")
            .setColor(color)
            .setDescription(`<:11dot:1287835131633209446> **Unlock the full potential of the Eleven with premium!** \n\n> <:11dot:1287835131633209446> *With a premium membership, you get access to __exclusive__ features, enhanced performance, and priority support. Upgrade your experience and take your server to the next level!*`)
            .addFields(
                {
                    name: "<:11prem:1288556207778566154> `.` Premium Benefits",
                    value: `> \`-\` Access to exclusive premium commands\n> \`-\` Enhanced music quality and performance\n> \`-\` Priority support from the dev team\n> \`-\` Customizable bot features\n> \`-\` And much more!`,
                    inline: false,
                },
                {
                    name: "<:11misc:1288061620861534260> `.` How to Get Premium?",
                    value: `> \`-\` [Purchase Premium](https://discord.gg/teamkronix) By Creating a Ticket in the Support Server to upgrade your server.`,
                    inline: false,
                },
                {
                    name: "<:11link:1288060059682603029> `.` Links",
                    value: `\`-\` [Support](https://discord.gg/teamkronix) **/** [Vote](https://top.gg/bot/${client.user.id}/vote)\n\`\`\`diff\n- Premium Features are free for now EXCLUDING No-prefix. However Custom Eleven is Available.\`\`\``,
                    inline: false,
                }
            )
            .setFooter({
                text: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            });

        const embed2 = client
            .embed()
            .setTitle("<:narrow:1275390602380574726> **Premium Features and Pricing**")
            .addFields(
                {
                    name: '<:11dot:1287835131633209446> **Premium Features**',
                    value: `\`1.\` **No Prefix**\n\`2.\` **Radio**\n\`3.\` **Custom Playlist**\n\`4.\` **No Vote**`,
                },
                {
                    name: '<:11prem:1288556207778566154> **Monthly Plan**',
                    value: `\`\`\` - 70 INR/month - Access to all premium features\`\`\``,
                },
                {
                    name: '<:11prem:1288556207778566154> **Yearly Plan**',
                    value: `\`\`\` - 500 INR/year - Save 2 months with yearly billing\`\`\``,
                },
            )

        
            .setImage("https://github.com/akshew/image-hosting/blob/main/kronix1.png?raw=true");

        const customElevenEmbed = client
            .embed()
            .setTitle("Custom Eleven")
            .setDescription(`
                <:11star:1288556209774788618> **Introducing Custom Eleven**

                > <:11misc:1288061620861534260> \`-\` What is Custom Eleven? 
                > \`-\` **So, it is a custom instance of Eleven. Where it will have a custom name, custom profile picture, custom bio, custom embed color, etc.**

                Features of Custom Eleven
                > \`-\` Custom name, bio, avatar, embed colors, etc.
                > \`-\` Dedicated Node for music.
                > \`-\` No downtime and glitches.
                > \`-\` Totally Yours.
                > \`-\` 24/7 Support.
                > and much more...

                **That is just for 250 INR/month**
            `)
            .setColor("#7289DA");

        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("showEmbed2").setLabel("View Pricing Plans").setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId("customEleven").setLabel("Custom Eleven").setStyle(ButtonStyle.Success));

        const sentMessage = await message.reply({ embeds: [embed], components: [row] });

        const filter = (i) => (i.customId === "showEmbed2" || i.customId === "customEleven") && i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({
            filter,
            time: 100000,
        });

        collector.on("collect", async (interaction) => {
            if (interaction.customId === "showEmbed2") {
                await interaction.update({ embeds: [embed2], components: [row] });
            } else if (interaction.customId === "customEleven") {
                await interaction.reply({
                    embeds: [customElevenEmbed],
                    ephemeral: true,
                });
            }
        });

        collector.on("end", async () => {
            const disabledRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("showEmbed2").setLabel("View Pricing Plans").setStyle(ButtonStyle.Success).setDisabled(true), new ButtonBuilder().setCustomId("customEleven").setLabel("Custom Eleven").setStyle(ButtonStyle.Primary).setDisabled(true));
            await sentMessage.edit({ components: [disabledRow] });
        });
    },
});