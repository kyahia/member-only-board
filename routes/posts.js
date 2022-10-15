var express = require('express');
var router = express.Router();
const contoller = require('../controllers/postController');

// AUTHENTICATION MIDDLEWARE
router.use((req, res, next) => {
   if(req.isAuthenticated()) next();
   else {
      throw new Error('Not authorized, Login before attempting to view content');
   }
})
router.get('/', contoller.postList_get);

router.get('/create', contoller.createPost_get);
router.post('/create', contoller.createPost_post);

router.get('/manage', contoller.managePost_get);

router.get('/:id/delete', contoller.deletePost_get);
router.post('/:id/delete', contoller.deletePost_post);

router.get('/:id/update', contoller.updatePost_get);
router.post('/:id/update', contoller.updatePost_post);

router.get('/:id', contoller.detailPost_get);


module.exports = router;
