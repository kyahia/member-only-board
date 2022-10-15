const Post = require('../models/Post');
const { body, validationResult } = require("express-validator");

module.exports.postList_get = (req, res, next) => {
   Post.find().populate('user').exec((err, posts) => {
      if (err) return next(err)
      const isAuthor = req.user.membership === 'author' ? true : false;
      res.render('post-list', { post_active: true, posts, user: req.user, isAuthor })
   })
};

module.exports.detailPost_get = (req, res, next) => {
   Post.findById(req.params.id).populate('user').exec((err, post) => {
      if (err) return next(err)
      if (post == null){
         const e = new Error('Not found');
         e.status = 404;
         return next(e);
      }
      const isAuthor = req.user.membership == 'author' ? true : false;
      const isOwner = post.user._id == req.user.id ? true : false;
      res.render('post-detail', { post_active: true, post, user: req.user, isAuthor, isOwner })
   });
};

module.exports.createPost_get = (req, res, next) => {
   res.render('post-form', { post_active: true, title: 'Create a Post', user: req.user });
};

module.exports.createPost_post = [
   body('title').trim()
      .isLength({ min: 1 }).withMessage("title must not be empty.")
      .escape(),
   body('content').trim()
      .isLength({ min: 1 }).withMessage("Content must not be empty.")
      .escape(),
   
   (req, res, next) => {
      const errors = validationResult(req);
      
      if(!errors.isEmpty()){
         res.render('post-form', { post_active: true, title: "Create a post", errors: errors.array(), user: req.user })
         return;
      }

      const post = new Post({
         title: req.body.title,
         content: req.body.content,
         user: req.user.id
      });

      post.save(err => {
         if (err) return next(err)
         res.redirect(post.url);
      });
   }
];

module.exports.deletePost_get = (req, res, next) => {
   Post.findById(req.params.id).exec((err, post) => {
      if (err) return next(err)
      if (post == null) {
         const e = new Error('Post not found')
         e.status = 404
         return next(e)
      }
      if (req.user.id != post.user) {
         const e = new Error('Not authorized, you are not the author');
         e.status = 403;
         return next(e);
      }
      res.render('post-delete', { post_active: true, title: "Delete post", post, user: req.user })
   })
};

module.exports.deletePost_post = (req, res, next) => {
   Post.findById(req.body.id).exec((err, post) => {
      if (err) return next(err);
      if (post.user._id != req.user.id) {
         const e = new Error('Not authorized, you are not the author');
         e.status = 403;
         return next(e);
      }
      post.remove();
      res.redirect('/post');
   })
};

module.exports.updatePost_get = (req, res, next) => {
   Post.findById(req.params.id).populate('user').exec((err, post) => {
      if(err) return next(err)
      if(post == null) {
         const e = new Error('Not found');
         e.status = 404;
         return next(e);
      }
      if (req.user.id != post.user._id) {
         const e = new Error('Not authorized, you are not the author');
         e.status = 403;
         return next(e);
      }
      res.render('post-form', { post_active: true, post, title: 'Update Post', user: req.user });
   })
};

module.exports.updatePost_post = [
   body('title').trim()
      .isLength({ min: 1 }).withMessage("title must not be empty.")
      .escape(),
   body('content').trim()
      .isLength({ min: 1 }).withMessage("Content must not be empty.")
      .escape(),
   
   (req, res, next) => {
      Post.findById(req.params.id).exec((err, post) => {
         if (post.user != req.user.id) {
            const e = new Error('Not authorized, you are not the author');
            e.status = 403;
            return next(e);
         }
         
         post.title = req.body.title;
         post.content = req.body.content;
         
         const errors = validationResult(req);
         if(!errors.isEmpty()){
            res.render('post-form', { post_active: true, title: "Update a post", errors: errors.array(), post, user: req.user })
            return;
         }

         post.save(err => {
            if (err) return next(err)
            res.redirect(post.url);
         })
      })
   }
];

module.exports.managePost_get = (req, res, next) => {
   Post.find({ user: req.user.id }).exec((err, posts) => {
      if (err) return next(err)
      res.render('post-manage', { post_active: true, posts, user: req.user, title: 'Manage posts' })
   })
};