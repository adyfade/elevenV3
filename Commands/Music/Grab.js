const { EmbedBuilder } = require('discord.js');
const { convertTime } = require('../../Utility/convert.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  name: 'grab',
  category: 'Music',
  description: '',
  aliases: [],
  args: false,
  usage: '',
  userPrams: [],
  cooldown: 5,
  botPrams: ['EmbedLinks'],
  dj: false,
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  async execute(client, message, args, prefix, color, dispatcher) {

    const embedColor = client.embedColor || color || '#FFFFFF'; 

    const player = client.dispatcher.players.get(message.guildId);

    if (!player || !player.queue.current) {
      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setAuthor({
          name: message.author.username || "Unknown User",
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription('<:nwrong:1275390590426812426> There is no player for this guild. Please connect by using the join command.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    const msg = await message.channel.send({
      content: "Trying to send...",
    });

    try {
      const song = player.queue.current;
      const total = song.duration;
      const current = player.position;

      const embed = new EmbedBuilder()
        .setDescription(`## Grabbed the current playing song!`)
        .addFields([
          { name: '**Title**', value: `[${song.title}](https://discord.gg/qZemu5SPjQ)`, inline: true },
          { name: '**Author**', value: `${song.author}`, inline: true },
          { name: `**Progress**`, value: `${convertTime(current)}/${moment.duration(total).format("hh:mm:ss")}`, inline: true },
        ])
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setAuthor({ name: `${client.user.username}`, iconURL: message.member.displayAvatarURL({ dynamic: true }) })
        .setColor(embedColor) 
        .setTimestamp();

      await message.author.send({ embeds: [embed] });
      msg.edit({ content: "<:tick_icon:1275390587801178123>  Message sent successfully.", embeds: [] });
    } catch (error) {
      console.error(error);
      msg.edit({ content: "<:nwrong:1275390590426812426> Couldn't send you a DM. Make sure your DMs are open and try again.", embeds: [] });
    }
  }
};
