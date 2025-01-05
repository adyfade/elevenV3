const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Shows the latency of the bot."),

    /**
     * 
     * @param {import("../../../Main")} client 
     * @param {import("discord.js").Interaction} interaction
     */

    async execute(interaction, client) {
        const ping = Math.floor(client.ws.ping);

        const embed = client.embed()
            .setColor('#0099ff') // You can change the color to any preferred value
            .setDescription(`> <:11dot:1287835131633209446> **__Ping__ : ${ping} ms**`);

        return interaction.reply({ embeds: [embed] });
    },
};
