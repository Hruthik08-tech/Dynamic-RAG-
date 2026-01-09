require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

// Route 1: The Main News Feed
app.get('/', async (req, res) => {
  try {
    const searchResponse = await youtube.search.list({
      part: 'snippet',
      q: 'breaking news live',
      type: 'video',
      eventType: 'live',
      maxResults: 12
    });
    res.render('index', { streams: searchResponse.data.items });
  } catch (error) {
    console.error("API Error:", error);
    res.render('index', { streams: [], error: "Service temporary unavailable." });
  }
});

// Route 2: Custom Viewing Page (Statistics & Comments)
app.get('/watch/:id', async (req, res) => {
  const videoId = req.params.id;
  try {
    // Parallel requests for better performance
    const [videoInfo, commentThreads] = await Promise.all([
      youtube.videos.list({ part: 'snippet,statistics,liveStreamingDetails', id: videoId }),
      youtube.commentThreads.list({ part: 'snippet', videoId: videoId, maxResults: 15 })
        .catch(() => ({ data: { items: [] } }))
    ]);

    res.render('watch', { 
      video: videoInfo.data.items[0], 
      comments: commentThreads.data.items,
      domain: req.hostname 
    });
  } catch (error) {
    console.error("Watch Route Error:", error);
    res.redirect('/');
  }
});

app.listen(process.env.PORT, () => console.log(`Dashboard active at http://localhost:${process.env.PORT}`));
