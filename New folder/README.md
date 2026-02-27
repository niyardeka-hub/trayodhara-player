# Trayodhara Player

Simple web application demonstrating search, playback, and download of songs using the Tidal Library API. Branded as Trayodhara Player.

> **Note:** This example uses the public Tidal API and in many cases you will not be able to obtain direct MP3 streams. The download functionality here redirects to a preview URL. You may need additional authentication or a paid Tidal developer account for full access.

## Setup

1. Clone the repository or unzip the workspace.
2. Run `npm install` to install dependencies (Express, axios, dotenv).
3. Copy `.env.example` to `.env` and set `TIDAL_API_KEY` with your token.
4. Start the server:
   ```bash
   npm run dev    # requires nodemon, or
   npm start
   ```
5. Open http://localhost:3000 in your browser.

## Usage

- Enter a song name in the search box and click **Search**.  You may also include other query parameters in the URL directly:
  - `s` for track search (default)
  - `a` for artist search
  - `v` for video search
  - `p` for playlist search

- Click on a result to fetch detailed metadata from `/info/{id}` and display it in the player. A quality selector lets you choose between `HI_RES_LOSSLESS`, `LOSSLESS`, `HIGH`, and `LOW`.
- The player uses `/track/{id}?quality=` to load a stream URL or preview. A full manifest may be returned for advanced clients.
- Clicking **Download MP3** uses `/download/{id}`; at present this simply redirects to the preview URL.


## API Endpoints

The server exposes the following routes (inspired by hifi-api):

- `GET /search?s=...` - track search, accepts `a`, `v`, `p` variants.
- `GET /info/:id` - returns track metadata from Tidal.
- `GET /track/:id?quality=...` - returns stream URL or manifest; default quality `HI_RES_LOSSLESS`.
- `GET /recommendations/:id` - fetches recommended tracks for given track ID.
- `GET /download/:id` - proxy for downloading or redirecting to preview.


## Project Structure

```
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── server.js
├── package.json
├── .env.example
└── README.md
```

## Notes

- In a real application you'd need proper OAuth authentication with Tidal and handle rate limits.
- The download feature is not realistic due to Tidal restrictions; adjust as needed.

