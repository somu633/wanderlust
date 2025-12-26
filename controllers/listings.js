const Listing = require("../models/listing");
const User = require("../models/user");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" },
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
    
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // Image logic (Cloudinary)
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = { url, filename };
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

// Render edite form
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    // Cloudinary URL ko manipulate karke image size chota karna
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250,h_150,c_fill");

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// Put - Update Listing
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // Agar nayi image upload ki gayi hai
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// Listing delete karne ke liye

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};

// controllers/listings.js

module.exports.index = async (req, res) => {
    let { q, category } = req.query; 
    let filter = {};

    // 1. Agar category select ki gayi hai
    if (category) {
        filter = { category: category };
    }
    // 2. Agar search box mein kuch likha gaya hai

    else if (q && q.trim() !== "") {
        filter = {
            $or: [
                { title: { $regex: q, $options: "i" } },
                { location: { $regex: q, $options: "i" } },
                { country: { $regex: q, $options: "i" } },
                { category: { $regex: q, $options: "i" } } 
            ]
        };
    }

    const allListings = await Listing.find(filter);

    // Agar search result khali hai toh error flash message

    if (allListings.length === 0 && (q || category)) {
        req.flash("error", "No listings found for your request!");
        return res.redirect("/listings");
    }

    res.render("listings/index.ejs", { allListings });
};