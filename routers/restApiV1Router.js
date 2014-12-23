var express = require('express');
var router = express.Router();
var apiController = require('../controllers/restApi/v1');

var authController = require('../controllers/oauth2server/authStrategys');

router.route('/').get(
  function(req, res) {
    console.log("Cookies: ", req.cookies);
    res.json({ message: 'You are reaching the REST API V1 for fudan bbs!' });
});

router.route('/profile/:id')
	.get(apiController.profile.getProfile);

router.route('/friends')
	.get(apiController.friend.getFriends);

router.route('/mails')
	.get(apiController.mail.getMails);

router.route('/mail/:id/:link')
	.get(apiController.mail.getMailDetail);

router.route('/sections')
	.get(apiController.section.getSections);

router.route('/section/:id')
	.get(apiController.section.getSectionDetail);

router.route('/boards')
	.get(apiController.board.getBoards);

router.route('/posts/top')
	.get(authController.isBearerAuthenticated, apiController.post.getTopPosts);

router.route('/posts/')
	.get(apiController.post.getPosts);

router.route('/post/:id')
	.get(apiController.post.getPostDetail);

router.route('/post/:id/reply')
	.get(apiController.post.getReplies);


exports.router = router;
