const { json } = require('body-parser');
const express = require('express');
const galleryRouter = require('./routes/gallery')
const imageRouter = require('./routes/image')
const userRouter = require('./routes/users')

const mongoose = require('mongoose')


mongoose.connect('mongodb://localhost/users_test');


const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.use('/gallery', galleryRouter)
app.use('/images', imageRouter)
app.use('/users', userRouter)


app.listen(port, () => {
    console.log('Server listening on port', port)
})


