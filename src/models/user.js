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
    enum: {
      values: ["male", "female", "other"],
      message: `{VALUE} is not a valid gender type`,
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

userSchema.methods.getJWT = async function () {
  const user = this;

  const token = await jwt.sign({ _id: user._id }, "DEV@Tinder$790", {
    expiresIn: "7d",
  });

  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );

  return isPasswordValid;
};


const User = mongoose.model("User", userSchema);

module.exports = User;
