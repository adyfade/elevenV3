const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('radio')
        .setDescription('Play a radio station based on a category.'),

    async execute(interaction, client) {
        try {
            // Ensure the dispatcher is created and connected to a voice channel
            let dispatcher = client.dispatcher.players.get(interaction.guild.id);
            if (!dispatcher) {
                dispatcher = await client.dispatcher.createPlayer({
                    guildId: interaction.guild.id,
                    voiceId: interaction.member.voice.channel.id,
                    textId: interaction.channel.id,
                    deaf: true,
                    shardId: interaction.guild.shardId,
                });
            }

            // Create the language selection menu
            const languageMenu = new StringSelectMenuBuilder()
                .setCustomId('language_select')
                .setPlaceholder('Choose a language')
                .addOptions([
                    { label: 'Hindi', value: 'hindi' },
                    { label: 'English', value: 'english' },
                ]);

            const languageRow = new ActionRowBuilder().addComponents(languageMenu);

            const languageEmbed = new EmbedBuilder()
                .setColor('#ff0000') // Replace with your desired color
                .setDescription('<a:arrow:1276458122734469161> Select a language to start a radio station.');

            // Send the initial response with the language selection menu
            const sentMessage = await interaction.reply({ embeds: [languageEmbed], components: [languageRow], fetchReply: true });

            // Create a collector for language selection
            const languageCollector = sentMessage.createMessageComponentCollector({
                filter: i => i.customId === 'language_select' && i.user.id === interaction.user.id,
                time: 60000,
            });

            languageCollector.on('collect', async interaction => {
                const selectedLanguage = interaction.values[0];

                let categoryOptions = [];

                if (selectedLanguage === 'hindi') {
                    categoryOptions = [
                        { label: 'Romantic', value: 'hindi_romantic' },
                        { label: 'Sad Lofi', value: 'hindi_sad_lofi' },
                        { label: 'Hindi Phonk', value: 'hindi_phonk' },
                    ];
                } else if (selectedLanguage === 'english') {
                    categoryOptions = [
                        { label: 'Sad Lofi', value: 'english_sad_lofi' },
                        { label: 'Phonk', value: 'english_phonk' },
                        { label: 'Love', value: 'english_love' },
                        { label: 'Joy Mood', value: 'english_joy_mood' },
                    ];
                }

                // Create and send the category selection menu
                const categoryMenu = new StringSelectMenuBuilder()
                    .setCustomId('category_select')
                    .setPlaceholder('Choose a music category')
                    .addOptions(categoryOptions);

                const categoryRow = new ActionRowBuilder().addComponents(categoryMenu);

                const categoryEmbed = new EmbedBuilder()
                    .setColor('#ff0000') // Replace with your desired color
                    .setDescription(`<a:arrow:1276458122734469161> Select a music category from the dropdown for ${selectedLanguage} songs.`);

                await interaction.update({ embeds: [categoryEmbed], components: [categoryRow] });

                // Create a collector for category selection
                const categoryCollector = sentMessage.createMessageComponentCollector({
                    filter: i => i.customId === 'category_select' && i.user.id === interaction.user.id,
                    time: 60000,
                });

                categoryCollector.on('collect', async interaction => {
                    const selectedCategory = interaction.values[0];

                    let playlistUrl;

                    switch (selectedCategory) {
                        case 'hindi_romantic':
                            playlistUrl = getRandomPlaylist([
                                'https://youtube.com/playlist?list=PL0Z67tlyTaWphlJ8dod2fSFGmBlUW_KJJ&si=_zEeFTvZ2oH1sGof',
                                'https://youtube.com/playlist?list=PL9bw4S5ePsEGpT9PdWJYN8joMa2eWAxJf&si=_NSM_tyQU-lpbUk-',
                                'https://youtube.com/playlist?list=PLwgf_2_aBmU1kYCWHfvX9kVhKoof35qzg&si=uYjvFI2U8oGQrkfS'
                            ]);
                            break;
                        case 'hindi_sad_lofi':
                            playlistUrl = getRandomPlaylist([
                                'https://youtube.com/playlist?list=PLLlb2C74bLzdu9dUe9QiuCMq-cLJtIbDZ&si=_uN1g4BEyIJF0Pxo',
                                'https://youtube.com/playlist?list=PLy9LxOt0295cQMIj8aANhWjCLFMWnzO-h&si=D2vJWdNRPoX1g46w',
                                'https://youtube.com/playlist?list=PLLlb2C74bLzcvPjI7wiz0OlhSNdrZ-mdG&si=XpxsiLL8YfqD_ooa'
                            ]);
                            break;
                        case 'hindi_phonk':
                            playlistUrl = getRandomPlaylist([
                                'https://youtube.com/playlist?list=PLyi91ahgIv6Z2bTxZTpK2UXh29EXEWDpj&si=ugABgcRKiuptPJ36'
                            ]);
                            break;
                        case 'english_sad_lofi':
                            playlistUrl = getRandomPlaylist([
                                'https://youtube.com/playlist?list=PL0htMPdbfII_oBrA3YPAa2Pm2CJhNv-pY&si=KxzCdRBHPt_SiIuV',
                                'https://youtube.com/playlist?list=PLxvZHpjP7mY2BflBU_ER_RyUHlwnFiqd2&si=e0vraQsjGKxaIRp9',
                                'https://youtube.com/playlist?list=PL1y8hJl4KWcQwFEaBFTgxwhNQwE5SinuO&si=VEUNG1tc8ZGy4AYx'
                            ]);
                            break;
                        case 'english_phonk':
                            playlistUrl = getRandomPlaylist([
                                'https://youtube.com/playlist?list=PLxA687tYuMWi0Y7IH_26zAoggUxa7unMc&si=sSIU-Ji4RzrufcJM',
                                'https://youtube.com/playlist?list=PL3SoH6sImC4reSFT3r25nJGkfnSO4m2_V&si=14BdVzNc3T6hd2iG'
                            ]);
                            break;
                        case 'english_joy_mood':
                            playlistUrl = getRandomPlaylist([
                                'https://youtube.com/playlist?list=PLvPjBbFpr-O1azdoLQpxSt9nX5twB3kky&si=Ht-GlTlhUeSsfMVd',
                                'https://youtube.com/playlist?list=PLfQAe5M2BkwCKimscRq-F9wkO5tUPY9TS&si=YD6oZGdD507GsTYQ' 
                            ]);
                            break;
                        case 'english_love':
                            playlistUrl = getRandomPlaylist([
                                'https://youtube.com/playlist?list=PLgzTt0k8mXzE6H9DDgiY7Pd8pKZteis48&si=eZpGjEx7GnykBZpr',
                                'https://youtube.com/playlist?list=PLSeo7JXuXJvfRzisOQwyNQ5XGDsNMLIaf&si=6I9esWp2SzbPiNsE'
                            ]);
                            break;
                        default:
                            return interaction.reply('Invalid category selected.');
                    }

                    await interaction.reply(`<a:google_search:1275390604867665950> Playing ${selectedCategory.replace('_', ' ')} music`);

                    try {
                        // Fetch tracks from YouTube playlist
                        const searchResult = await dispatcher.search(playlistUrl, { requester: interaction.user });

                        if (searchResult.type === 'PLAYLIST' && searchResult.tracks.length > 0) {
                            dispatcher.queue.add(searchResult.tracks);
                            if (!dispatcher.playing && !dispatcher.paused) dispatcher.play();
                            interaction.followUp('Added tracks to the queue.');
                        } else if (searchResult.type === 'TRACK' && searchResult.tracks.length > 0) {
                            dispatcher.queue.add(searchResult.tracks);
                            if (!dispatcher.playing && !dispatcher.paused) dispatcher.play();
                            interaction.followUp('Added tracks to the queue.');
                        } else {
                            interaction.followUp('No tracks found in the selected playlist.');
                        }
                    } catch (error) {
                        console.error("Error playing music:", error);
                        interaction.followUp("An error occurred while trying to play the music. Please try again later.");
                    }
                });

                categoryCollector.on('end', collected => {
                    if (!collected.size) {
                        interaction.followUp("No category selected, radio command has been cancelled.");
                    }
                });
            });

            languageCollector.on('end', collected => {
                if (!collected.size) {
                    interaction.followUp("No language selected, radio command has been cancelled.");
                }
            });

        } catch (error) {
            console.error("Error in radio command:", error);
            interaction.reply("An error occurred while executing the command.");
        }
    },
};

function getRandomPlaylist(playlists) {
    const randomIndex = Math.floor(Math.random() * playlists.length);
    return playlists[randomIndex];
}
