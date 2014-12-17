
var express = require('express');
var accountLifecycleController = require('../controllers/site/accountLifecycleController');
var applicationController = require('../controllers/site/applicationController');
var navigationController = require('../controllers/site/navigationController');
var passwordController = require('../controllers/site/passwordController');
var profileController = require('../controllers/site/profileController');
var sessionLifecycleController = require('../controllers/site/sessionLifecycleController');

var router = express.Router();

router.route('/')
    .get(navigationController.index);


router.route('/home')
    .get(navigationController.home);


router.route('/settings')
    .get(navigationController.settings);


router.route('/settings/admin')
    .get(navigationController.admin);

router.route('/login')
    .get(sessionLifecycleController.loginForm)
    .post(sessionLifecycleController.login);

router.route('/logout')
    .post(sessionLifecycleController.logout);

router.route('/join')
    .get(accountLifecycleController.accountCreationForm)
    .post(accountLifecycleController.createAccount);

router.route('/leave')
    .post(accountLifecycleController.removeAccount);

router.route('/settings/profile')
    .get(profileController.profile)
    .post(profileController.updateProfile);

router.route('/upload/policies/avatars')
    .post(profileController.avatarPolicy);

router.route('/upload/avatar')
    .post(profileController.uploadAvatar);


router.route('/password/reset')
    .get(passwordController.resetPasswdEmailForm)
    .post(passwordController.resetPasswordEmailRequest);

router.route('/password/change')
    .post(passwordController.changePassword);

router.route('/password/reset/:token_id')
    .get(passwordController.resetPasswordForm)
    .post(passwordController.resetPassword);

router.route('/settings/applications/new')
    .get(applicationController.applicationForm);

router.route('/settings/applications')
    .get(applicationController.applications)
    .post(applicationController.createApplication);

router.route('/settings/applications/:app_id')
    .get(applicationController.applicationDetail)
    .post(applicationController.updateApplication);

router.route('/settings/applications/:app_id/delete')
    .post(applicationController.removeApplication);

router.route('/settings/applications/:app_id/revoke_all_tokens')
    .post(applicationController.revokeTokens);

router.route('/settings/applications/:app_id/reset_secret')
    .post(applicationController.resetSecret);

router.route('/*')
    .get(navigationController.redirectControl);;


exports.router = router;
