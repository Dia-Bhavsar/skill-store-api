const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');

const app = express()

// connect DB
mongoose
    .connect(process.env.DATABASE, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => console.log('DB connected'))
    .catch(err => console.log('DB CONNECTION ERROR: ', err));
    
// import routes
const authRoutes = require('./routes/auth')

app.use(morgan('dev'));
app.use(bodyParser.json())
// app.use(cors());

if ((process.env.NODE_ENV = 'developement')) {
    app.use(cors({
        origin: `http://localhost:3000`
    }));
}

// middleware 
app.use('/api', authRoutes)


const port = process.env.PORT || 8000
app.listen(port, () => {
    console.log(`API is running on ${port} - ${process.env.NODE_ENV}`)
})