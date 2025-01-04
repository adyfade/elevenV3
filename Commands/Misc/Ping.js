module.exports = {
    name: "ping",
    description: "Shows the latency of the bot.",
    category: "Misc",
    cooldown: 10,
    aliases: ["pong"],
    permissions: {
        isPremium: false,
    },
    player: { voice: false, active: false, dj: false, djPerm: null },

    async execute(client, message, args, prefix, color) {
       
        const ping = Math.floor(client.ws.ping);


        const embed = client.embed()
            .setColor(color)
            .setDescription(`> <:11dot:1287835131633209446> **__Ping__ : ${ping} ms**`);

        return message.reply({ embeds: [embed] });
    },
};
