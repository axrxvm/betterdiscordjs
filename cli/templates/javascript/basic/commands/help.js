module.exports = {
  name: 'help',
  description: 'Show all available commands',
  slash: true,
  run: async (ctx) => {
    const commands = Array.from(ctx.bot.commands.values())
      .filter(cmd => !cmd.ownerOnly)
      .map(cmd => `\`${cmd.name}\` - ${cmd.description || 'No description'}`)
      .join('\n');
    
    const embed = ctx.embed()
      .title('📚 Available Commands')
      .desc(commands || 'No commands available')
      .footer(`Use {{PREFIX}}help <command> for more info`)
      .color('blue')
      .timestamp();
    
    await embed.send();
  }
};
