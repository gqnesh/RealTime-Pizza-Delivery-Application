const mongoose = require("mongoose");

const connectDB = async (DATABASE_URL) => {
  try {
    const DB_OPTIONS = {
      dbName: "pizza"
    }

    await mongoose.connect(DATABASE_URL, DB_OPTIONS);
    console.log('Database connection established...'.underline.blue);

  } catch (error) {
    console.log('Database connection error');
    console.log('error.name', error.name);
    console.log('error.message', error.message);
  }
};

module.exports = connectDB;