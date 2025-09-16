# better-djs

A modern, modular, and extensible Discord bot framework for Node.js, designed for building powerful and scalable bots with ease.

## About The Project

better-djs provides a robust foundation for creating Discord bots, offering a rich set of features out-of-the-box while maintaining a focus on clean, readable, and easily extensible code. Whether you're building a small bot for your server or a large, sharded application, this framework is designed to scale with your needs.

### Features

-   **Command Handling**: Supports both slash and prefix-based commands, as well as context menus.
-   **Context Helpers (ctx)**: An advanced context object that simplifies interactions with Discord's API.
-   **Embed Builder**: A powerful and intuitive builder for creating rich embeds.
-   **Task Scheduling**: Includes a scheduler for running cron jobs and other timed tasks.
-   **Configuration**: Per-guild and per-user configuration management.
-   **Hot-Reloading**: Automatically reloads commands and events on file changes for rapid development.
-   **Extensibility**: Middleware, inhibitors, and overloads allow for custom logic and behavior.
-   **Event Management**: Group events and use wildcard listeners for flexible event handling.
-   **Utilities**: A suite of advanced utilities including caching, sessions, queues, and more.
-   **Logging and Stats**: Built-in command logging, statistics, and rate limiting.
-   **Developer-Friendly**: Beautiful, color-coded logs for easy debugging.

## Getting Started

Follow these simple steps to get your bot up and running.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16.9.0 or higher)
-   [npm](https://www.npmjs.com/) (or your preferred package manager)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/better-djs.git
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Set up your environment variables:**

    Create a `.env` file in the root of your project and add the following variables:

    ```env
    TOKEN=your_bot_token_here
    CLIENT_ID=your_bot_client_id_here
    ```

### Running the Bot

To start your bot, simply run:

```sh
node index.js
```

## Project Structure

The framework is organized into the following directories:

-   `Bot.js`: The main bot class that ties everything together.
-   `index.js`: The entry point for the application.
-   `loaders/`: Contains the loaders for commands and events.
    -   `commands.js`: Loads all command files.
    -   `events.js`: Loads all event handlers.
-   `utils/`: A collection of advanced utilities.
    -   `cache.js`: Caching utilities.
    -   `colors.js`: Color definitions for logging.
    -   `ctx.js`: The context helper object.
    -   `db.js`: Database utilities.
    -   `logger.js`: The logging utility.
    -   `queue.js`: Queue management.
    -   `rateLimit.js`: Rate limiting for commands.
    -   `scheduler.js`: Task scheduling.
    -   `session.js`: Session management.
    -   `stats.js`: Statistics tracking.
    -   `time.js`: Time and duration utilities.
-   `testbot/`: An example bot implementation.

## Philosophy

-   **Clean and Readable**: Code should be easy to understand and maintain.
-   **Extensible and Customizable**: The framework is designed to be easily extended and adapted to your specific needs.
-   **Scalable**: From small personal bots to large, sharded applications, the framework is built to scale.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
