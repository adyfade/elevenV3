const { EmbedBuilder } = require("discord.js");
const db = require("../../Models/Playlist.js");
const lodash = require("lodash");

module.exports = new Object({
  name: "playlist-list",
  description: "Gives you the list of your playlists.",
  category: "Playlist",
  cooldown: 5,
  usage: "",
  aliases: ["pl-list"],
  examples: ["playlist-list"],
  sub_commands: [],
  args: false,
  permissions: {
      isPremium: false,
      client: [],
      user: [],
      dev: false,
      voteRequired: false
  },
  player: { voice: false, active: false, dj: false, djPerm: null },

  async execute(client, message, args, prefix, color, dispatcher) {
    let data = await db.find({ UserId: message.author.id });
    if (!data.length) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription(`You Do Not Have Any Playlist`),
        ],
      });
    }
    if (!args[0]) {
      let list = data.map(
        (x, i) =>
          `\`${++i}\` - ${x.PlaylistName} \`${x.Playlist.length}\` - <t:${x.CreatedOn}>`,
      );
      const pages = lodash.chunk(list, 10).map((x) => x.join("\n"));
      let page = 0;
      let List = list.length;

      const embeds = new EmbedBuilder()
        .setAuthor({
          name: `${message.author.username}'s Playlists`,
          iconURI: message.author.displayAvatarURL(),
        })
        .setDescription(pages[page])
        .setFooter({ text: `Playlist (${List} / 10)` })
        .setColor(color);
      return await message.channel.send({ embeds: [embeds] });
}
  },
});