const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router =express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const JWT_SECRET = 'itsmywebsite';
//create a User using POST "/api/auth/createuser" .No login required

router.post('/createuser',[
   body('name','Enter valid Name').isLength({min:3}),
   body('email','Enter valid Email').isEmail(),
   body('password','Password atleast 5 characters').isLength({min:5})
], async(req, res) => {
  //if there are errors, Return Bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status (400).json({ errors: errors.array()})
        }
  //Check weather the uers email is exist
  try{
    let user = await User.findOne({email:req.body.email});
      if(user)
      {
        return res.status(400).json({error:errors.array()});
      }
      const salt =  await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password,salt);
        user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
        })

        const data = {
          user: {
            id: user.id
          }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        
      res.json({authToken});
  }
  catch(error){
    console.error(error.messae);
    res.status(500).send("Internal Server Error")
  }

  })

//authenticate a User "/api/auth/login" .No login required
  router.post('/login',[
    body('email','Enter a valid email').isEmail(),
    body('password','Password cannot be blanked').exists(),

  ], async (req, res)=>{
    const errors = validationResult(req);
      if(!errors.isEmpty())
      {
        return res.status(400).json({errors:errors.array()});
      }
    const {email, password} = req.body;
      try {
        const user = await User.findOne({email});
          if(!user)
          {
            return res.status(400).json({error:"Please login with coreect credentials"});
          }
          const passwordcompare = await bcrypt.compare(password,user.password);
          if(!passwordcompare)
          {
            return res.status(400).json({error:"Please login with coreect credentials"});
          }
          const data = {
            user: {
              id: user.id
            }
          }
          const authToken = jwt.sign(data, JWT_SECRET);
          res.json({authToken});

      } catch (error) {
        console.error(error.messae);
        res.status(500).send("Internal Server Error");
      }

  })

  module.exports = router;