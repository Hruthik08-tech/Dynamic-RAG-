const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/:language', async (req, res) => {
    try {
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?language=${req.params.language}&apiKey=${process.env.NEWS_API_KEY}`);
        res.render('index', { articles: response.data.articles });
    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).send('Unable to load news at this time.');
    }
});

module.exports = router;

