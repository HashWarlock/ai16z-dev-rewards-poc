# Digital Identity Collection

A web application that allows users to connect their GitHub and Discord accounts and displays their digital identities in a vintage trading card style collection.

## Features

- OAuth integration with GitHub and Discord
- Vintage trading card style UI for displaying user profiles
- Secure session management
- PostgreSQL database for storing user data
- Responsive design

## Tech Stack

- Express.js backend with TypeScript
- React frontend with shadcn/ui components
- PostgreSQL database with Drizzle ORM
- OAuth authentication with Passport.js
- Docker support for containerization

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DATABASE_URL`

4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

The application uses Vite for development with HMR (Hot Module Replacement) and TypeScript for type safety.

## License

MIT License
