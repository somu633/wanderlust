const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listings");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

// Cloudinary Setup
const { storage } = require("../cloudConfig.js");
const multer = require('multer');
const upload = multer({ storage });


// 1. INDEX & CREATE ROUTES

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.createListing)
    );


// 2. NEW ROUTE

router.get("/new", isLoggedIn, listingController.renderNewForm);


// 3. STATIC GET ROUTES (/:id se upar rakhein)


// Watchlist Page
router.get("/watchlist", isLoggedIn, wrapAsync(async (req, res) => {
    let user = await User.findById(req.user._id).populate("wishlist");
    res.render("listings/wishlist.ejs", { wishlist: user.wishlist });
}));

// My Bookings Page
router.get("/bookings", isLoggedIn, wrapAsync(async (req, res) => {
    const allBookings = await Booking.find({ user: req.user._id }).populate("listing");
    res.render("listings/bookings.ejs", { allBookings });
}));


// 4. DYNAMIC ID ROUTES (SABSE NICHE)

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// EDIT FORM ROUTE
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


// 5. POST ACTIONS (WISHLIST & BOOKING)


// Wishlist Toggle
router.post("/:id/wishlist", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let user = await User.findById(req.user._id);

    if (user.wishlist.includes(id)) {
        await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: id } });
        req.flash("success", "Removed from wishlist");
    } else {
        await User.findByIdAndUpdate(req.user._id, { $push: { wishlist: id } });
        req.flash("success", "Added to wishlist");
    }
    res.redirect(req.get('Referrer') || `/listings/${id}`);
}));

// Booking Route
router.post("/:id/book", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let { checkIn, checkOut } = req.body.booking;

    const date1 = new Date(checkIn);
    const date2 = new Date(checkOut);

    // Validation: Check-out date check-in se pehle nahi ho sakti
    if (date2 <= date1) {
        req.flash("error", "Check-out date must be after Check-in date!");
        return res.redirect(`/listings/${id}`);
    }

    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const listing = await Listing.findById(id);
    const totalPrice = diffDays * listing.price;

    const newBooking = new Booking({
        listing: id,
        user: req.user._id,
        checkIn,
        checkOut,
        totalPrice
    });

    await newBooking.save();
    req.flash("success", "Booking confirmed! Enjoy your stay.");
    res.redirect("/listings/bookings"); 
}));

module.exports = router;