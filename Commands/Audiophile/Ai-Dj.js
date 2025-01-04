const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "ai-dj",
    description: "AI DJ plays music based on your vibe!",
    category: "Music",
    cooldown: 5,
    usage: "",
    aliases: ["aidj"],
    examples: ["ai-dj"],
    sub_commands: [],
    args: false,
    permissions: {
        isPremium: false,
        client: [],
        user: [],
        dev: false,
        voteRequired: false,
    },
    player: { voice: true, active: false, dj: false, djPerm: true },

    async execute(client, message, args, prefix, color, dispatcher) {
        try {
            if (!dispatcher) {
                dispatcher = await client.dispatcher.createPlayer({
                    guildId: message.guildId,
                    voiceId: message.member.voice.channelId,
                    textId: message.channelId,
                    deaf: true,
                    shardId: message.guild.shardId,
                });

                dispatcher.metadata = { source: "AIDJMode" };
            }

            // Start with a DJ-style intro message
            const introEmbed = new EmbedBuilder()
                .setColor(color)
                .setDescription(`<a:DJ:1285294109975904347> **Yo, ${message.author.username}! I'm your AI DJ!**\nYour personal DJ for remix vibes! Ready to set the vibe? Let's get started by choosing a language for the tunes. Pick between Hindi or English, and the AI will queue up DJ-style remixes and upbeat tracks to get the party going in your voice channel. Perfect for instantly setting the mood!`)
                .setFooter({ text: 'Your AI DJ is ready to vibe!' });

            // Language selection menu
            const languageMenu = new StringSelectMenuBuilder()
                .setCustomId('language_select')
                .setPlaceholder('Select your vibe language')
                .addOptions([
                    { label: 'Hindi Vibes', value: 'hindi' },
                    { label: 'English Vibes', value: 'english' },
                ]);

            const languageRow = new ActionRowBuilder().addComponents(languageMenu);

            const sentMessage = await message.reply({ embeds: [introEmbed], components: [languageRow] });

            // Language selection collector
            const languageCollector = sentMessage.createMessageComponentCollector({
                filter: i => i.customId === 'language_select' && i.user.id === message.author.id,
                time: 60000,
            });

            languageCollector.on('collect', async interaction => {
                const selectedLanguage = interaction.values[0];
                let playlistUrl;

                if (selectedLanguage === 'hindi') {
                    playlistUrl = getRandomPlaylist([
                        'https://youtu.be/v9PpTZwEMwc?si=rCse6LhbEnOzCeTF',
                        'https://youtu.be/syvIGyt96mU?si=oWs6p6-GOF4skAnw',
                        'https://youtu.be/_HjM3Axb3z8?si=kMMnQFT15xyPGhBL',
                        'https://youtu.be/VKB4Q-rH3aE?si=N5Vx_bhCFdJvo-gS'
                    ]);
                } else if (selectedLanguage === 'english') {
                    playlistUrl = getRandomPlaylist([
                        'https://youtu.be/kKaF-sjG06g?si=NDNslsDuIGpluqud',
                        'https://youtu.be/cg1OzpOcQqY?si=lMc2IWAyufx9WskQ',
                        'https://youtu.be/kKaF-sjG06g?si=NDNslsDuIGpluqud',
                        'https://youtu.be/cw93HyeOTeQ?si=BlpiGlyWGXmQOEyf'
                    ]);
                }

                // DJ-style response
                const djResponseEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setDescription(`<a:DJ:1285294109975904347> **Awesome choice! Playing the best ${selectedLanguage} tunes for you, ${message.author.username}!**`)
                    .setFooter({ text: 'Let the music flow!' });

                await interaction.update({ embeds: [djResponseEmbed], components: [] });

                try {
                    const searchResult = await dispatcher.search(playlistUrl, { requester: message.author });

                    if (searchResult.type === 'PLAYLIST' && searchResult.tracks.length > 0) {
                        dispatcher.queue.add(searchResult.tracks);
                        if (!dispatcher.playing && !dispatcher.paused) dispatcher.play();
                        interaction.followUp(`<:11tick:1288060052250431559> **Added ${searchResult.tracks.length} tracks to the queue!** Let's vibe!`);
                    } else if (searchResult.type === 'TRACK' && searchResult.tracks.length > 0) {
                        dispatcher.queue.add(searchResult.tracks);
                        if (!dispatcher.playing && !dispatcher.paused) dispatcher.play();
                        interaction.followUp(`<:11tick:1288060052250431559> **Added a track to the queue!** Time to enjoy the beats!`);
                    } else {
                        interaction.followUp('No tracks found in the selected playlist.');
                    }
                } catch (error) {
                    console.error("Error playing music:", error);
                    interaction.followUp("An error occurred while trying to play the music. Please try again later.");
                }
            });

            languageCollector.on('end', collected => {
                if (!collected.size) {
                    message.reply("No language selected, AI-DJ command has been cancelled.");
                }
            });

        } catch (error) {
            console.error("Error in AI-DJ command:", error);
            message.reply("An error occurred while executing the command.");
        }
    }
};

function getRandomPlaylist(playlists) {
    const randomIndex = Math.floor(Math.random() * playlists.length);
    return playlists[randomIndex];
}
