# Updately

A social platform for daily updates.

## Development

Both Updately's frontend and backend are built in Next.js. Auth is handled using `next-auth` with Google OAuth as the only provider, and MongoDB is used for data storage.

To get a local version of Updately running:
1. Clone this repo
2. Make a `.env` file in the project root with the following variables:
    - GOOGLE_CLIENT_ID: client ID from Google OAuth credentials (follow Google/`/next-auth` instructions to set up yourself)
    - GOOGLE_CLIENT_SECRET: client secret from Google OAuth credentials
    - NEXTAUTH_URL: http://localhost:3000 or whatever your URL is
    - MONGODB_URL: MongoDB URL with specified cluster, password, etc. Set up your own MongoDB cluster for this
3. Run `npm run dev` to spin up a local server. Have fun!