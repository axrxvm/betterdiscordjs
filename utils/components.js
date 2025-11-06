const { 
  ButtonBuilder, 
  ActionRowBuilder, 
  ButtonStyle,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  MentionableSelectMenuBuilder
} = require('discord.js');

/**
 * Fluent API wrapper for Discord.js ButtonBuilder
 */
class BetterButton {
  constructor() {
    this.button = new ButtonBuilder();
  }

  /**
   * Set button label
   * @param {string} label - Button text
   */
  label(label) {
    this.button.setLabel(label);
    return this;
  }

  /**
   * Set button custom ID (for non-link buttons)
   * @param {string} id - Custom ID
   */
  id(id) {
    this.button.setCustomId(id);
    return this;
  }

  /**
   * Set button style
   * @param {string|number} style - primary, secondary, success, danger, link, or ButtonStyle enum
   */
  style(style) {
    const styleMap = {
      primary: ButtonStyle.Primary,
      secondary: ButtonStyle.Secondary,
      success: ButtonStyle.Success,
      danger: ButtonStyle.Danger,
      link: ButtonStyle.Link,
      blue: ButtonStyle.Primary,
      grey: ButtonStyle.Secondary,
      gray: ButtonStyle.Secondary,
      green: ButtonStyle.Success,
      red: ButtonStyle.Danger,
    };
    this.button.setStyle(styleMap[style?.toLowerCase()] || style);
    return this;
  }

  /**
   * Set button emoji
   * @param {string} emoji - Emoji (unicode or custom emoji ID)
   */
  emoji(emoji) {
    this.button.setEmoji(emoji);
    return this;
  }

  /**
   * Set button URL (for link buttons)
   * @param {string} url - The URL
   */
  url(url) {
    this.button.setURL(url);
    this.style('link');
    return this;
  }

  /**
   * Set button disabled state
   * @param {boolean} disabled - Whether button is disabled
   */
  disabled(disabled = true) {
    this.button.setDisabled(disabled);
    return this;
  }

  /**
   * Build the button
   */
  build() {
    return this.button;
  }
}

/**
 * Fluent API wrapper for Discord.js Select Menus
 */
class BetterSelectMenu {
  constructor(type = 'string') {
    const builders = {
      string: StringSelectMenuBuilder,
      user: UserSelectMenuBuilder,
      role: RoleSelectMenuBuilder,
      channel: ChannelSelectMenuBuilder,
      mentionable: MentionableSelectMenuBuilder,
    };
    this.menu = new (builders[type] || StringSelectMenuBuilder)();
    this.type = type;
  }

  /**
   * Set custom ID
   * @param {string} id - Custom ID
   */
  id(id) {
    this.menu.setCustomId(id);
    return this;
  }

  /**
   * Set placeholder text
   * @param {string} text - Placeholder text
   */
  placeholder(text) {
    this.menu.setPlaceholder(text);
    return this;
  }

  /**
   * Add an option (for string select menus)
   * @param {string} label - Option label
   * @param {string} value - Option value
   * @param {string} description - Option description
   * @param {string} emoji - Option emoji
   */
  option(label, value, description, emoji) {
    if (this.type === 'string') {
      const opt = { label, value: value || label };
      if (description) opt.description = description;
      if (emoji) opt.emoji = emoji;
      this.menu.addOptions(opt);
    }
    return this;
  }

  /**
   * Add multiple options at once
   * @param {Array} options - Array of option objects
   */
  options(options) {
    if (this.type === 'string') {
      this.menu.addOptions(options);
    }
    return this;
  }

  /**
   * Set minimum values that can be selected
   * @param {number} min - Minimum values
   */
  min(min) {
    this.menu.setMinValues(min);
    return this;
  }

  /**
   * Set maximum values that can be selected
   * @param {number} max - Maximum values
   */
  max(max) {
    this.menu.setMaxValues(max);
    return this;
  }

  /**
   * Set disabled state
   * @param {boolean} disabled - Whether menu is disabled
   */
  disabled(disabled = true) {
    this.menu.setDisabled(disabled);
    return this;
  }

  /**
   * Build the select menu
   */
  build() {
    return this.menu;
  }
}

/**
 * Fluent API wrapper for Action Rows
 */
class BetterRow {
  constructor() {
    this.row = new ActionRowBuilder();
    this.components = [];
  }

  /**
   * Add a button to the row
   * @param {BetterButton|ButtonBuilder|Function} button - Button or builder function
   */
  button(button) {
    if (typeof button === 'function') {
      const builder = new BetterButton();
      button(builder);
      this.components.push(builder.build());
    } else if (button instanceof BetterButton) {
      this.components.push(button.build());
    } else {
      this.components.push(button);
    }
    return this;
  }

  /**
   * Add a select menu to the row
   * @param {BetterSelectMenu|SelectMenuBuilder|Function} menu - Select menu or builder function
   */
  menu(menu) {
    if (typeof menu === 'function') {
      const builder = new BetterSelectMenu();
      menu(builder);
      this.components.push(builder.build());
    } else if (menu instanceof BetterSelectMenu) {
      this.components.push(menu.build());
    } else {
      this.components.push(menu);
    }
    return this;
  }

  /**
   * Add any component to the row
   * @param {*} component - Discord.js component
   */
  component(component) {
    this.components.push(component);
    return this;
  }

  /**
   * Build the action row
   */
  build() {
    return this.row.addComponents(...this.components);
  }
}

/**
 * Helper class for creating component collections
 */
class ComponentBuilder {
  constructor() {
    this.rows = [];
  }

  /**
   * Create a new button
   */
  static button() {
    return new BetterButton();
  }

  /**
   * Create a new select menu
   * @param {string} type - Menu type: string, user, role, channel, mentionable
   */
  static selectMenu(type = 'string') {
    return new BetterSelectMenu(type);
  }

  /**
   * Create a new action row
   */
  static row() {
    return new BetterRow();
  }

  /**
   * Add a row to the collection
   * @param {BetterRow|ActionRowBuilder|Function} row - Row or builder function
   */
  addRow(row) {
    if (typeof row === 'function') {
      const builder = new BetterRow();
      row(builder);
      this.rows.push(builder.build());
    } else if (row instanceof BetterRow) {
      this.rows.push(row.build());
    } else {
      this.rows.push(row);
    }
    return this;
  }

  /**
   * Build all rows
   */
  build() {
    return this.rows;
  }
}

module.exports = {
  BetterButton,
  BetterSelectMenu,
  BetterRow,
  ComponentBuilder,
};
