const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose')
const { Post, validatePost ,validateEdit} = require("../models/post");
const { User } = require('../models/user')
const { Comment } = require("../models/comment")
const { Category } = require("../models/category")
const {checkAuthenticated, checkNotAuthenticated} = require('../middleware/auth')



// get all posts
router.get('/posts', checkAuthenticated, async (req, res) => {  
  try {
      const posts = await Post.find().sort('-date')

      res.render('posts/posts.ejs', {  
          posts : posts
      })
  }   catch(err) {
      console.log(err)
  }
})
//profile get database from posts
router.get('/profile', checkAuthenticated, async (req, res) => {  
  try {
      const posts = await Post.find().sort('-date')
	  const users = await User.find({_id:req.session.passport.user});
	  user = users[0];
      res.render('posts/profile.ejs', {  
          posts : posts,
		  user : user,
      })
  }   catch(err) {
      console.log(err)
  }
})
//editprofile 
router.get('/editprofile', checkAuthenticated, async (req, res) => {  
  try {
		const posts = await Post.find().sort('-date')
		const users = await User.find({_id:req.session.passport.user});
		user=users[0];
		res.render('posts/editprofile.ejs', {  
          posts : posts,
		  user : user,
		})

  }   catch(err) {
      console.log(err)
  }
})
router.post('/editprofile', checkAuthenticated, async(req, res) => {
	const users = await User.find({_id:req.session.passport.user});
	const user = users[0];
	console.log(user)
	
	const { error } = validateEdit(req.body)
    if(error) {
        return res.render('posts/editprofile.ejs', {
            errors : error.details[0].message,
			user : user,
        })
    } 
	else {
		
	}
    try {
		user.set(req.body);
		
		const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(user.password, salt)
        user.password = hashedPassword;
		console.log(user)
        await user.update({name:req.body.name})
		try{
			await user.update({email:req.body.email})
		}catch(error){
			return res.render('posts/editprofile.ejs', {
			    errors :'The given email already exists. Try new email' ,
			    user : user,
			})
		}
		
		await user.update({password:hashedPassword})
		await user.update({confirmPassword:hashedPassword})
        await req.flash('success_msg', "You are now edit profile")
        res.redirect('/profile')

    }   catch(error) {
        return res.render('posts/editprofile.ejs', {
            errors : error,
            user : user,
        })
    }

})

// New post Route
router.get("/posts/add", checkAuthenticated, async(req, res) => {
  try {
    const categories = await Category.find({})
    const posts = new Post()

    res.render("posts/addpost.ejs", {
      categories : categories,
      posts : posts
    });
  } catch (err) {
    console.log(err);
  }
});

// Create new post Route
router.post("/posts/add", checkAuthenticated, async (req, res) => {
  const categories = await Category.find({})
  const posts = new Post()

    const { error } = validatePost(req.body);
    if (error) {
         res.render("posts/addpost.ejs", {
        errors: error.details[0].message,
        title: req.body.title,
        body: req.body.body,
        author: req.body.author,
        categories : categories,
        posts : posts
      });
    }
    
  const post = new Post({
    title: req.body.title,
    category: req.body.category,
    body: req.body.body,
    author: req.body.author
  });

  saveImage(post, req.body.mainImage)

  try { 
    const newPost = await post.save()
    await req.flash("success_msg", "Your post has been added successfully.")

    // Send socket message that new post is created
    req.app.io.emit('server:postCreated');

    res.redirect("/")
  } catch (error) {
     res.render("posts/addpost.ejs", {
      errors: error.message,
      title: req.body.title,
      category: req.body.category,
      body: req.body.body,
      author: req.body.author,
      categories : categories,
      posts : posts
    });
  }
});

// load edit post form
router.get("/posts/edit/:id",checkAuthenticated, async (req, res) => {
  const categories = await Category.find({})
  const posts = new Post()
  try {
    const post = await Post.findById(req.params.id).populate('category').exec();
    res.render("posts/editpost.ejs", {
      post: post,
      categories : categories,
      posts : posts
    });
  } catch (err) {
    console.log(err);
  }
});

// submit edit post form
router.post("/posts/edit/:id", checkAuthenticated, async (req, res) => {
  const post = await Post.findById(req.params.id);
  console.log(post)
  try {
    post.set(req.body);
    const { error } = validatePost(req.body);

    saveImage(post, req.body.mainImage)

    if (error) {
      res.render("posts/editpost.ejs", {
        errors: error.details[0].message,
        post: post
      });
    }
    await post.save();
    await req.flash("success_msg", "Your post has been updated successfully.");
    res.redirect("/posts/" + post._id);
  } catch (error) {
    res.render("posts/editpost.ejs", {
      errors: error,
      post: post
    });
  }
});

// delete post
router.delete("/posts/:id", checkAuthenticated, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    res.send("DELETEING POST...");
    await req.flash("success_msg", "Your post has been updated successfully.");
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});



// get single post
router.get("/posts/:id", checkAuthenticated, async (req, res) => {

  try {
    const post = await Post.findById(req.params.id).populate('category').exec();
    res.render("posts/post.ejs", {
      post: post
    });
  } catch (err) {
     res.render('./error/404.ejs')
  }
});









// Set mainImage and mainImageTypr property
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
function saveImage(post, imageEncoded) {
  if (imageEncoded == null) return;
  const image = JSON.parse(imageEncoded);
  if (image != null && imageMimeTypes.includes(image.type)) {
    post.mainImage = new Buffer.from(image.data, 'base64');
    post.mainImageType = image.type;
  }
}



module.exports = router;




