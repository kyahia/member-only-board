var express = require('express');
var router = express.Router();
const contoller = require('../controllers/userController');

function isLogged (req, res, next) {
   if(req.isAuthenticated()) next();
   else {
      throw new Error('Not authorized, Login before attempting to view content');
   }
}

/* GET users listing. */
router.get('/', contoller.signUp_get);

router.post('/', contoller.signUp_post);

router.use(isLogged);

router.get('/dashboard', contoller.dashboard_get);
router.post('/dashboard', contoller.dashboard_post);
router.get('/dashboard/password', contoller.passwordEdit_get);
router.post('/dashboard/password', contoller.passwordEdit_post);

router.get('/all', contoller.usersList_get);

module.exports = router;
