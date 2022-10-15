const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { body, validationResult, check } = require("express-validator");


function isAdmin (req, res, next) {
   if (req.user.membership !== 'author') {
      e = new Error('Not Authorized');
      e.status = 403;
      throw e;
   }
   next();
}

module.exports.signUp_get = (req, res, next) => {
   res.render('sign-up');
};

module.exports.signUp_post = [
   body('fullname').trim()
      .isLength({ min: 1 }).withMessage("Name must not be empty.")
      .escape(),
   body('username').trim()
      .isLength({ min: 1 }).withMessage("Username must not be empty.")
      .escape(),
   body('email').trim()
      .isLength({ min: 1 }).withMessage("Name must not be empty.")
      .escape(),
   check('password').exists(),
   check('confirm-password', 'Password Confirmation field must have the same value as the password field')
      .exists()
      .custom((value, { req }) => value === req.body.password),

   (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
         res.render('sign-up', { title: "Sign Up", errors: errors.array() })
         return;
      }
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
         if (err) return next(err);

         const user = new User({
            fullname: req.body.fullname,
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
         });
         user.save(err => {
            if (err) return next(err);
            res.redirect("/");
         });
      });
   }
];

module.exports.dashboard_get = (req, res, next) => {
   User.findById(req.user).exec((err, user) => {
      if (err) return next(err);
      res.render('user-dashboard', { user, dashboard_active: true });
   });
};

module.exports.dashboard_post = [
   body('fullname').trim()
      .isLength({ min: 1 }).withMessage("Name must not be empty.")
      .escape(),
   body('username').trim()
      .isLength({ min: 1 }).withMessage("Username must not be empty.")
      .escape(),
   body('email').trim()
      .isLength({ min: 1 }).withMessage("Name must not be empty.")
      .escape(),
   (req, res, next) => {
      User.findById(req.user).exec((err, user) => {
         if (err) return next(err);

         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            res.render('user-dashboard', { user: req.user, errors: errors.array(), user: req.user, dashboard_active: true })
            return;
         }

         user.fullname = req.body.fullname;
         user.username = req.body.username;
         user.email = req.body.email;

         user.save(err => {
            if (err) return next(err);
            res.redirect("/user/dashboard");
         });

      })
   }
];

module.exports.passwordEdit_get = (req, res, next) => {
   res.render('user-passwordEdit', { user: req.user, dashboard_active: true });
};

module.exports.passwordEdit_post = [
   check('password').exists(),
   check('confirm-password', 'Password Confirmation field must have the same value as the password field')
      .exists()
      .custom((value, { req }) => value === req.body.password),
   (req, res, next) => {
      const errors = validationResult(req);
      User.findOne({ username: req.user.username }, (err, user) => {
         if (err) return next(err);

         bcrypt.compare(req.body.oldPassword, user.password, (err, result) => {
            if (!result) {
               const validationErrors = [...errors.array(), { msg: 'password check failed'}]
               res.render('user-passwordEdit', { user: req.user, errors: validationErrors, dashboard_active: true })
               return;
            }
            user.save(err => {
               if (err) return next(err);
               res.redirect("/user/dashboard");
            });
         })
      });
   }
];

module.exports.usersList_get = [ isAdmin, (req, res, next) => {
   User.find().exec((err, users) =>{
      if (err) return next(err)
      res.render('user-list', { user: req.user, dashboard_active: true, users })
   });
}];
