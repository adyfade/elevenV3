const { EmbedBuilder } = require("discord.js");
const db = require("../../Models/Playlist.js");

module.exports = new Object({
  name: "playlist-delete",
  description: "Deletes a playlist.",
  category: "Playlist",
  cooldown: 5,
  usage: "<playlist name>",
  aliases: ["pl-delete"],
  examples: ["playlist-delete myPlaylist"],
  sub_commands: [],
  args: true,
  permissions: {
      isPremium: false,
      client: [],
      user: [],
      dev: false,
      voteRequired: false
  },
  player: { voice: false, active: false, dj: false, djPerm: null },

  async execute(client, message, args, prefix, color, dispatcher) {
    const Name = args[0];
    const data = await db.findOne({
      UserId: message.author.id,
      PlaylistName: Name,
    });
    if (!data) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription(`You don't have a playlist with **${Name}** name`),
        ],
      });
    }
    if (data.length == 0) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription(`You don't have a playlist with **${Name}** name`),
        ],
      });
    }
    await data.delete();
    const embed = new EmbedBuilder()
      .setColor(color)
      .setDescription(`Successfully deleted ${Name} playlist`);
    return message.channel.send({ embeds: [embed] });
  },
});
