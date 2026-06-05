import { SlashCommandBuilder, ActivityType } from 'discord.js';
import { botConfig, getColor } from '../../config/botConfig.js';

export const data = new SlashCommandBuilder()
  .setName('fm')
  .setDescription('Mostra cosa sta ascoltando un utente')
  .addUserOption(option =>
    option.setName('utente')
      .setDescription('L\'utente di cui vedere la musica')
      .setRequired(false));

export async function execute(interaction) {
  if (!botConfig.userInfo?.commands?.fm?.enabled) {
    return interaction.reply({ 
      content: botConfig.messages?.commandDisabled || 'Questo comando è disabilitato.',
      ephemeral: true 
    });
  }

  const user = interaction.options.getUser('utente') || interaction.user;
  const member = await interaction.guild.members.fetch(user.id);
  
  const listeningActivity = member.presence?.activities?.find(
    activity => activity.type === ActivityType.Listening
  );
  
  if (!listeningActivity) {
    const embed = {
      color: getColor('warning', botConfig.embeds?.colors?.warning || '#FEE75C'),
      title: "🎵 FM - Nessuna musica",
      description: `${user.tag} non sta ascoltando nulla al momento.`,
      footer: {
        text: botConfig.embeds?.footer?.text || interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL()
      },
      timestamp: new Date()
    };
    return await interaction.reply({ embeds: [embed] });
  }
  
  let embed = {
    color: getColor('primary', botConfig.embeds?.colors?.primary),
    author: {
      name: user.tag,
      iconURL: user.displayAvatarURL()
    },
    footer: {
      text: botConfig.embeds?.footer?.text || `Richiesto da ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL()
    },
    timestamp: new Date()
  };
  
  // Spotify
  if (listeningActivity.name === 'Spotify' && listeningActivity.assets) {
    const trackName = listeningActivity.details || 'Titolo sconosciuto';
    const artist = listeningActivity.state || 'Artista sconosciuto';
    const album = listeningActivity.assets.largeText || 'Album sconosciuto';
    const albumImage = `https://i.scdn.co/image/${listeningActivity.assets.largeImage.slice(8)}`;
    
    embed = {
      ...embed,
      title: "🎵 Sta ascoltando su Spotify",
      description: `## ${trackName}\n*${artist}*`,
      thumbnail: { url: albumImage },
      fields: [
        { name: "💿 Album", value: album, inline: true },
        { name: "🎧 Piattaforma", value: "Spotify", inline: true }
      ]
    };
  } 
  else {
    embed = {
      ...embed,
      title: "🎵 Attività musicale",
      fields: [
        { name: "📱 App", value: listeningActivity.name, inline: true },
        { name: "🎼 Contenuto", value: listeningActivity.details || "Sconosciuto", inline: true }
      ]
    };
    
    if (listeningActivity.state) {
      embed.fields.push({
        name: "ℹ️ Info",
        value: listeningActivity.state,
        inline: true
      });
    }
  }
  
  await interaction.reply({ embeds: [embed] });
}
