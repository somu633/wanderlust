const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const ATLASDB_URL ="mongodb+srv://subhasaunth26_db_user:1GsKCyo44CVtFXJZ@cluster0.xzaattb.mongodb.net/?appName=Cluster0"

main()
  .then(() => {
    console.log("connected to DB");
    initDB(); 
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(ATLASDB_URL);
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});

    // Har listing mein owner ID aur category map karna

    const updatedData = initData.data.map((obj) => ({
      ...obj,
      owner: "658298642bd365691f421f64", 
      category: obj.category || "Trending",
    }));

    await Listing.insertMany(updatedData);
    console.log("Data was initialized successfully!");
  } catch (err) {
    console.log("Error initializing data:", err);
  }
};