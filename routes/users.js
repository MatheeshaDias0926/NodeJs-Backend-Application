const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');


const apiKey = process.env.OPENWEATHERMAP_API_KEY;
console.log('OpenWeatherMap API Key:', apiKey); // Debug: Print the API key

// Function to fetch weather data from OpenWeatherMap API
async function fetchWeatherData(latitude, longitude) {
  const APIurl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
  console.log('API Request URL:', APIurl); // Debug: Print the API request URL
  try {
    const response = await axios.get(APIurl);
    const data = response.data;
    return {
      date: new Date(),
      temperature: data.main.temp,
      condition: data.weather[0].main,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error.message); // Debug: Print error message
    throw new Error('Error fetching weather data');
  }
}

// Route to create a new user
router.post('/', async (req, res) => {
  const { email, latitude, longitude } = req.body;
  console.log('Request Body:', req.body); // Debug: Print the request body
  try {
    const weatherData = await fetchWeatherData(latitude, longitude);
    const newUser = new User({ email, location: { latitude, longitude }, weatherData: [weatherData] });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating new user:', error.message); // Debug: Print error message
    res.status(400).json({ error: error.message });
  }
});

// Route to update a user's location
router.put('/:email/location', async (req, res) => {
  const { email } = req.params;
  const { latitude, longitude } = req.body;
  console.log('Update Location Request Body:', req.body); // Debug: Print the request body
  try {
    const weatherData = await fetchWeatherData(latitude, longitude);
    const user = await User.findOneAndUpdate(
      { email },
      { location: { latitude, longitude }, $push: { weatherData } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error updating user location:', error.message); // Debug: Print error message
    res.status(400).json({ error: error.message });
  }
});

// Route to get a user's weather data for a given day
router.get('/:email/weather', async (req, res) => {
  const { email } = req.params;
  const { date } = req.query;
  console.log('Get Weather Data Request Params:', req.params); // Debug: Print the request params
  console.log('Get Weather Data Request Query:', req.query); // Debug: Print the request query
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const weatherData = user.weatherData.filter(entry => {
      const entryDate = new Date(entry.date);
      const queryDate = new Date(date);
      return entryDate.toDateString() === queryDate.toDateString();
    });
    res.json(weatherData);
  } catch (error) {
    console.error('Error getting user weather data:', error.message); // Debug: Print error message
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
