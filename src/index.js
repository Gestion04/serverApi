// require("@babel/core").transform("code", {
//     presets: ["@babel/preset-env"],
// });
import express from 'express';
import path from 'path';
import cors from 'cors';
import "./database"
import indexRoutes from './routes/index.routes';
// const express = require('express');
// const cors = require('cors');
// require('./database');
// const indexRoutes = require('./routes/index.routes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({extended:true}))
app.set('port', process.env.PORT || 8040);
app.use(express.static(path.join(__dirname, '../public')));

// routes
app.use(indexRoutes)

//servidor escuchando en el puerto 8040
app.listen(app.get('port'), () => {
    console.log('Server is running on port ' + app.get('port'));
});
