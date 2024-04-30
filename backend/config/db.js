const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(
      `Connected To Mongodb Database ${mongoose.connection.host}`.bgMagenta
        .white
    );
  } catch (error) {
    console.log(`Mongodb Database Error ${error}`.bgRed.white);
  }
};

module.exports = connectDB;

// const mongoose = require('mongoose')
// const connectionString = process.env.MONGO_URL
// mongoose.connect(connectionString).then(() => {        // if connection is success then .then is used with callback
//     console.log("modoDB aAtlas Successfully connected with pfserver");

// }).catch((err)=>{
//     console.log(`mongoDB Connnection Failed !! error ${err}`);
// })