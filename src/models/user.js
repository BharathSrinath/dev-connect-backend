const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 20,
  },
  lastName: {
    type: String,
    minLength: 3,
    maxLength: 20,
  },
  emailId: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
    trim: true,
    validate(value) {
        if(!validator.isEmail(value)) throw new Error("Invalid email address: " + value);
    }
  },
  password: {
    type: String,
    required: true,
    validate(value){
        if(!validator.isStrongPassword(value)) throw new Error("Enter a Strong Password: " + value);
    }
  },
  age: {
    type: Number,
    min: 16,
  },
  gender: {
    type: String,
    validate(value) {
      if (!["male", "female", "others"].includes(value))
        throw new Error("Gender data is not valid!");
    },
  },
  photoURL: {
    type: String,
    default: "",
    validate(value){
        if(!validator.isURL(value)) throw new Error("Invalid photo URL: " + value);
    }
  },
  about: {
    type: String,
    default: "Hey! I am a Developer!",
    validate(string){
        if(string.length > 100) throw new Error ("About cannot be more than 100 characters");
    }
  },
  skills: {
    type: [String],
    validate(array){
        if(array.length > 10) throw new Error ("Skills cannot be more than 10");
    }
  },
},{timestamps:true});

const User = mongoose.model("User", userSchema);

module.exports = User;
