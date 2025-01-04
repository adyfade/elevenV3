const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "sleep",
  description: "Sets a sleep timer to stop the music after a specified time.",
  category: "Music",
  cooldown: 10,
  usage: "<duration>",
  aliases: ["slpt"],
  examples: ["sleep 10m", "sleep 30m", "sleep 1h"],
  sub_commands: [],
  args: true,
  permissions: {
    isPremium: false,
    client: [],
    user: [],
    dev: false,
    voteRequired: false,
  },
  player: { voice: true, active: true, dj: false, djPerm: true },
  async execute(client, message, args, prefix, color, dispatcher) {
    if (!dispatcher) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription("No music is currently playing.")
        ],
      });
    }

    const time = args[0].toLowerCase();
    const duration = parseDuration(time);
    if (!duration) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription("Invalid duration. Please use formats like `10m`, `30m`, or `1h`.")
        ],
      });
    }

    // Clear any existing sleep timer
    if (dispatcher.sleepTimer) {
      clearTimeout(dispatcher.sleepTimer);
    }

    // Set new sleep timer
    dispatcher.sleepTimer = setTimeout(() => {
      dispatcher.stop();
      message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription("Music stopped automatically as per the sleep timer.")
        ],
      });
    }, duration);

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(color)
          .setDescription(`Sleep timer set for ${formatDuration(duration)}. Music will stop after this duration.`)
      ],
    });
  },
};

function parseDuration(duration) {
  const match = duration.match(/^(\d+)(m|h)$/);
  if (!match) return null;

  const [, time, unit] = match;
  const value = parseInt(time, 10);

  switch (unit) {
    case 'm': return value * 60 * 1000; // minutes to milliseconds
    case 'h': return value * 60 * 60 * 1000; // hours to milliseconds
    default: return null;
  }
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
}