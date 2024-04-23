const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  GID: {
    type: String
  },
  firstname: {
    type: String,
    required: true
  },

  lastname: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    default: (val) => {
      if (val.GID) {
        return val.GID
      }
    },
    required: true
  },

  role: {
    type: String,
    required: true,
    default: "customer",
    enum: ["customer", "admin"]
  }

}, { timestamps: true }
);

//compiling schema and creating a model

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;