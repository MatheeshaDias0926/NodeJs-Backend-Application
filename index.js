require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/users'); // Add this line to import usersRouter
const sendWeatherReports = require('/Users/matheeshadias/weather-app/index.js');

const cron = require('node-cron');



const app = express();
app.use(express.json());
app.use('/users', userRoutes);

const port = process.env.PORT || 3000;

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

  app.use('/users', userRoutes); // Use the usersRouter

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Schedule the task to run every 3 hours
cron.schedule('0 */3 * * *', () => {
  console.log('Sending weather reports...');
  sendWeatherReports();
});
