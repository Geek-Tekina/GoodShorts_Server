import express from "express";
import cors from "cors";
import axios from "axios";
import { access } from "fs";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://goodshorts.netlify.app/"], // Allow only your frontend
    methods: "GET,POST,PUT,DELETE,PATCH", // Allowed methods
    credentials: true, // If using cookies or authentication
  })
);

// Fetch YouTube Shorts based on category
app.get("/api/shorts", async (req, res) => {
  const category = req.query.category || "shorts";
  const apiKey = process.env.YOUTUBE_API_KEY;
  const baseUrl = "https://www.googleapis.com/youtube/v3/search";

  let allVideos = [];
  let pageToken = ""; // Empty initially

  try {
    for (let i = 0; i < 2; i++) {
      // Fetch twice (50+50) to get 100 shorts
      const response = await axios.get(baseUrl, {
        params: {
          part: "snippet",
          q: `${category} shorts`,
          type: "video",
          videoDuration: "short",
          key: apiKey,
          maxResults: 50, // Maximum allowed per call
          pageToken: pageToken,
        },
      });

      const videos = response.data.items.map((video) => ({
        videoId: video.id.videoId,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.high.url,
        channel: video.snippet.channelTitle,
      }));

      allVideos = [...allVideos, ...videos];

      pageToken = response.data.nextPageToken || null; // Store for next batch
      if (!pageToken) break; // Stop if no more pages
    }

    res.json({ videos: allVideos });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch YouTube Shorts" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
