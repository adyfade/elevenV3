const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove")
        .setDescription("Removes tracks from the queue.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("track")
                .setDescription("Removes a specific track from the queue.")
                .addIntegerOption(option => 
                    option.setName("number")
                        .setDescription("The track number to remove")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("dupes")
                .setDescription("Removes duplicate tracks from the queue."))
        .addSubcommand(subcommand =>
            subcommand
                .setName("user")
                .setDescription("Removes all tracks requested by a specific user.")
                .addUserOption(option => 
                    option.setName("target")
                        .setDescription("The user whose tracks to remove")
                        .setRequired(true))),

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

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "track":
                return await this.removeTrack(interaction, player, client);
            case "dupes":
                return await this.removeDupes(interaction, player, client);
            case "user":
                return await this.removeUserTracks(interaction, player, client);
        }
    },

    async removeTrack(interaction, player, client) {
        if (!player.queue.size) {
            return await interaction.reply({ content: "Don't have enough tracks left in the queue to remove.", ephemeral: true });
        }

        const trackNumber = interaction.options.getInteger("number");

        if (trackNumber <= 0 || trackNumber > player.queue.size) {
            return await interaction.reply({ content: "Please provide a valid track number to remove.", ephemeral: true });
        }

        player.queue.splice(trackNumber - 1, 1);
        await client.util.update(player, client);
        return await interaction.reply(`Removed track number \`[ ${trackNumber} ]\` from the queue.`);
    },

    async removeDupes(interaction, player, client) {
        if (!player.queue.size) {
            return await interaction.reply({ content: "Don't have enough tracks left in the queue to remove duplicates.", ephemeral: true });
        }

        const notDuplicatedTracks = [];
        let duplicatedTracksCount = 0;

        for (let track of player.queue) {
            if (notDuplicatedTracks.length <= 0) notDuplicatedTracks.push(track);
            else {
                let duplicate = notDuplicatedTracks.find((x) => x.title === track.title || x.uri === track.uri);
                if (!duplicate) notDuplicatedTracks.push(track);
                else ++duplicatedTracksCount;
            }
        }

        if (duplicatedTracksCount <= 0) {
            return await interaction.reply({ content: "Didn't find any duplicated tracks in the queue to remove.", ephemeral: true });
        }

        player.queue.clear();
        player.queue.add(notDuplicatedTracks);
        await client.util.update(player, client);
        return await interaction.reply(`Removed \`[ ${duplicatedTracksCount} ]\` duplicated tracks from the queue.`);
    },

    async removeUserTracks(interaction, player, client) {
        if (!player.queue.size) {
            return await interaction.reply({ content: "Don't have enough tracks left in the queue to remove.", ephemeral: true });
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return await interaction.reply({ content: "You don't have enough permissions to use this command.", ephemeral: true });
        }

        const targetMember = interaction.options.getMember("target");
        let count = 0;
        let queue = [];

        for (const track of player.queue) {
            if (track.requester && track.requester.id !== targetMember.id) {
                queue.push(track);
            } else {
                ++count;
            }
        }

        if (count <= 0) {
            return await interaction.reply({ content: `Couldn't find any tracks requested by <@${targetMember.id}> in the queue.`, ephemeral: true });
        }

        player.queue.clear();
        player.queue.add(queue);
        await client.util.update(player, client);
        return await interaction.reply(`Removed \`[ ${count} ]\` track(s) requested by <@${targetMember.id}> from the queue.`);
    }
};