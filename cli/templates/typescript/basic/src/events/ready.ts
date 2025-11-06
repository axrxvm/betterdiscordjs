import type { Event } from '@axrxvm/betterdiscordjs';

const event: Event = {
  name: 'ready',
  once: true,
  run: (ctx) => {
    console.log(`✓ ${ctx.user.tag} is online!`);
    console.log(`✓ Serving ${ctx.client.guilds.cache.size} guilds`);
    console.log(`✓ Loaded ${ctx.bot.commands.size} commands`);
  }
};

export default event;
