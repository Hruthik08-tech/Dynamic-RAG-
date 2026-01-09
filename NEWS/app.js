require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const { client, connectRedis, EXPIRATION_TIME } = require('./connections/caching');
connectRedis();

// Content Security Policy middleware
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: *; connect-src 'self'"
    );
    next();
});

// Handle favicon.ico 404
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Handle Chrome DevTools probe 404
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
    res.json({});
});

app.get('/', async (req, res) => {
    try {
        // Check if data is in Redis Cache 
        const cachedData = await client.get('newsData');
        if (cachedData) {
            return res.render('index', { articles: JSON.parse(cachedData) });
        }

        // If not in cache, fetch from API
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`);
        res.render('index', { articles: response.data.articles });
        
        // Store in cache
        await client.set('newsData', JSON.stringify(response.data.articles), {
            EX: EXPIRATION_TIME
        });
        
    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).send('Unable to load news at this time.');
    }
});

app.use('/country', require('./routes/countryNews'));
app.use('/category', require('./routes/categoryNews'));
app.use('/language', require('./routes/languageNews'));


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
