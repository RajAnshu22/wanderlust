const User = require("../models/user.js");






module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};




module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);



        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        });
        
        } catch (err) {
            
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};




module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};



module.exports.login = async(req, res) => {
    
    req.flash("success", "Welcome back to wanderlust!");


    let redirectUrl = res.locals.redirectUrl || "/listings"; // Use saved redirect URL or default to listings

    res.redirect(redirectUrl);



    
};




module.exports.logout =  (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};