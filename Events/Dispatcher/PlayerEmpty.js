const { EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');
const axios = require('axios');
const db2 = require("../../Utility/autoReconnect.js");
const { Token } = require('../../Config.js'); 

async function updateVoiceStatus(dispatcher, botToken, status) {
  try {
    await axios.put(
      `https://discord.com/api/v9/channels/${dispatcher.voiceId}/voice-status`,
      { status: status },
      {
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Failed to update voice status:", error);
  }
}

module.exports = {
  name: 'playerEmpty',

  async execute(client, dispatcher) {
    const status = "use 1p to get started";
    const botToken = Token;

    await updateVoiceStatus(dispatcher, botToken, status);

    const player = dispatcher.player;
    if (!player) {
      console.log("No player found.");
      return;
    }

    if (player.data instanceof Map) {
      const playerMessage = player.data.get('message');
      if (playerMessage && playerMessage.deletable) {
        playerMessage.delete().catch(() => null);
      }
    }

    let autoplay = 'false';
    try {
      if (client.datafunction && typeof client.datafunction.get === 'function') {
        autoplay = await client.datafunction.get(`auto_${player.guildId}`);
      }
    } catch (error) {
      console.error("Error retrieving autoplay status:", error);
    }

    if (autoplay === 'true') {
      const previousTrack = player.queue.previous;
      if (previousTrack) {
        const requester = previousTrack.requester;
        const search = `https://www.youtube.com/watch?v=${previousTrack.identifier}&list=RD${previousTrack.identifier}`;
        const response = await player.search(search, { requester });
        if (response && response.tracks.length > 0) {
          player.queue.add(response.tracks[Math.floor(Math.random() * response.tracks.length)]);
          player.play();
        }
      }
    }

    const guild = client.guilds.cache.get(player.guildId);
    if (!guild) {
      console.log("Guild not found.");
      return;
    }

    // Create buttons for the message
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(`https://discord.com/api/oauth2/authorize?client_id=1277525844319014955&permissions=8&scope=bot+applications.commands`).setLabel(`Invite me`),
      new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(`https://discord.gg/E6M6DnSwdt`).setLabel(`Vote Me`)
    );

    let TwoFourSeven;
    try {
      TwoFourSeven = await db2.findOne({ Guild: player.guildId });
      console.log(`24/7 mode status for guild ${player.guildId}:`, TwoFourSeven ? "Enabled" : "Disabled");
    } catch (error) {
      console.error("Error fetching 24/7 mode status from database:", error);
    }

    const embedDescription = TwoFourSeven
      ? `<:MekoTimer:1275458017055211703> Queue ended. 24/7 is **Enabled**, I am not leaving the voice channel.`
      : `<:MekoTimer:1275458017055211703> Queue ended. 24/7 is **Disabled**, I am leaving the voice channel.`;

    try {
      const channel = client.channels.cache.get(player.textId);
      if (!channel) {
        console.log(`Channel with ID ${player.textId} not found.`);
        return;
      }

      const embedColor = client.embedColor || 0x000000; // Fallback to black if embedColor is not set
      const embed = new EmbedBuilder()
        .setAuthor({
          name: client.user.username || "Unknown User",
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(embedDescription)
        .setTimestamp()
        .setColor(embedColor);

      const msg = await channel.send({
        embeds: [embed],
        components: [row],
      });

      setTimeout(() => {
        msg.delete().catch(() => {});
      }, 10000000);

    } catch (error) {
      console.error("Error sending embed message to channel:", error);
    }

    if (!TwoFourSeven) {
      console.log("24/7 mode is disabled, destroying player and leaving voice channel.");
      await player.destroy();
    } else {
      console.log("24/7 mode is enabled, staying in the voice channel.");
    }
  }
};
