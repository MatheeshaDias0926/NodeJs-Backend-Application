const axios = require('axios');
const User = require('./models/User');
const sendEmail = require('./sendGridMailer');

const apiKey = process.env.OPENWEATHERMAP_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;


const fetchWeatherData = async (latitude, longitude) => {
  const APIurl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
  try {
    const response = await axios.get(APIurl);
    const data = response.data;
    return {
      temperature: data.main.temp,
      condition: data.weather[0].main,
      city: data.name,
      country: data.sys.country,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    throw new Error('Error fetching weather data');
  }
};
const generateWeatherText = async (weatherData) => {
    const prompt = `Generate a weather report based on the following data: 
      Temperature: ${weatherData.temperature}°C, 
      Condition: ${weatherData.condition}, 
      City: ${weatherData.city}, 
      Country: ${weatherData.country}.`;
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating weather text:', error.message);
      return 'Unable to generate weather text.';
    }
  };

const sendWeatherReports = async () => {
  try {
    const users = await User.find({});
    for (const user of users) {
      const { email, location } = user;
      const weatherData = await fetchWeatherData(location.latitude, location.longitude);
      const emailText = `
        Weather Report:
        Location: ${weatherData.city}, ${weatherData.country}
        Temperature: ${weatherData.temperature}°C
        Condition: ${weatherData.condition}
      `;
      await sendEmail(email, 'Your Hourly Weather Report', emailText);
    }
  } catch (error) {
    console.error('Error sending weather reports:', error.message);
  }
};

module.exports = sendWeatherReports;
