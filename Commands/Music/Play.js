const { WebhookClient, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "play",
    description: "Plays a song from the given query/link.",
    category: "Music",
    cooldown: 5,
    usage: "<query>",
    aliases: ["p"],
    examples: ["play ncs"],
    sub_commands: [],
    args: true,
    permissions: {
        isPremium: false,
        client: [],
        user: [],
        dev: false,
        voteRequired: false,
    },
    player: { voice: true, active: false, dj: false, djPerm: true },

    async execute(client, message, args, prefix, color, dispatcher) {
        const webhookClient = new WebhookClient({ url: 'https://discord.com/api/webhooks/1277936040283209841/BapDNKvKXpzIn2CkXfnZOXmRW3Kh38zVZ6nIsu86ENGmO7k8V0RrwYgUaz3Gtj84L9Zz' });

        webhookClient.send({
            embeds: [
                new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('Command Used')
                    .setDescription(`User **${message.author.tag}** (ID: ${message.author.id}) used the \`play\` command.`)
                    .addFields({ name: 'Server', value: `${message.guild.name}`, inline: true })
                    .setTimestamp()
            ]
        });

        try {
            if (/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi.test(args.join(" "))) {
                return message.reply({
                    embeds: [
                        client.embed()
                            .setColor(color)
                            .setDescription("As of recent events we've removed YouTube as a supported platform from Main."),
                    ],
                });
            }

            const query = args.join(" ");

            if (!dispatcher) {
                dispatcher = await client.dispatcher.createPlayer({
                    guildId: message.guild.id,
                    voiceId: message.member.voice.channel.id,
                    textId: message.channel.id,
                    deaf: true,
                });
            }

            if (!dispatcher.textId) dispatcher.setTextChannel(message.channel.id);

            const { tracks, type, playlistName } = await dispatcher.search(query, { requester: message.author });

            if (!tracks.length) {
                return message.reply({
                    embeds: [
                        client.embed()
                            .setColor(color)
                            .setDescription("No songs found."),
                    ],
                });
            }

            if (type === "PLAYLIST") {
                for (const track of tracks) {
                    dispatcher.queue.add(track);
                    client.util.update(dispatcher, client);
                }
                if (!dispatcher.playing && !dispatcher.paused) dispatcher.play();

                return message.reply({
                    embeds: [
                        client.embed()
                            .setColor(color)
                            .setDescription(`<:11tick:1288060052250431559> ${message.author} added "**${tracks[0].title.length > 15 ? tracks[0].title.substring(0, 15) + "..." : tracks[0].title}**" to queue`),
                    ],
                });
            } else {
                dispatcher.queue.add(tracks[0]);
                client.util.update(dispatcher, client);
                if (!dispatcher.playing && !dispatcher.paused) dispatcher.play();

                return message.reply({
                    embeds: [
                        client.embed()
                            .setColor(color)
                            .setDescription(`<:11tick:1288060052250431559> ${message.author} Successfully added **${tracks[0].title.length > 15 ? tracks[0].title.substring(0, 15) + "..." : tracks[0].title}** to queue`),
                    ],
                });
            }
        } catch (error) {
            webhookClient.send({
                content: `Error occurred for user **${message.author.tag}** (ID: ${message.author.id}): \`\`\`${error.message}\`\`\``,
            }).catch(console.error);
            console.error(error);
        }
    },
};
