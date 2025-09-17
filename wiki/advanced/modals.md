# Modals & Forms

Modals provide a way to collect structured input from users through popup forms in Discord. @axrxvm/betterdiscordjs makes it easy to create and handle modal interactions.

## Overview

Modals are popup forms that can contain text inputs, allowing you to collect detailed information from users in a structured way.

## Basic Modal Usage

### Creating a Simple Modal

```javascript
bot.command('feedback', async (ctx) => {
  if (!ctx.isInteraction) {
    return ctx.error('This command only works as a slash command.');
  }
  
  const result = await ctx.modal([
    {
      customId: 'title',
      label: 'Feedback Title',
      style: 1, // Short text input
      required: true
    },
    {
      customId: 'description',
      label: 'Detailed Feedback',
      style: 2, // Paragraph text input
      required: true
    }
  ], {
    title: 'Submit Feedback',
    thankYou: 'Thank you for your feedback!'
  });
  
  if (result) {
    // Process the feedback
    const embed = ctx.embed()
      .title('📝 New Feedback')
      .field('Title', result.title)
      .field('Description', result.description)
      .field('From', ctx.user.tag)
      .color('blue');
    
    // Send to feedback channel
    const feedbackChannel = bot.client.channels.cache.get('FEEDBACK_CHANNEL_ID');
    if (feedbackChannel) {
      await feedbackChannel.send({ embeds: [embed.embed] });
    }
  }
});
```

### Text Input Styles

- `1` - Short text input (single line)
- `2` - Paragraph text input (multiple lines)

## Advanced Modal Examples

### User Registration Form

```javascript
bot.command('register', async (ctx) => {
  const result = await ctx.modal([
    {
      customId: 'username',
      label: 'Username',
      style: 1,
      required: true,
      placeholder: 'Enter your username'
    },
    {
      customId: 'email',
      label: 'Email Address',
      style: 1,
      required: true,
      placeholder: 'your@email.com'
    },
    {
      customId: 'bio',
      label: 'Bio',
      style: 2,
      required: false,
      placeholder: 'Tell us about yourself...'
    }
  ], {
    title: 'User Registration',
    timeout: 120000 // 2 minutes
  });
  
  if (result) {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(result.email)) {
      return ctx.error('❌ Invalid email address!');
    }
    
    // Save user data
    const db = require('./utils/db');
    await db.setUserConfig(ctx.user.id, 'profile', {
      username: result.username,
      email: result.email,
      bio: result.bio || 'No bio provided',
      registeredAt: new Date().toISOString()
    });
    
    await ctx.success('✅ Registration completed successfully!');
  }
});
```

### Bug Report System

```javascript
bot.command('bugreport', async (ctx) => {
  const result = await ctx.modal([
    {
      customId: 'title',
      label: 'Bug Title',
      style: 1,
      required: true,
      placeholder: 'Brief description of the bug'
    },
    {
      customId: 'steps',
      label: 'Steps to Reproduce',
      style: 2,
      required: true,
      placeholder: '1. Do this\n2. Then this\n3. Bug occurs'
    },
    {
      customId: 'expected',
      label: 'Expected Behavior',
      style: 2,
      required: true,
      placeholder: 'What should have happened?'
    },
    {
      customId: 'actual',
      label: 'Actual Behavior',
      style: 2,
      required: true,
      placeholder: 'What actually happened?'
    }
  ], {
    title: 'Bug Report',
    customId: 'bug_report_modal'
  });
  
  if (result) {
    // Create bug report embed
    const embed = ctx.embed()
      .title('🐛 Bug Report')
      .field('Title', result.title)
      .field('Steps to Reproduce', result.steps)
      .field('Expected Behavior', result.expected)
      .field('Actual Behavior', result.actual)
      .field('Reported By', ctx.user.tag)
      .field('Server', ctx.guild.name)
      .timestamp()
      .color('red');
    
    // Send to bug reports channel
    const bugChannel = bot.client.channels.cache.get('BUG_REPORTS_CHANNEL_ID');
    if (bugChannel) {
      const msg = await bugChannel.send({ embeds: [embed.embed] });
      
      // Add reaction buttons for developers
      await msg.react('✅'); // Confirmed
      await msg.react('❌'); // Invalid
      await msg.react('🔧'); // In Progress
    }
    
    await ctx.success('🐛 Bug report submitted! Thank you for helping improve the bot.');
  }
});
```

### Multi-Step Modal Workflow

