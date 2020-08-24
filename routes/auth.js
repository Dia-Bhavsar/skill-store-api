const express = require('express');
const {
    signup, signin, googleLogin
} = require('../controllers/auth');
const {
    userSignUpValidator, userSigninValidator
} = require('../validators/auth');
const { runValidation } = require('../validators');
const router = express.Router()

router.post('/signup', userSignUpValidator, runValidation, signup);
router.post('/signin', userSigninValidator, runValidation, signin);
router.post('/google-login', googleLogin);

module.exports = router