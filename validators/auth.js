const {
    check
} = require('express-validator');

exports.userSignUpValidator = [
    check('name')
    .not()
    .isEmpty()
    .withMessage('Name is required'),
    check('email')
    .isEmail()
    .withMessage('Must be a valid email address'),
    check('number')
    .isNumeric()
    .withMessage('Should be number ')
    .isLength({
        min: 10, max:10
    })
    .withMessage('Phone Number should be 10 digit '),
    check('password')
    .isLength({
        min: 6
    })
    .withMessage('Password must be at least 6 characters long')

]


exports.userSigninValidator = [
    check('email')
    .isEmail()
    .withMessage('Must be a valid email address'),
    check('password')
    .isLength({
        min: 6
    })
    .withMessage('Password must be at least 6 characters long')

]