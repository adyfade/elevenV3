const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ai-dj")
        .setDescription("AI DJ plays music based on your vibe!"),

    async execute(interaction, client) {
        try {
            // Ensure the dispatcher is created and connected to a voice channel
            let dispatcher = client.dispatcher.players.get(
                interaction.guild.id,
            );
            if (!dispatcher) {
                dispatcher = await client.dispatcher.createPlayer({
                    guildId: interaction.guild.id,
                    voiceId: interaction.member.voice.channel.id,
                    textId: interaction.channel.id,
                    deaf: true,
                    shardId: interaction.guild.shardId,
                });
            }

            // DJ-style intro message
            const introEmbed = new EmbedBuilder()
                .setColor("#ff0000") // Replace with your desired color
                .setDescription(
                    `<a:DJ:1285294109975904347> **Yo, ${interaction.user.username}! I'm your AI DJ!**\nReady to set the vibe? Let's get started by choosing a language for the tunes.`,
                )
                .setFooter({ text: "Your AI DJ is ready to vibe!" });

            // Language selection menu
            const languageMenu = new StringSelectMenuBuilder()
                .setCustomId("language_select")
                .setPlaceholder("Select your vibe language")
                .addOptions([
                    { label: "Hindi Vibes", value: "hindi" },
                    { label: "English Vibes", value: "english" },
                ]);

            const languageRow = new ActionRowBuilder().addComponents(
                languageMenu,
            );

            // Send initial response with language selection menu
            const sentMessage = await interaction.reply({
                embeds: [introEmbed],
                components: [languageRow],
                fetchReply: true,
            });

            // Language selection collector
            const languageCollector =
                sentMessage.createMessageComponentCollector({
                    filter: (i) =>
                        i.customId === "language_select" &&
                        i.user.id === interaction.user.id,
                    time: 60000,
                });

            languageCollector.on("collect", async (interaction) => {
                const selectedLanguage = interaction.values[0];
                let playlistUrl;

                if (selectedLanguage === "hindi") {
                    playlistUrl = getRandomPlaylist([
                        "https://youtu.be/v9PpTZwEMwc?si=rCse6LhbEnOzCeTF",
                        "https://youtu.be/syvIGyt96mU?si=oWs6p6-GOF4skAnw",
                        "https://youtu.be/_HjM3Axb3z8?si=kMMnQFT15xyPGhBL",
                        "https://youtu.be/VKB4Q-rH3aE?si=N5Vx_bhCFdJvo-gS",
                    ]);
                } else if (selectedLanguage === "english") {
                    playlistUrl = getRandomPlaylist([
                        "https://youtu.be/kKaF-sjG06g?si=NDNslsDuIGpluqud",
                        "https://youtu.be/cg1OzpOcQqY?si=lMc2IWAyufx9WskQ",
                        "https://youtu.be/kKaF-sjG06g?si=NDNslsDuIGpluqud",
                        "https://youtu.be/cw93HyeOTeQ?si=BlpiGlyWGXmQOEyf",
                    ]);
                }

                // DJ-style response
                const djResponseEmbed = new EmbedBuilder()
                    .setColor("#ff0000") // Replace with your desired color
                    .setDescription(
                        `<a:DJ:1285294109975904347> **Awesome choice! Playing the best ${selectedLanguage} tunes for you, ${interaction.user.username}!**`,
                    )
                    .setFooter({ text: "Let the music flow!" });

                await interaction.update({
                    embeds: [djResponseEmbed],
                    components: [],
                });

                try {
                    const searchResult = await dispatcher.search(playlistUrl, {
                        requester: interaction.user,
                    });

                    if (
                        searchResult.type === "PLAYLIST" &&
                        searchResult.tracks.length > 0
                    ) {
                        dispatcher.queue.add(searchResult.tracks);
                        if (!dispatcher.playing && !dispatcher.paused)
                            dispatcher.play();
                        interaction.followUp(
                            `<:11tick:1288060052250431559> **Added ${searchResult.tracks.length} tracks to the queue!** Let's vibe!`,
                        );
                    } else if (
                        searchResult.type === "TRACK" &&
                        searchResult.tracks.length > 0
                    ) {
                        dispatcher.queue.add(searchResult.tracks);
                        if (!dispatcher.playing && !dispatcher.paused)
                            dispatcher.play();
                        interaction.followUp(
                            `<:11tick:1288060052250431559> **Added a track to the queue!** Time to enjoy the beats!`,
                        );
                    } else {
                        interaction.followUp(
                            "No tracks found in the selected playlist.",
                        );
                    }
                } catch (error) {
                    console.error("Error playing music:", error);
                    interaction.followUp(
                        "An error occurred while trying to play the music. Please try again later.",
                    );
                }
            });

            languageCollector.on("end", (collected) => {
                if (!collected.size) {
                    interaction.followUp(
                        "No language selected, AI-DJ command has been cancelled.",
                    );
                }
            });
        } catch (error) {
            console.error("Error in AI-DJ command:", error);
            interaction.reply("An error occurred while executing the command.");
        }
    },
};

function getRandomPlaylist(playlists) {
    const randomIndex = Math.floor(Math.random() * playlists.length);
    return playlists[randomIndex];
}