```javascript
bot.command('createevent', async (ctx) => {
  // Step 1: Basic event info
  const basicInfo = await ctx.modal([
    {
      customId: 'name',
      label: 'Event Name',
      style: 1,
      required: true
    },
    {
      customId: 'description',
      label: 'Event Description',
      style: 2,
      required: true
    }
  ], {
    title: 'Create Event - Step 1',
    thankYou: 'Step 1 completed! Please continue...'
  });
  
  if (!basicInfo) return;
  
  // Step 2: Date and time
  const dateInfo = await ctx.modal([
    {
      customId: 'date',
      label: 'Event Date',
      style: 1,
      required: true,
      placeholder: 'YYYY-MM-DD'
    },
    {
      customId: 'time',
      label: 'Event Time',
      style: 1,
      required: true,
      placeholder: 'HH:MM (24-hour format)'
    },
    {
      customId: 'duration',
      label: 'Duration',
      style: 1,
      required: false,
      placeholder: 'e.g., 2 hours'
    }
  ], {
    title: 'Create Event - Step 2',
    thankYou: 'Event created successfully!'
  });
  
  if (!dateInfo) return;
  
  // Combine and create event
  const eventData = {
    ...basicInfo,
    ...dateInfo,
    createdBy: ctx.user.id,
    createdAt: new Date().toISOString()
  };
  
  // Save event and create announcement
  const embed = ctx.embed()
    .title('📅 New Event Created')
    .field('Event', eventData.name)
    .field('Description', eventData.description)
    .field('Date', eventData.date)
    .field('Time', eventData.time)
    .field('Duration', eventData.duration || 'Not specified')
    .field('Created by', ctx.user.tag)
    .color('green');
  
  await ctx.reply({ embeds: [embed.embed] });
});
```

## Modal with Button Integration

### Support Ticket System

```javascript
bot.command('support', async (ctx) => {
  const embed = ctx.embed()
    .title('🎫 Support System')
    .desc('Click the button below to create a support ticket')
    .color('blue');
  
  const button = ctx.buttonRow([
    { customId: 'create_ticket', label: '🎫 Create Ticket', style: 1 }
  ]);
  
  const msg = await ctx.reply({
    embeds: [embed.embed],
    components: [button]
  });
  
  await ctx.awaitButton(msg, {
    create_ticket: async (interaction) => {
      const result = await interaction.showModal({
        customId: 'support_ticket_modal',
        title: 'Create Support Ticket',
        components: [
          {
            type: 1, // ACTION_ROW
            components: [{
              type: 4, // TEXT_INPUT
              customId: 'issue_type',
              label: 'Issue Type',
              style: 1,
              required: true,
              placeholder: 'Bug, Feature Request, General Help, etc.'
            }]
          },
          {
            type: 1,
            components: [{
              type: 4,
              customId: 'description',
              label: 'Describe your issue',
              style: 2,
              required: true,
              placeholder: 'Please provide as much detail as possible...'
            }]
          }
        ]
      });
      
      // Handle modal submission
      const filter = i => i.customId === 'support_ticket_modal' && i.user.id === interaction.user.id;
      const submitted = await interaction.awaitModalSubmit({ filter, time: 300000 });
      
      if (submitted) {
        const issueType = submitted.fields.getTextInputValue('issue_type');
        const description = submitted.fields.getTextInputValue('description');
        
        // Create support ticket
        const ticketEmbed = ctx.embed()
          .title('🎫 Support Ticket')
          .field('Issue Type', issueType)
          .field('Description', description)
          .field('User', interaction.user.tag)
          .field('Ticket ID', `TICKET-${Date.now()}`)
          .timestamp()
          .color('orange');
        
        const supportChannel = bot.client.channels.cache.get('SUPPORT_CHANNEL_ID');
        if (supportChannel) {
          await supportChannel.send({ embeds: [ticketEmbed.embed] });
        }
        
        await submitted.reply({
          content: '✅ Support ticket created! Our team will respond soon.',
          ephemeral: true
        });
      }
    }
  });
});
```

## Custom Modal Handler

### Reusable Modal System

