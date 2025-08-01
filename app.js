// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
// const ExpressError = require("./utils/ExpressError.js");
// const {listingSchema} = require("./schema.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// main()
//     .then(() => {
//         console.log("connected to db");
//     })
//     .catch((err) => {
//         console.log(err);
//     });

// async function main() {
//     await mongoose.connect(MONGO_URL);
// }

// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname,"views"));
// app.use(express.urlencoded({extended: true}));
// app.use(methodOverride("_method"));
// app.engine("ejs",ejsMate);
// app.use(express.static(path.join(__dirname,"/public")));

// app.get("/", (req,res) => {
//     res.send("Hi, I am root");
// });

// const validateListing = (req, res, next) => {
//     let {error} = listingSchema.validate(req.body);
    
//     if (error) {
//         let errMsg = error.details.map(el => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     }
//     else {
//         next();
//     }
// }

// app.get("/listings", wrapAsync(async (req,res) => {
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs", { allListings });
// }));

// app.get("/listings/new", (req,res) => {
//     res.render("listings/new.ejs");
// });

// app.get("/listings/:id", wrapAsync(async(req,res) => {
//     let {id} = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/show.ejs", {listing});
// }));

// app.post("/listings",validateListing, wrapAsync(async (req, res, next) => {
    

    
//     const newListing = new Listing(req.body.listing);
    
//     await newListing.save();
//     res.redirect("/listings");
// }));

// app.get("/listings/:id/edit", wrapAsync(async(req,res) => {
//     let {id} = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit.ejs", { listing });
// }));

// app.put("/listings/:id",validateListing, wrapAsync(async (req,res) => {
//     let {id} = req.params;
//     await Listing.findByIdAndUpdate(id, {...req.body.listing});
//     res.redirect(`/listings/${id}`);
// }));

// app.delete("/listings/:id", wrapAsync(async (req,res) => {
//     let {id} = req.params;
//     let deletedListing = await Listing.findByIdAndDelete(id);
//     console.log(deletedListing);
//     res.redirect("/listings");
// }));

// // Catch all undefined routes
// // app.all("*", (req, res, next) => {
// //     next(new ExpressError(404, "Page Not Found"));
// // });

// // Error handling middleware
// app.use((err, req, res, next) => {
//     let { statusCode = 500, message = "Something went wrong!" } = err;
    
//     // Add stack trace for debugging (only in development)
//     err.trace = process.env.NODE_ENV === 'development' ? err.stack : '';
    
//     res.status(statusCode).render("error.ejs", { err });
// });

// app.listen(8080, () => {
//     console.log("server is listening to port 8080");
// });















if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const dbUrl = process.env.ATLASDB_URL;
main()
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});


store.on("error",() => {
    console.log("ERROR in MONGO SESSION STORE",err);
});


const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true // Prevents client-side JavaScript from accessing the cookie
    }
};

// app.get("/", (req,res) => {
//     res.send("Hi, I am root");
// });
app.get("/", (req,res) => {
    res.redirect("/listings");
});

app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; // Make currentUser available in all templates
    next();
});


app.get("/demouser", async(req,res) => {
    let fakeUser = new User ({
        email: "student@gmail.com",
        username: "delta-students"
    });



    let registeredUser = await User.register(fakeUser, "helloworld");
    res.send(registeredUser); 
})



const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }
};



app.use("/listings", listingRouter);



app.use("/listings/:id/reviews",reviewRouter);

app.use("/", userRouter);

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});





