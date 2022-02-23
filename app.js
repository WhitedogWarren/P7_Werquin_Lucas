const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql2');

require('dotenv').config();

//gestion du cors
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

//Permet la récupération des données POST ( req.body )
app.use(express.json());

const dbConnexion = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

dbConnexion.connect();

//création des routes
app.use('/images', express.static(path.join(__dirname, 'images')));
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const userAdminRoute = require('./routes/userAdmin');
const postRoute = require('./routes/posts');
const postModeratorRoute = require('./routes/postsModerator');
app.use('/api/auth', authRoute);

app.use('/api/user', userRoute);
app.use('/api/user/admin', userAdminRoute);

app.use('/api/posts', postRoute);
app.use('/api/posts/moderator', postModeratorRoute);

app.use('/', (req, res, next) => {
    console.log('route demandée :');
    console.log(req.originalUrl);
    res.status(200).json('Bonjour')
})

//////
// TODO : 404 not found
//////

module.exports = app;