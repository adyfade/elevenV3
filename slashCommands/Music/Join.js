const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("join")
        .setDescription("Make the bot join a voice channel."),

    /**
     * 
     * @param {import("discord.js").CommandInteraction} interaction 
     * @param {import("../../../Main")} client
     */

    async execute(interaction, client) {
        const member = interaction.member;
        const guild = interaction.guild;
        const color = client.config.EmbedColor;
        const voiceChannel = member.voice.channel;
        let dispatcher = client.dispatcher.players.get(guild.id);

        if (!voiceChannel) {
            return interaction.reply({
                embeds: [
                    client.embed().setColor(client.config.redColor).setDescription("You need to join a voice channel first."),
                ],
                ephemeral: true,
            });
        }

        if (dispatcher && guild.members.me.voice.channel) {
            return interaction.reply({
                embeds: [
                    client.embed().setColor(color).setDescription(`I'm already connected in ${guild.channels.cache.has(dispatcher.voiceId) ? `<#${dispatcher.voiceId}>` : '`Unknown Channel`'}`),
                ],
                ephemeral: true,
            });
        }

        if (!guild.members.me.voice.channel && !voiceChannel.joinable) {
            return interaction.reply({
                embeds: [
                    client.embed().setColor(client.config.redColor).setDescription("I can't join your voice channel because it's full."),
                ],
                ephemeral: true,
            });
        }

        if (!dispatcher) {
            dispatcher = await client.dispatcher.createPlayer({
                guildId: guild.id,
                voiceId: voiceChannel.id,
                textId: interaction.channel.id,
                deaf: true,
                shardId: guild.shardId,
            });
        }

        if (!dispatcher.textId) dispatcher.setTextChannel(interaction.channel.id);

        return interaction.reply({
            embeds: [
                client.embed().setColor(color).setDescription(`Joined ${voiceChannel}`),
            ],
        });
    },
};
