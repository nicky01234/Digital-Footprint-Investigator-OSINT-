## Run Locally

📋 Prerequisites
Before you begin, ensure you have the following installed on your machine:
Git (to clone the repository)
Node.js (Version 18.0.0 or higher is recommended)
npm (usually bundled with Node.js)
🚀 Step-by-Step Installation
1. Clone the Repository
Open your terminal/command prompt and run the following command to clone your repository from GitHub:
code
Bash
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
cd YOUR_REPOSITORY_NAME
(Make sure to replace YOUR_GITHUB_USERNAME and YOUR_REPOSITORY_NAME with your actual GitHub details).
2. Install Project Dependencies
Run the installation command to fetch all required libraries (Express, Vite, React, Gemini SDK, etc.):
code
Bash
npm install
3. Configure Environment Variables
The application uses environment variables for secure tokens and optional AI integration.
In the root directory, create a new file named .env by copying the .env.example template:
code
Bash
cp .env.example .env
Open the newly created .env file in a text editor and update the following configuration:
code
Env
# Required for AI-assisted OSINT analysis. Get a key at: https://aistudio.google.com/
GEMINI_API_KEY="your_actual_gemini_api_key_here"

# URL where the application runs locally
APP_URL="http://localhost:3000"

# (Optional) Customize the JSON Web Token secret key for security signatures
JWT_SECRET="any_custom_secure_secret_string"
💻 Running the Application
You can start the system in either Development or Production mode.
Option A: Running in Development Mode
Best for making changes, exploring the code, or testing locally:
code
Bash
npm run dev
This spins up the Vite development server along with the backend API.
Open your browser and navigate to: http://localhost:3000
Option B: Running in Production Mode (Recommended)
Best for general usage, as it compiles and optimizes the front-end for maximum speed and security:
code
Bash
# Build the React frontend and compile the backend server
npm run build

# Start the optimized node server
npm start
Open your browser and navigate to: http://localhost:3000
