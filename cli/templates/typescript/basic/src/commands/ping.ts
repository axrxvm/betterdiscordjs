import type { Command } from '@axrxvm/betterdiscordjs';

const command: Command = {
  name: 'ping',
  description: 'Check bot latency',
  slash: true,
  run: async (ctx) => {
    const latency = Date.now() - ctx.createdTimestamp;
    const apiLatency = Math.round(ctx.client.ws.ping);
    
    const embed = ctx.embed()
      .title('🏓 Pong!')
      .field('Bot Latency', `${latency}ms`, true)
      .field('API Latency', `${apiLatency}ms`, true)
      .color('green')
      .timestamp();
    
    await embed.send();
  }
};

export default command;
