const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("seek")
        .setDescription("Seeks the current playing track to given time.")
        .addStringOption(option => 
            option.setName("time")
                .setDescription("The time to seek to (format: 1:34)")
                .setRequired(true)),

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

        if (!player.queue.current.isSeekable) {
            return await interaction.reply({ content: "This track isn't seekable.", ephemeral: true });
        }

        const time = interaction.options.getString("time");

        if (!/^[0-5]?[0-9](:[0-5][0-9]){1,2}$/.test(time)) {
            return await interaction.reply({ content: 'You provided an invalid duration. Valid duration e.g. `1:34`.', ephemeral: true });
        }

        const ms = time.split(':').map(Number).reduce((a, b) => a * 60 + b, 0) * 1000;

        if (ms > player.queue.current.length) {
            return await interaction.reply({ content: "The duration you provided exceeds the duration of the current track.", ephemeral: true });
        }

        await player.seek(ms);
        return await interaction.reply(`Seeked to \`${time}\`.`);
    },
};