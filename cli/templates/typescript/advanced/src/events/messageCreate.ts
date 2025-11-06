import type { Event } from '@axrxvm/betterdiscordjs';
import type { Message } from 'discord.js';

const event: Event = {
  name: 'messageCreate',
  run: async (ctx, message: Message) => {
    // Ignore bots
    if (message.author.bot) return;
    
    // Log messages (you can add your custom logic here)
    // Example: Auto-response, message filtering, etc.
    
    // Auto-delete messages with invite links (example)
    if (message.content.match(/(discord\.gg|discord\.com\/invite)/gi)) {
      if (message.member?.permissions.has('Administrator')) return;
      
      try {
        await message.delete();
        const warning = await message.channel.send(
          `${message.author}, invite links are not allowed!`
        );
        setTimeout(() => warning.delete(), 5000);
      } catch (error) {
        console.error('Failed to delete invite link:', error);
      }
    }
  }
};

export default event;
