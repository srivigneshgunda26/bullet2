# AI Resume Bullet Generator

Transform your experience into professional resume bullet points using AI.

## Features

- Generate 12-15 professional resume bullets instantly
- Save and export bullets (Text, Word)
- View generation history
- Favorite your best bullets
- Character counter for optimal input
- Clean, modern UI with animations

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express
- **API**: OpenRouter (Free AI models)
- **Storage**: LocalStorage for history

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   PORT=3000
   APP_URL=http://localhost:3000
   ```

4. **Get your OpenRouter API key**
   - Go to [openrouter.ai](https://openrouter.ai)
   - Sign up / Log in
   - Navigate to Keys section
   - Create a new API key
   - Copy and paste it into `.env`

### Running the Application

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The app will be available at `http://localhost:3000`

## Project Structure

```
.
├── server.js           # Express backend server
├── index.html          # Frontend HTML
├── style.css           # Styles
├── script.js           # Frontend JavaScript
├── package.json        # Dependencies
├── .env                # Environment variables (not in git)
├── .env.example        # Example env file
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Security

- ✅ API key stored in `.env` file (server-side only)
- ✅ `.env` excluded from git via `.gitignore`
- ✅ Backend proxy prevents client-side API key exposure
- ✅ CORS enabled for security

## Usage

1. Enter your role (e.g., "Software Engineer")
2. Describe your project or experience
3. Click "Generate Bullets"
4. Copy, export, or save your favorite bullets
5. View history to reload previous generations

## API Endpoint

### POST `/api/generate-bullets`

**Request Body:**
```json
{
  "role": "Software Engineer",
  "experience": "Built a web application using React and Node.js"
}
```

**Response:**
```json
{
  "bullets": [
    "Developed full-stack web application...",
    "Implemented RESTful API endpoints...",
    ...
  ]
}
```

## Future Enhancements

- User authentication
- Multiple bullet styles
- Job description matcher
- ATS score checker
- PDF export with formatting
- Collaborative features

## License

MIT
