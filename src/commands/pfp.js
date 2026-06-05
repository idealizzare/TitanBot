import { SlashCommandBuilder } from 'discord.js';
import { botConfig, getColor } from '../../config/botConfig.js';

export const data = new SlashCommandBuilder()
  .setName('pfp')
  .setDescription('Mostra l\'avatar di un utente')
  .addUserOption(option =>
    option.setName('utente')
      .setDescription('L\'utente di cui vedere l\'avatar')
      .setRequired(false));

export async function execute(interaction) {
  // Check if command is enabled
  if (!botConfig.userInfo?.commands?.pfp?.enabled) {
    return interaction.reply({ 
      content: botConfig.messages?.commandDisabled || 'Questo comando è disabilitato.',
      ephemeral: true 
    });
  }

  const user = interaction.options.getUser('utente') || interaction.user;
  const avatarURL = user.displayAvatarURL({ 
    size: botConfig.userInfo?.maxAvatarSize || 4096, 
    dynamic: true 
  });
  
  const embed = {
    color: getColor('primary', botConfig.embeds?.colors?.primary),
    title: `🖼️ Avatar di ${user.tag}`,
    image: { url: avatarURL },
    footer: {
      text: botConfig.embeds?.footer?.text || 'Richiesto da ' + interaction.user.tag,
      iconURL: botConfig.userInfo?.showDownloadButtons !== false ? interaction.user.displayAvatarURL() : null
    },
    timestamp: new Date()
  };
  
  const components = [];
  
  if (botConfig.userInfo?.showDownloadButtons !== false) {
    const buttons = [];
    
    if (botConfig.userInfo?.avatarFormats?.png !== false) {
      buttons.push({
        type: 2,
        style: 5,
        label: "PNG",
        url: user.displayAvatarURL({ format: 'png', size: botConfig.userInfo?.maxAvatarSize || 4096 })
      });
    }
    
    if (botConfig.userInfo?.avatarFormats?.jpg !== false) {
      buttons.push({
        type: 2,
        style: 5,
        label: "JPG",
        url: user.displayAvatarURL({ format: 'jpg', size: botConfig.userInfo?.maxAvatarSize || 4096 })
      });
    }
    
    if (botConfig.userInfo?.avatarFormats?.webp !== false) {
      buttons.push({
        type: 2,
        style: 5,
        label: "WEBP",
        url: user.displayAvatarURL({ format: 'webp', size: botConfig.userInfo?.maxAvatarSize || 4096 })
      });
    }
    
    // Add GIF button only if avatar is animated
    if (botConfig.userInfo?.avatarFormats?.gif !== false && user.avatar?.startsWith('a_')) {
      buttons.push({
        type: 2,
        style: 5,
        label: "GIF",
        url: user.displayAvatarURL({ format: 'gif', size: botConfig.userInfo?.maxAvatarSize || 4096 })
      });
    }
    
    if (buttons.length > 0) {
      components.push({ type: 1, components: buttons });
    }
  }
  
  await interaction.reply({ embeds: [embed], components: components });
}