```javascript
class ModalHandler {
  constructor(bot) {
    this.bot = bot;
    this.activeModals = new Map();
  }
  
  async showModal(interaction, config) {
    const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js');
    
    const modal = new ModalBuilder()
      .setCustomId(config.customId || `modal_${Date.now()}`)
      .setTitle(config.title);
    
    config.fields.forEach(field => {
      const textInput = new TextInputBuilder()
        .setCustomId(field.customId)
        .setLabel(field.label)
        .setStyle(field.style)
        .setRequired(field.required ?? true);
      
      if (field.placeholder) textInput.setPlaceholder(field.placeholder);
      if (field.minLength) textInput.setMinLength(field.minLength);
      if (field.maxLength) textInput.setMaxLength(field.maxLength);
      if (field.value) textInput.setValue(field.value);
      
      const row = new ActionRowBuilder().addComponents(textInput);
      modal.addComponents(row);
    });
    
    await interaction.showModal(modal);
    
    // Store handler for this modal
    if (config.handler) {
      this.activeModals.set(modal.data.custom_id, config.handler);
    }
    
    return modal.data.custom_id;
  }
  
  async handleSubmission(interaction) {
    const handler = this.activeModals.get(interaction.customId);
    if (handler) {
      const data = {};
      
      // Extract field values
      interaction.components.forEach(row => {
        row.components.forEach(component => {
          data[component.customId] = component.value;
        });
      });
      
      await handler(interaction, data);
      this.activeModals.delete(interaction.customId);
    }
  }
}

const modalHandler = new ModalHandler(bot);

// Listen for modal submissions
bot.client.on('interactionCreate', async (interaction) => {
  if (interaction.isModalSubmit()) {
    await modalHandler.handleSubmission(interaction);
  }
});

// Usage
bot.command('customform', async (ctx) => {
  await modalHandler.showModal(ctx.raw, {
    title: 'Custom Form',
    fields: [
      {
        customId: 'name',
        label: 'Your Name',
        style: 1,
        required: true
      },
      {
        customId: 'message',
        label: 'Your Message',
        style: 2,
        required: true,
        maxLength: 1000
      }
    ],
    handler: async (interaction, data) => {
      await interaction.reply({
        content: `Hello ${data.name}! Your message: "${data.message}"`,
        ephemeral: true
      });
    }
  });
});
```

## Validation and Error Handling

### Input Validation

```javascript
bot.command('profile', async (ctx) => {
  const result = await ctx.modal([
    {
      customId: 'age',
      label: 'Age',
      style: 1,
      required: true,
      placeholder: 'Enter your age (18-99)'
    },
    {
      customId: 'location',
      label: 'Location',
      style: 1,
      required: false,
      placeholder: 'City, Country'
    }
  ], {
    title: 'Update Profile'
  });
  
  if (result) {
    // Validate age
    const age = parseInt(result.age);
    if (isNaN(age) || age < 18 || age > 99) {
      return ctx.error('❌ Age must be a number between 18 and 99!');
    }
    
    // Validate location format if provided
    if (result.location && result.location.length > 50) {
      return ctx.error('❌ Location must be less than 50 characters!');
    }
    
    // Save profile
    const db = require('./utils/db');
    await db.setUserConfig(ctx.user.id, 'profile', {
      age: age,
      location: result.location || 'Not specified',
      updatedAt: new Date().toISOString()
    });
    
    await ctx.success('✅ Profile updated successfully!');
  }
});
```

## Best Practices

1. **Always check if interaction is available**
   ```javascript
   if (!ctx.isInteraction) {
     return ctx.error('This command requires slash command usage.');
   }
   ```

2. **Validate user input**
   ```javascript
   if (result) {
     // Validate before processing
     if (!isValidEmail(result.email)) {
       return ctx.error('Invalid email format!');
     }
   }
   ```

3. **Set appropriate timeouts**
   ```javascript
   const result = await ctx.modal(fields, {
     timeout: 300000 // 5 minutes for complex forms
   });
   ```

4. **Provide clear labels and placeholders**
   ```javascript
   {
     label: 'Email Address',
     placeholder: 'your@email.com',
     required: true
   }
   ```

5. **Handle modal cancellation gracefully**
   ```javascript
   if (!result) {
     // User cancelled or timed out
     return; // Don't show error message
   }
   ```

6. **Use appropriate input styles**
   - Style 1 (short) for single-line inputs
   - Style 2 (paragraph) for multi-line text

7. **Limit text input lengths**
   ```javascript
   {
     customId: 'title',
     label: 'Title',
     maxLength: 100,
     required: true
   }
   ```

## Limitations

- Modals only work with slash commands (interactions)
- Maximum 5 text inputs per modal
- Text inputs have character limits (4000 for paragraph style)
- Modals cannot contain other components (buttons, select menus)
- Users can only have one modal open at a time## Next 
Steps

Enhance user interaction capabilities:

1. 🎮 [Component Interactions](./components.md) - Add buttons and select menus
2. 🎨 [Embed Builder](./embed-builder.md) - Create rich modal responses
3. 📄 [Pagination](./pagination.md) - Handle multi-step forms
4. 🔧 [Context API](../api/context.md) - Master modal interaction handling






