import type { Command } from '@axrxvm/betterdiscordjs';
import { time } from '@axrxvm/betterdiscordjs';

const command: Command = {
  name: 'remind',
  description: 'Set a reminder',
  slash: true,
  args: {
    required: 2,
    usage: '<time> <message>'
  },
  run: async (ctx) => {
    const timeStr = ctx.args[0];
    const message = ctx.args.slice(1).join(' ');
    
    const duration = time.parse(timeStr);
    if (!duration) {
      return ctx.error('Invalid time format! Use: 1h, 30m, 2d, etc.');
    }
    
    await ctx.success(`I'll remind you in ${timeStr}: ${message}`);
    
    setTimeout(async () => {
      try {
        await ctx.user.send(`⏰ Reminder: ${message}`);
      } catch (error) {
        console.error('Failed to send reminder:', error);
      }
    }, duration);
  }
};

export default command;
