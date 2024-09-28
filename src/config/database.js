const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect('mongodb+srv://bharathsrinath:LqMnhWRXjRCxl7FW@devconnect.6jl5v.mongodb.net/devConnect')
}

module.exports = connectDB;