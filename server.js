const { json } = require('body-parser');
const express = require('express');
const galleryRouter = require('./routes/gallery')


const app = express();
const port = process.env.PORT || 3000;


app.use('/gallery', galleryRouter)
app.use(express.json());

app.listen(port, () => {
    console.log('Server listening on port', port)
})


