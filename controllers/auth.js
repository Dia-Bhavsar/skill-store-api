// const User = require('../models/user');
var User = require('../models/user');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const {OAuth2Client} = require('google-auth-library');
// sendgrid
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.signup = (req, res) => {
    // console.log('REQ BODY ON SIGNUP', req.body);
    const { name, email, number, password } = req.body;

    User.findOne({ email }).exec((err, user) => {
        if (user) {
            return res.status(400).json({
                error: 'Email is taken'
            });
        }
    });

    let newUser = new User({ name, email,number, password });
    newUser.save((err, success) => {
        if (err) {
            console.log('SIGNUP ERROR', err);
            return res.status(400).json({
                error: err
            });
        }
        res.json({
            message: 'Signup success! Please signin'
        });
    });
};

exports.signin = (req,res)=>{
    const {email, password} = req.body

    User.findOne({email}).exec((err, user)=>{
        if(err || !user){
            return res.status(400).json({
                error: 'User with that email does not exist. Please SignUp.'
            })
        }

        // authenticate user
        if(!user.authenticate(password)){
            return res.status(400).json({
                error: 'Email and password does not match.'
            })
        }

        // generate tocken send to client
        const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET, {expiresIn:'7d'})
        const {_id, name, email, number} = user

        return res.json({
            token,
            user:{_id,name,email,number}
        })
    })
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = (req, res) => {
    const { idToken } = req.body;

    client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID }).then(response => {
        // console.log('GOOGLE LOGIN RESPONSE',response)
        const { email_verified, name, email } = response.payload;
        if (email_verified) {
            User.findOne({ email }).exec((err, user) => {
                if (user) {
                    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
                    const { _id, email, name, role } = user;
                    return res.json({
                        token,
                        user: { _id, email, name, role }
                    });
                } else {
                    let password = email + process.env.JWT_SECRET;
                    user = new User({ name, email, password });
                    user.save((err, data) => {
                        if (err) {
                            console.log('ERROR GOOGLE LOGIN ON USER SAVE', err);
                            return res.status(400).json({
                                error: 'User signup failed with google'
                            });
                        }
                        const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
                        const { _id, email, name, role } = data;
                        return res.json({
                            token,
                            user: { _id, email, name, role }
                        });
                    });
                }
            });
        } else {
            return res.status(400).json({
                error: 'Google login failed. Try again'
            });
        }
    });
};

// exports.signup = (req, res) => {
//     const { name, email, password } = req.body;

//     User.findOne({ email }).exec((err, user) => {
//         if (user) {
//             return res.status(400).json({
//                 error: 'Email is taken'
//             });
//         }

//         const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' });

//         const emailData = {
//             from: process.env.EMAIL_FROM,
//             to: email,
//             subject: `Account activation link`,
//             html: `
//                 <h1>Please use the following link to activate your account</h1>
//                 <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
//                 <hr />
//                 <p>This email may contain sensetive information</p>
//                 <p>${process.env.CLIENT_URL}</p>
//             `
//         };

//         sgMail
//             .send(emailData)
//             .then(sent => {
//                 // console.log('SIGNUP EMAIL SENT', sent)
//                 return res.json({
//                     message: `Email has been sent to ${email}. Follow the instruction to activate your account`
//                 });
//             })
//             .catch(err => {
//                 // console.log('SIGNUP EMAIL SENT ERROR', err)
//                 return res.json({
//                     message: err.message
//                 });
//             });
//     });
// };
