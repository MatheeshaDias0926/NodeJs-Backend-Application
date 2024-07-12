const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  weatherData: [
    {
      date: { type: Date, required: true },
      temperature: { type: Number, required: true },
      condition: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model('User', userSchema);
