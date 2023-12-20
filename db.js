const mongoose = require("mongoose");
const url =
  "mongodb+srv://20eg107116:Anurag@cluster0.qvay5sx.mongodb.net/test?retryWrites=true&w=majority";
mongoose.set("strictQuery", false);

const mongo = async () => {
    try {
        await mongoose.connect(url);
        console.log("Connected to MongoDB");
        // Your code after successful connection goes here
      } catch (err) {
        console.error("Error connecting to MongoDB:", err);
      }
};

module.exports = mongo;
