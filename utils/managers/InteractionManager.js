const { Collection, REST, Routes } = require('discord.js');
const logger = require('../logger');

/**
 * Manages interactions (slash commands, buttons, select menus, modals)
 * @class InteractionManager
 */
class InteractionManager {
  constructor(bot) {
    this.bot = bot;
    this.slashCommands = new Collection();
    this.contextMenus = new Collection();
    this.buttonHandlers = new Collection();
    this.selectMenuHandlers = new Collection();
    this.modalHandlers = new Collection();
    this.autocompleteHandlers = new Collection();
    
    // Configuration
    this.autoRegister = true;
    this.guildId = null; // For dev mode
    this.clientId = null;

    // Setup interaction handler
    this._setupInteractionHandler();
  }

  /**
   * Setup the main interaction event handler
   * @private
   */
  _setupInteractionHandler() {
    this.bot.client.on('interactionCreate', async (interaction) => {
      try {
        if (interaction.isChatInputCommand()) {
          await this._handleSlashCommand(interaction);
        } else if (interaction.isButton()) {
          await this._handleButton(interaction);
        } else if (interaction.isStringSelectMenu() || interaction.isUserSelectMenu() || 
                   interaction.isRoleSelectMenu() || interaction.isChannelSelectMenu()) {
          await this._handleSelectMenu(interaction);
        } else if (interaction.isModalSubmit()) {
          await this._handleModal(interaction);
        } else if (interaction.isAutocomplete()) {
          await this._handleAutocomplete(interaction);
        } else if (interaction.isContextMenuCommand()) {
          await this._handleContextMenu(interaction);
        }
      } catch (error) {
        logger.error(`Interaction error: ${error.message}`);
        
        const errorMessage = { content: '❌ An error occurred!', ephemeral: true };
        
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp(errorMessage).catch(() => {});
        } else {
          await interaction.reply(errorMessage).catch(() => {});
        }
      }
    });
  }

  /**
   * Handle slash command interaction
   * @param {CommandInteraction} interaction
   * @private
   */
  async _handleSlashCommand(interaction) {
    const command = this.slashCommands.get(interaction.commandName);
    if (!command) return;

    const Ctx = require('../ctx');
    const ctx = new Ctx(interaction, this.bot);
    
    await command.execute(ctx, interaction);
  }

  /**
   * Handle button interaction
   * @param {ButtonInteraction} interaction
   * @private
   */
  async _handleButton(interaction) {
    const handler = this.buttonHandlers.get(interaction.customId);
    if (!handler) {
      // Try pattern matching
      for (const [pattern, h] of this.buttonHandlers) {
        if (pattern instanceof RegExp && pattern.test(interaction.customId)) {
          return await h(interaction);
        }
      }
      return;
    }
    
    await handler(interaction);
  }

  /**
   * Handle select menu interaction
   * @param {SelectMenuInteraction} interaction
   * @private
   */
  async _handleSelectMenu(interaction) {
    const handler = this.selectMenuHandlers.get(interaction.customId);
    if (!handler) {
      // Try pattern matching
      for (const [pattern, h] of this.selectMenuHandlers) {
        if (pattern instanceof RegExp && pattern.test(interaction.customId)) {
          return await h(interaction);
        }
      }
      return;
    }
    
    await handler(interaction);
  }

  /**
   * Handle modal interaction
   * @param {ModalSubmitInteraction} interaction
   * @private
   */
  async _handleModal(interaction) {
    const handler = this.modalHandlers.get(interaction.customId);
    if (!handler) {
      // Try pattern matching
      for (const [pattern, h] of this.modalHandlers) {
        if (pattern instanceof RegExp && pattern.test(interaction.customId)) {
          return await h(interaction);
        }
      }
      return;
    }
    
    await handler(interaction);
  }

  /**
   * Handle autocomplete interaction
   * @param {AutocompleteInteraction} interaction
   * @private
   */
  async _handleAutocomplete(interaction) {
    const handler = this.autocompleteHandlers.get(interaction.commandName);
    if (!handler) return;
    
    const focused = interaction.options.getFocused(true);
    await handler(interaction, focused);
  }

  /**
   * Handle context menu interaction
   * @param {ContextMenuCommandInteraction} interaction
   * @private
   */
  async _handleContextMenu(interaction) {
    const command = this.contextMenus.get(interaction.commandName);
    if (!command) return;

    const Ctx = require('../ctx');
    const ctx = new Ctx(interaction, this.bot);
    
    await command.execute(ctx, interaction);
  }

  /**
   * Register a slash command
   * @param {object} command - Slash command data
   */
  registerSlashCommand(command) {
    this.slashCommands.set(command.name, command);
    logger.debug(`Registered slash command: ${command.name}`);
  }

  /**
   * Register a context menu
   * @param {object} menu - Context menu data
   */
  registerContextMenu(menu) {
    this.contextMenus.set(menu.name, menu);
    logger.debug(`Registered context menu: ${menu.name}`);
  }

  /**
   * Register a button handler
   * @param {string|RegExp} customId - Button custom ID or pattern
   * @param {Function} handler - Handler function
   */
  registerButton(customId, handler) {
    this.buttonHandlers.set(customId, handler);
    logger.debug(`Registered button handler: ${customId}`);
  }

  /**
   * Register a select menu handler
   * @param {string|RegExp} customId - Select menu custom ID or pattern
   * @param {Function} handler - Handler function
   */
  registerSelectMenu(customId, handler) {
    this.selectMenuHandlers.set(customId, handler);
    logger.debug(`Registered select menu handler: ${customId}`);
  }

  /**
   * Register a modal handler
   * @param {string|RegExp} customId - Modal custom ID or pattern
   * @param {Function} handler - Handler function
   */
  registerModal(customId, handler) {
    this.modalHandlers.set(customId, handler);
    logger.debug(`Registered modal handler: ${customId}`);
  }

  /**
   * Register an autocomplete handler
   * @param {string} commandName - Command name
   * @param {Function} handler - Autocomplete handler
   */
  registerAutocomplete(commandName, handler) {
    this.autocompleteHandlers.set(commandName, handler);
    logger.debug(`Registered autocomplete handler: ${commandName}`);
  }

  /**
   * Deploy slash commands to Discord
   * @param {string} token - Bot token
   * @param {string} clientId - Application client ID
   * @param {string} guildId - Guild ID (for dev mode, optional)
   */
  async deployCommands(token, clientId, guildId = null) {
    const rest = new REST({ version: '10' }).setToken(token);

    const commands = [];
    
    // Add slash commands
    this.slashCommands.forEach(cmd => {
      commands.push({
        name: cmd.name,
        description: cmd.description || 'No description',
        options: cmd.options || [],
        default_member_permissions: cmd.defaultMemberPermissions || null,
        dm_permission: cmd.dmPermission !== false,
      });
    });

    // Add context menus
    this.contextMenus.forEach(menu => {
      commands.push({
        name: menu.name,
        type: menu.type, // 2 for USER, 3 for MESSAGE
        default_member_permissions: menu.defaultMemberPermissions || null,
        dm_permission: menu.dmPermission !== false,
      });
    });

    try {
      logger.info(`Deploying ${commands.length} application commands...`);

      if (guildId) {
        await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: commands }
        );
        logger.success(`✅ Deployed ${commands.length} commands to guild ${guildId}`);
      } else {
        await rest.put(
          Routes.applicationCommands(clientId),
          { body: commands }
        );
        logger.success(`✅ Deployed ${commands.length} global commands`);
      }
    } catch (error) {
      logger.error(`Failed to deploy commands: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear all registered interactions
   */
  clear() {
    this.slashCommands.clear();
    this.contextMenus.clear();
    this.buttonHandlers.clear();
    this.selectMenuHandlers.clear();
    this.modalHandlers.clear();
    this.autocompleteHandlers.clear();
  }

  /**
   * Get interaction statistics
   * @returns {object}
   */
  getStats() {
    return {
      slashCommands: this.slashCommands.size,
      contextMenus: this.contextMenus.size,
      buttonHandlers: this.buttonHandlers.size,
      selectMenuHandlers: this.selectMenuHandlers.size,
      modalHandlers: this.modalHandlers.size,
      autocompleteHandlers: this.autocompleteHandlers.size,
    };
  }
}

module.exports = InteractionManager;
