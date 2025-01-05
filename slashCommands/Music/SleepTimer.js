const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sleep")
        .setDescription("Sets a sleep timer to stop the music after a specified time.")
        .addStringOption(option => 
            option.setName("duration")
                .setDescription("Duration of the sleep timer (e.g., 10m, 30m, 1h)")
                .setRequired(true)),

    async execute(interaction, client) {
        // Check if the user is in a voice channel
        if (!interaction.member.voice.channel) {
            return await interaction.reply({ content: "You need to be in a voice channel to use this command!", ephemeral: true });
        }

        // Get the player
        const player = client.kazagumo.players.get(interaction.guildId);

        if (!player) {
            return await interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor(client.config.color)
                    .setDescription("No music is currently playing.")],
                ephemeral: true 
            });
        }

        const time = interaction.options.getString("duration").toLowerCase();
        const duration = parseDuration(time);

        if (!duration) {
            return await interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor(client.config.color)
                    .setDescription("Invalid duration. Please use formats like `10m`, `30m`, or `1h`.")],
                ephemeral: true 
            });
        }

        // Set the sleep timer
        setTimeout(() => {
            player.stop();
            interaction.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(client.config.color)
                    .setDescription("Music stopped automatically as per the sleep timer.")]
            });
        }, duration);

        return await interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`Sleep timer set for ${time}. Music will stop after this duration.`)]
        });
    },
};

function parseDuration(duration) {
    const match = duration.match(/^(\d+)(m|h)$/);
    if (!match) return null;

    const [, time, unit] = match;
    const numericTime = parseInt(time, 10);

    if (isNaN(numericTime) || numericTime <= 0) return null;

    if (unit === "m") {
        return numericTime * 60 * 1000; // minutes to milliseconds
    } else if (unit === "h") {
        return numericTime * 60 * 60 * 1000; // hours to milliseconds
    }

    return null;
}