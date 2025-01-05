const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Toggle Shuffle/Unshuffle the queue."),

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

        // Check if there are enough songs in the queue
        if (player.queue.size < 3) {
            return await interaction.reply({ content: "Not enough songs in the queue to shuffle.", ephemeral: true });
        }

        if (player.shuffle) {
            player.setUnshuffle();
            client.util.update(player, client);
            return await interaction.reply("Unshuffled the queue.");
        } else {
            player.setShuffle();
            client.util.update(player, client);
            return await interaction.reply("Shuffled the queue.");
        }
    },
};