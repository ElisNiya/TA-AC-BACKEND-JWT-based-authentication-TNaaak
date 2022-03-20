var express = require('express')
var router = express.Router()
var User = require('../models/User')  //access to user model




router.get('/', (req,res, next) =>{
    User.find({}, (err,users) => {  //returns array of users
        if(err) return next(err)
        res.render('user.ejs', {users:users})  // can't render outside of user.find
    })
})

router.get('/new', (req,res) =>{

    //res.send('info')
    res.render('userForm.ejs')
})

router.post('/', (req,res, next) =>{
    //capture data
    console.log(req.body)
    //save to db
    User.create(req.body, (err, user) => {
        console.log(err, newUser)
        //error comes as null on db npm
    //response inside
        if(err) return res.redirect('/users/new')
        res.redirect('/')
    })

})


router.get('/:id', (req,res, next) =>{
    var id=req.params.id
    User.findById(id, (err,user) => {
        if(err) return next(err)
        res.render('singleUser.ejs')
    })
})

router.get('/:id/edit', (req,res) =>{
    var id = req.params.idUser.findById(id, (err, user) => {
        if(err) return next(err)
        res.render('editUser', {user})
    })
})

router.post('/:id', (req,res,next) =>{
    var id = req.params.id
    //using id find the book and update with new data coming from form
    User.findByIdAndUpdate(id, req.body, (err, updatedUser) => {
        if(err) return next(err)
        res.redirect("/users")
        //res.redirect("/user/" + "id")
    })
})

//router.delete('/:id', (req,res) =>{
router.get('/:id/delete', (req,res, next) =>{
    User.findAndDelete(req.params.id, (err, deletedUser) => {
        if(err) return next(err)
        res.redirect('/users')
    })
})

//we will replace it with get because html form allows only get and post methods


//
router.get('/register', (req,res,next) => {
    res.render('register')
})

router.post('register', async (req,res, next) => {
    try {
       var user = await User.create(req.body, (err,user) => {
            console.log(err, user)
           // res.redirect('/users/login')  //after registering we get redirected to login
            res.status(201).json({ user:user.userJSON})
        })
    } catch (error) {
        next(error)
    }
    
})

router.get('/login', (req, res,next) => {
    res.render('login')
})

router.post("/login", async (req,res, next) => {
    var {email, password} = req.body
    if(!email || !password) {
        req.flash('error', 'Email/Password required')  //flash msg
        return res.redirect("/users/login")
    }
    try {
    var user = await  User.findOne({email}) 
        if(err) return next(err)
        if(!user) {
            return res.status(400).json({error: 'Email not registered'})
        }
        //no user
        if(!user){
            return res.redirect("users/login")
        }
        
        //compare pass
        var result = await user.verifyPassword(password, (err,result) => {
            if(err) return next(err)
            if(!result) {
                return res.status(400).json({error: 'Invalid password'})
            }
            req.session.userId = user.id
            res.redirect("/users")
        })
        var token =  await user.signToken()   
        res.json( {user: user.userJSON(token)})   // on usermodel 
    } catch (error) {
        next(error)
    }   

    //check if email already exists
    User.findOne({email}, (err, user) => {
        if(err) return next(err)
        //no user
        if(!user){
            return res.redirect('/users/login')
        }
        // compare password
        user.verifyPassword(password, (err, result) =>{
            if(err) return next(err)
            if(!result) {
                return  res.redirect('users/login')   // always write "return" to stop from repeating fn
            }
            //persist logged in user information
        })
    })
})


//login form
router.get('/login', (req, res, next) =>{
    var error = req.flash('error')[0]
    res.render('login', {error})
})


//logout
router.get('/logout', (req,res) => {
    req.session.destroy()
    res.clearCookie('connect.sid')  //takes name of cookie as argument
    res.redirect('/users/login')
})

module.exports= router;
