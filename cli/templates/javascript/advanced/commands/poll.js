module.exports = {
  name: 'poll',
  description: 'Create a poll with reactions',
  slash: true,
  args: {
    required: 1,
    usage: '<question>'
  },
  run: async (ctx) => {
    const question = ctx.args.join(' ');
    
    const embed = ctx.embed()
      .title('📊 Poll')
      .desc(question)
      .footer(`Poll by ${ctx.user.tag}`)
      .color('purple')
      .timestamp();
    
    const message = await embed.send();
    
    // Add reaction options
    await message.react('👍');
    await message.react('👎');
    await message.react('🤷');
    
    await ctx.success('Poll created!');
  }
};
