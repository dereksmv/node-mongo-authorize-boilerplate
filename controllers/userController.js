const User = require("../models/User");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

router.post("/register", (req, res) => {
    const { username, password, email } = req.body;
    //check if user already exists so we dont save duplicate users
    User.findOne({ username }, async function(err, doc) {
        if (err) {
            console.log(err);
            res.json({message: "Something went wrong, please try again later."});
        }

        if (doc) {
            res.json({
                message: "A user with that username already exists."
            });
        }
        //failed all other if statements, so we know this is a new username
        if (!doc) {
            //validate req.body
            if (!username || !password || !email) {
                return res.json({
                    message: "Please enter all fields"
                })
            }
            //encrypt the password 
            const hashedPassword = await bcrypt.hash(password, 10)
            let userFormatted = {
                username: username,
                password: hashedPassword,
                email: email
            }
            let newUser = new User(userFormatted);
            const savedUser = newUser.save((err, doc) => {
                if (err) {
                    console.log(err);
                    res.json(err);
                }
                if (doc) {
                    const user = User.findOne(newUser);
                    const token = jwt.sign(
                        { _id: user._id, email },
                        process.env.TOKEN_KEY,
                        {
                          expiresIn: "2h",
                        }
                      );
            
                      //send created status to client, client can recieve status and redirect on confirmation of status 201 created
                      // send an httpOnly cookie so that each request is authenticated from now until the cookie expires, default 2 hours, auth details not exposed to client
                      res.status(201)
                         .cookie("x-access-token", token, {
                             httpOnly: true
                         })
                         .json({
                             message: "Registration successful"
                         });
                }
            });   
        }
    })
})

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    let user = await User.findOne({username});
   

    if (!user) {
        res.json({message: "A user with that username name does not exist.", authenticated: false});
    }
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
            { _id: user._id, email: user.email },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
          res.status(201)
          .cookie("x-access-token", token, {
              httpOnly: true
          })
          .json({
              message: "Authentication successful",
              authorized: true
          });
    }
    if (!await bcrypt.compare(password, user.password)) {
        res.json({
            message: "Invalid Password",
            authenticated: false
        })
    }
})

//use this route to view user data
router.get("/me", auth, (req, res) => {
    res.json(
        req.user
    )
})

module.exports = router;