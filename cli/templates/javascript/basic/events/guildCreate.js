module.exports = {
  name: 'guildCreate',
  run: async (ctx, guild) => {
    console.log(`✓ Joined new guild: ${guild.name} (${guild.id})`);
    
    // Send welcome message to the first available channel
    const channel = guild.channels.cache
      .filter(ch => ch.type === 0 && ch.permissionsFor(guild.members.me).has('SendMessages'))
      .first();
    
    if (channel) {
      const embed = ctx.embed()
        .title('👋 Thanks for adding me!')
        .desc(`Use \`{{PREFIX}}help\` to see available commands.`)
        .color('green');
      
      await channel.send({ embeds: [embed.embed] });
    }
  }
};
