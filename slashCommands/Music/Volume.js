const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Set or check the volume of the music player.")
        .addIntegerOption(option => 
            option.setName("amount")
                .setDescription("The volume to set (10-100)")
                .setMinValue(10)
                .setMaxValue(100)),

    async execute(interaction, client) {
        // Check if the user is in a voice channel
        if (!interaction.member.voice.channel) {
            return await interaction.reply({ content: "You need to be in a voice channel to use this command!", ephemeral: true });
        }

        // Get the player
        const player = client.kazagumo.players.get(interaction.guildId);

        if (!player) {
            return await interaction.reply({ content: "There is no music playing in this server.", ephemeral: true });
        }

        const amount = interaction.options.getInteger("amount");

        if (amount) {
            if (player.volume === amount / 100) {
                return await interaction.reply(`Volume amount is already at ${player.volume * 100}%`);
            }

            player.setVolume(amount / 100);
            await client.util.update(player, client);
            return await interaction.reply(`Volume amount set to \`[ ${amount}% ]\``);
        } else {
            return await interaction.reply(`Current player volume: \`[ ${Math.round(player.volume * 100)}% ]\``);
        }
    }
};