import { ButtonBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';

export declare class BetterButton {
  button: ButtonBuilder;

  constructor();

  label(label: string): this;
  id(id: string): this;
  style(style: string | number): this;
  emoji(emoji: string): this;
  url(url: string): this;
  disabled(disabled?: boolean): this;
  build(): ButtonBuilder;
}

export declare class BetterSelectMenu {
  menu: any;
  type: string;

  constructor(type?: string);

  id(id: string): this;
  placeholder(text: string): this;
  option(label: string, value?: string, description?: string, emoji?: string): this;
  options(options: Array<any>): this;
  min(min: number): this;
  max(max: number): this;
  disabled(disabled?: boolean): this;
  build(): any;
}

export declare class BetterRow {
  row: ActionRowBuilder;
  components: Array<any>;

  constructor();

  button(button: BetterButton | ButtonBuilder | Function): this;
  menu(menu: BetterSelectMenu | any | Function): this;
  component(component: any): this;
  build(): ActionRowBuilder;
}

export declare class ComponentBuilder {
  rows: Array<any>;

  constructor();

  static button(): BetterButton;
  static selectMenu(type?: string): BetterSelectMenu;
  static row(): BetterRow;

  addRow(row: BetterRow | ActionRowBuilder | Function): this;
  build(): Array<ActionRowBuilder>;
}

export {
  BetterButton,
  BetterSelectMenu,
  BetterRow,
  ComponentBuilder
};
