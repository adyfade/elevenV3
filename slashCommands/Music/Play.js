import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song from YouTube, Spotify, or other sources')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('Song name, URL, or search query')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addBooleanOption(option =>
            option
                .setName('shuffle')
                .setDescription('Shuffle the playlist if adding multiple tracks')
                .setRequired(false)
        ),

    category: 'Music',
    cooldown: 3,
    
    permissions: {
        user: [],
        bot: ['Connect', 'Speak'],
        dj: false
    },

    player: {
        voice: true,
        dj: false,
        active: false,
        djPerm: null
    },

    /**
     * Execute the play command
     * @param {import('discord.js').ChatInputCommandInteraction} interaction 
     * @param {import('../../index.js').default} client 
     */
    async execute(interaction, client) {
        try {
            await interaction.deferReply();

            const query = interaction.options.getString('query');
            const shuffle = interaction.options.getBoolean('shuffle') ?? false;
            const member = interaction.member;
            const guild = interaction.guild;

            // Voice channel validation
            if (!member.voice?.channel) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription('❌ You need to be in a voice channel to play music!')
                    ]
                });
            }

            // Bot permissions check
            const permissions = member.voice.channel.permissionsFor(guild.members.me);
            if (!permissions.has(['Connect', 'Speak'])) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription('❌ I need `Connect` and `Speak` permissions in your voice channel!')
                    ]
                });
            }

            // Get or create player
            let player = client.kazagumo.players.get(guild.id);
            
            if (!player) {
                player = await client.kazagumo.createPlayer({
                    guildId: guild.id,
                    textId: interaction.channel.id,
                    voiceId: member.voice.channel.id,
                    volume: 80,
                    deaf: true
                });
            }

            // Search for tracks
            const searchResult = await player.search(query, { requester: interaction.user });

            if (!searchResult.tracks.length) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription(`❌ No results found for: \`${query}\``)
                    ]
                });
            }

            // Handle different result types
            let addedTracks = 0;
            let playlistName = null;

            if (searchResult.type === 'PLAYLIST') {
                const tracks = shuffle ? this.shuffleArray([...searchResult.tracks]) : searchResult.tracks;
                
                for (const track of tracks) {
                    player.queue.add(track);
                    addedTracks++;
                }
                
                playlistName = searchResult.playlistName;
            } else {
                player.queue.add(searchResult.tracks[0]);
                addedTracks = 1;
            }

            // Start playing if not already playing
            if (!player.playing && !player.paused) {
                await player.play();
            }

            // Create response embed
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({
                    name: 'Music Player',
                    iconURL: client.user.displayAvatarURL()
                })
                .setTimestamp();

            if (searchResult.type === 'PLAYLIST') {
                embed
                    .setTitle('📋 Playlist Added')
                    .setDescription(`Added **${addedTracks}** tracks from playlist: **${playlistName}**`)
                    .addFields([
                        {
                            name: '🎵 First Track',
                            value: `[${searchResult.tracks[0].title}](${searchResult.tracks[0].uri})`,
                            inline: true
                        },
                        {
                            name: '⏱️ Duration',
                            value: this.formatDuration(searchResult.tracks[0].length),
                            inline: true
                        },
                        {
                            name: '👤 Requested by',
                            value: interaction.user.toString(),
                            inline: true
                        }
                    ]);
            } else {
                const track = searchResult.tracks[0];
                embed
                    .setTitle('🎵 Track Added')
                    .setDescription(`[${track.title}](${track.uri})`)
                    .setThumbnail(track.thumbnail)
                    .addFields([
                        {
                            name: '👨‍🎤 Artist',
                            value: track.author || 'Unknown',
                            inline: true
                        },
                        {
                            name: '⏱️ Duration',
                            value: track.isStream ? '🔴 Live' : this.formatDuration(track.length),
                            inline: true
                        },
                        {
                            name: '📍 Position',
                            value: `${player.queue.size}`,
                            inline: true
                        }
                    ]);
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Play command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while trying to play the track. Please try again.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    /**
     * Handle autocomplete for search queries
     * @param {import('discord.js').AutocompleteInteraction} interaction 
     * @param {import('../../index.js').default} client 
     */
    async autocomplete(interaction, client) {
        try {
            const focusedValue = interaction.options.getFocused();
            
            if (focusedValue.length < 3) {
                return await interaction.respond([]);
            }

            // Get player for search
            let player = client.kazagumo.players.get(interaction.guild.id);
            
            if (!player) {
                // Create temporary player for search
                player = await client.kazagumo.createPlayer({
                    guildId: interaction.guild.id,
                    textId: interaction.channel.id,
                    voiceId: interaction.member.voice?.channel?.id || null
                });
            }

            const searchResult = await player.search(focusedValue, { requester: interaction.user });
            
            const choices = searchResult.tracks.slice(0, 25).map(track => ({
                name: `${track.title} - ${track.author}`.substring(0, 100),
                value: track.uri
            }));

            await interaction.respond(choices);
            
        } catch (error) {
            console.error('Autocomplete error:', error);
            await interaction.respond([]);
        }
    },

    /**
     * Shuffle an array
     * @param {Array} array 
     * @returns {Array}
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * Format duration from milliseconds
     * @param {number} ms 
     * @returns {string}
     */
    formatDuration(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor(ms / (1000 * 60 * 60));

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
};