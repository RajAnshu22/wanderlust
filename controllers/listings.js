const Listing = require("../models/listing.js");






module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm =  (req,res) => {
    
    res.render("listings/new.ejs");
};


module.exports.showListing = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author',
            },
        })
        .populate('owner'); // Populate the owner field to get user details
    if(!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings"); // Added return statement
    }
    console.log(listing);
    res.render("listings/show.ejs", {listing});
};



module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;


    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // Set the owner to the logged-in user
    newListing.image = {url , filename};
    await newListing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings"); // Added return statement
    }
    let originalImageUrl = listing.image.url;
     originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs", { listing , originalImageUrl });
};

module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
    

    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});



    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;


        listing.image = {url , filename};
        await listing.save();



    } 


    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};