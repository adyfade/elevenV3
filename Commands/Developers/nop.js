const { EmbedBuilder } = require(`discord.js`);
const db = require(`../../Models/noprefix.js`);
module.exports = {
    name: `noprefix`,
    aliases: ["anp"],
    category: "Owner",
    description: "No prefix toggling",
    owner: true,
    async execute(client, message, args, prefix, color) {
        let carli = ["747321055319949312", "1131610350886846655", "1092374628556615690"];
        if (!carli.includes(message.author.id)) return;

        if (!args[0]) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            message.guild.members.me.displayHexColor !==
                                `0020ff`
                                ? message.guild.members.me.displayHexColor
                                : `#2500ff`,
                        )
                        .setDescription(
                            `<:cross_:1083758026948886618> | Correct Usage : \`${prefix}noprefix <add/remove>\` <user>\``,
                        ),
                ],
            });
        }

        let opt = args[0].toLowerCase();

        if (opt === `add`) {
            const user =
                message.mentions.members.first() ||
                message.guild.members.cache.get(args[0]) ||
                client.users.cache.get(args[1]);
            if (!user)
                return message.reply({ content: `Provide me a valid user` });

            let npData = await db.findOne({ userId: user.id, noprefix: true });
            if (npData)
                return message.reply({
                    content: `${user.tag} is Already in my Noprefix`,
                });
            else {
                const data = await db.create({
                    userId: user.id,
                    noprefix: true,
                });

                return message.reply({
                    content: `Added ${user.tag} to my Noprefix`,
                });
            }
        }
        if (opt === `remove`) {
            let user =
                message.mentions.members.first() ||
                message.guild.members.cache.get(args[0]) ||
                client.users.cache.get(args[1]);
            if (!user)
                return message.reply({ content: `Provide me a valid user` });

            let npData = await db.findOne({ userId: user.id, noprefix: true });
            if (!npData)
                return message.reply({
                    content: `${user.tag} is not in My Noprefix`,
                });

            await db.deleteOne({ userId: user.id, noprefix: true });
            return message.reply({
                content: `Removed Noprefix from ${user.tag}`,
            });
        }

        if (
            args[0].toLowerCase() === `list` ||
            args[0].toLowerCase() === `show`
        ) {
            let data = await db.find({ noprefix: true });
            let list = [];
            data.forEach((x) => list.push(x.userId));
            if (!list.length)
                return message.reply({
                    content: `There is no user in my noprefix`,
                });

            let stats = [];
            let us;
            for (let i = 0; i < list.length; i++) {
                us = await client.users.fetch(list[i]);
                stats.push(
                    `[\`${i + 1}\`] [${us.tag}](https://discord.com/${us.id}) (ID: ${us.id})`,
                );
            }

            if (stats.length < 11) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(`#2f3136`)
                            .setDescription(`${stats.sort().join("\n")}`),
                    ],
                });
            } else {
                return;
            }
        }
    },
};
