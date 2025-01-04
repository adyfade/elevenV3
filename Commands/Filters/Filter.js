const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = {
    name: "filters",
    category: "Music",
    aliases: ["eq", "equalizer"],
    description: "Sets the bot's sound filter.",
    args: false,
    usage: "",
    userPerms: [],
    permissions: {
        isPremium: false,
        client: [],
        user: [],
        dev: false,
        voteRequired: false,
    },
    player: { voice: true, active: true, dj: true, djPerm: null },

    /**
     *
     * @param {import("../../../Main")} client
     * @param {import("discord.js").Message} message
     * @param {String[]} args
     * @param {String} prefix
     * @param {String} color
     * @param {import('kazagumo').KazagumoPlayer} dispatcher
     */
    async execute(client, message, args, prefix, color, dispatcher) {
        const player = client.dispatcher.players.get(message.guild.id);
        if (!player.queue.current) {
            let thing = new EmbedBuilder()
                .setColor("Red")
                .setDescription("There is no music playing.");
            return message.reply({ embeds: [thing] });
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setDescription(`Select your preferred sound filter below.`);

        const buttons = [
            new ButtonBuilder()
                .setCustomId("clear")
                .setLabel("Clear")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId("bass")
                .setLabel("Bass")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("nightcore")
                .setLabel("Nightcore")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("pitch")
                .setLabel("Pitch")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("distort")
                .setLabel("Distort")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("equalizer")
                .setLabel("Equalizer")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("8d")
                .setLabel("8D")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("boost")
                .setLabel("Bass Boost")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("speed")
                .setLabel("Speed")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("vaporwave")
                .setLabel("Vaporwave")
                .setStyle(ButtonStyle.Primary),
        ];

        const row1 = new ActionRowBuilder().addComponents(buttons.slice(0, 5));
        const row2 = new ActionRowBuilder().addComponents(buttons.slice(5));

        const msg = await message.reply({
            embeds: [embed],
            components: [row1, row2],
        });

        const collector = msg.createMessageComponentCollector({ time: 60000 });

        collector.on("collect", async (interaction) => {
            if (interaction.user.id !== message.author.id) return;

            await interaction.deferUpdate();

            let response = new EmbedBuilder().setColor(color);

            switch (interaction.customId) {
                case "clear":
                    await player.clearEffects();
                    response.setDescription(`All filters have been cleared.`);
                    break;
                case "bass":
                    await player.setBassboost(true);
                    response.setDescription(`Bass boost is now enabled.`);
                    break;
                case "nightcore":
                    await player.setNightcore(true);
                    response.setDescription(`Nightcore is now enabled.`);
                    break;
                case "pitch":
                    await player.setPitch(2);
                    response.setDescription(`Pitch adjustment is now enabled.`);
                    break;
                case "distort":
                    await player.setDistortion(true);
                    response.setDescription(`Distortion is now enabled.`);
                    break;
                case "equalizer":
                    await player.setEqualizer(true);
                    response.setDescription(`Equalizer is now enabled.`);
                    break;
                case "8d":
                    await player.set8D(true);
                    response.setDescription(`8D audio is now enabled.`);
                    break;
                case "boost":
                    const bands = new Array(7)
                        .fill(null)
                        .map((_, i) => ({ band: i, gain: 0.25 }));
                    await player.setEQ(...bands);
                    response.setDescription(
                        `Bass boost equalizer is now enabled.`,
                    );
                    break;
                case "speed":
                    await player.setSpeed(2);
                    response.setDescription(`Speed adjustment is now enabled.`);
                    break;
                case "vaporwave":
                    await player.setVaporwave(true);
                    response.setDescription(`Vaporwave is now enabled.`);
                    break;
            }

            await msg.edit({ embeds: [embed], components: [row1, row2] });
            await interaction.followUp({ embeds: [response], ephemeral: true });
        });

        collector.on("end", () => {
            msg.edit({ components: [] });
        });
    },
};
