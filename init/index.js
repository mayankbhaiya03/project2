

require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");


const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/yelp-camp";

async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Connected to DB");

        await Listing.deleteMany({});
        initData.data = initData.data.map((obj) => ({
            ...obj,
            owner: "687f8cb63806233121ce41a9", 
        }));

        await Listing.insertMany(initData.data);
        console.log("Data was initialized successfully.");

      
        await mongoose.disconnect();
        console.log("Disconnected from DB");
    } catch (err) {
        console.error("Error during DB initialization:", err);
    }
}

main();
