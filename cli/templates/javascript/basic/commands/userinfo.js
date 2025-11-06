module.exports = {
  name: 'userinfo',
  description: 'Get information about a user',
  slash: true,
  args: {
    usage: '[user]'
  },
  run: async (ctx) => {
    const user = ctx.interaction 
      ? ctx.interaction.options.getUser('user') || ctx.user
      : await ctx.fetchUser(ctx.args[0]) || ctx.user;
    
    const member = ctx.guild ? await ctx.guild.members.fetch(user.id).catch(() => null) : null;
    
    const embed = ctx.embed()
      .title(`👤 User Info: ${user.tag}`)
      .thumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .field('ID', user.id, true)
      .field('Created', `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, true)
      .field('Bot', user.bot ? 'Yes' : 'No', true)
      .color('blue');
    
    if (member) {
      embed.field('Joined Server', `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, true);
      embed.field('Roles', member.roles.cache.size.toString(), true);
    }
    
    await embed.send();
  }
};
