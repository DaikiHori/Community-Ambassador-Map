Community Ambassador Map A customizable, lightweight web application designed for Pokémon GO Community Ambassadors to showcase their local meet-up locations and leadership teams.

This project allows you to create a "clean" map experience by stripping away default Google Maps clutter and focusing entirely on your community's presence.

🚀 Features Custom Map Styling: Focused view that hides default businesses and landmarks to make your pins stand out.

On-Demand Data Loading: Optimized performance by fetching detailed leader information (nicknames, trainer names, comments, and S3-hosted avatars) only when a pin is clicked.

Whitelist Authentication: Secure access using Google OAuth 2.0, restricted to pre-approved users in your database.

Responsive Design: Mobile-friendly login and information tabs for trainers on the go.

Global Configuration: Easily adaptable for any city or country via environment variables.

🛠 Tech Stack Frontend: Vanilla JavaScript (Google Maps JS API), CSS3 (Flexbox).

Backend: Node.js (Express), Passport.js (Google OAuth).

Database: SQLite via LibSQL / Prisma.

Cloud Storage: Amazon S3 (for leader avatars).

📋 Prerequisites Node.js (v18+)

Google Cloud Project (Maps API Key & OAuth 2.0 Credentials)

Amazon S3 Bucket (for hosting images)

⚙️ Setup Clone the repository

Bash git clone https://github.com/your-username/ambassador-map.git cd ambassador-map Install dependencies

Bash npm install Configure Environment Variables Create a .env file in the root directory (refer to .env.example):

Plaintext

Maps Settings
MAP_INIT_LAT=35.61 MAP_INIT_LNG=139.73 MAP_INIT_ZOOM=12

Google Auth
GOOGLE_CLIENT_ID=your_client_id GOOGLE_CLIENT_SECRET=your_client_secret

Database
DATABASE_URL="file:./prisma/dev.db" Initialize Database

Bash npx prisma migrate dev Run the server

Bash node index.js 🔒 Security Note This app uses a Whitelist strategy. To grant access to a user:

Manually add their Google email to the User table.

Ensure the isActive flag is set to 1.

📄 License This project is open-source. Feel free to fork and adapt it for your local community!