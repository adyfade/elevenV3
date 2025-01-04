module.exports = new Object({
    name: "stats",
    description: "Shows a deep status of the bot.",
    category: "Misc",
    usage: "",
    cooldown: 10,
    usage: "",
    aliases: ["info", "st"],
    examples: ["st", "stats", "botstats"],
    sub_commands: [],
    args: false,
    permissions: {
        client: [],
        user: [],
        dev: false,
        voteRequired: false,
    },
    player: { voice: false, active: false, dj: false, djPerm: null },

    async execute(client, message, args, prefix, color) {
        const dbPing = async () => {
            const currentNano = process.hrtime();
            await require("mongoose").connection.db.command({ ping: 1 });
            const time = process.hrtime(currentNano);
            return Math.round((time[0] * 1e9 + time[1]) * 1e-6);
        };
        return message.reply({
            embeds: [
                client
                    .embed()
                    .setColor(color)
                    .setTimestamp()
                    .setImage(
                        "https://github.com/akshew/image-hosting/blob/main/eleven.png?raw=true",
                    )
                .setFooter({
                    text: `${message.guild.shardId}/${client.shard?.count || 1} shards`,
                    iconURL: client.user.displayAvatarURL(),
                })

                    .setDescription(
                        "<:11dot:1287835131633209446> **[Below Are the statistics of Eleven Music.](https://discord.gg/teamkronix)**\n",
                    )
                    .addFields([
                        {
                            name: "<:nconfig:1275412117247496313> Status",
                            value: `> <:Latency:1275458011430781131> **Bot Latency :** \`${Math.round(client.ws.ping)} ms\`\n> <:db:1275458013964271709> **DataBase Latency :**  \`${await dbPing()} ms\`\n> <:MekoTimer:1275458017055211703> **Uptime :** <t:${(Date.now() / 1000 - client.uptime / 1000).toFixed()}:R>\n> <:Commands:1275458580514078784> **Commands :** \`${client.Commands.map((x) => x.name).length}\``,
                            inline: false,
                        },
                        {
                            name: "<:KronixStats:1275460879286145178> Stats",
                            value: `> <:MekoServer:1275458019341242552> **Servers :** ${client.guilds.cache.size}\n> <:MekoUser:1275458022155485239> **Users : **${client.guilds.cache.reduce((x, y) => x + y.memberCount, 0)}\n> <:MekoChannel:1275458023967428662> **Channels :** ${client.channels.cache.size}`,
                            inline: false,
                        },
                        {
                            name: "<a:eventhost:1275460785983848480> Host",
                            value: `> <:11dot:1287835131633209446> **Platform :** \`${require("os").type}\`\n> <:11dot:1287835131633209446> **Total Memory :** \`${client.util.formatBytes(require("os").totalmem)}\`\n> <:11dot:1287835131633209446> **Free Memory :** \`${client.util.formatBytes(require("os").freemem)}\``,
                            inline: false,
                        },
                        {
                            name: "<:eg_discovery:1275459515873231001> Library",
                            value: `> <:djs:1275458026337206313> **Discord.js :** v${require("discord.js").version}\n> <:js:1275458028749193388> **Node :** ${process.version}`,
                            inline: false,
                        },
                    ]),
            ],
        });
    },
});
