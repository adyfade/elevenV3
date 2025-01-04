const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'skipto',
  category: 'Music',
  aliases: ["move", "jump"],
  description: 'Skip to a specific position in the queue.',
  args: true,
  usage: '[position]',
  userPrams: [],
  cooldown: 5,
  botPrams: ['EmbedLinks'],
  dj: false,
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  async execute(client, message, args, prefix, color) {

    const embedColor = client.embedColor || '#0099ff'; 

    const player = client.dispatcher.players.get(message.guildId);

    if (!player || !player.queue.current) {
      const noPlayerEmbed = new EmbedBuilder()
        .setColor(embedColor)
        .setAuthor({
          name: message.author.username || "Unknown User",
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription('There is no player for this guild. Please connect by using the join command.')
        .setTimestamp();
      return message.reply({ embeds: [noPlayerEmbed] });
    }

    const position = parseInt(args[0], 10);

    if (isNaN(position) || position <= 0 || position > player.queue.length) {
      const invalidPositionEmbed = new EmbedBuilder()
        .setColor(embedColor)
        .setAuthor({
          name: message.author.username || "Unknown User",
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription('Please provide a valid number from the queue!')
        .setTimestamp();
      return message.reply({ embeds: [invalidPositionEmbed] });
    }

    if (position === 1) {
      player.skip();
    } else {
      player.queue.splice(0, position - 1);
      await player.skip();
    }

    const successEmbed = new EmbedBuilder()
      .setColor(embedColor)
      .setAuthor({
        name: message.author.username || "Unknown User",
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(`Successfully skipped **${position}** track(s) from the queue.`)
      .setTimestamp();

    return message.reply({ embeds: [successEmbed] });
  }
};
