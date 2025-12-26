const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: { type: String, required: true },
    wishlist: [
        {
            type: Schema.Types.ObjectId,
            ref: "Listing"
        }
    ]
});

// Agar direct function nahi mil raha, to hum .default property ko check karenge(for node new version write this code)

const pluginFunc = typeof passportLocalMongoose === 'function' 
    ? passportLocalMongoose 
    : (passportLocalMongoose.default ? passportLocalMongoose.default : passportLocalMongoose);

userSchema.plugin(pluginFunc);

module.exports = mongoose.model("User", userSchema);