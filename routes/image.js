const express = require('express');
const path = require('path');
const fs = require("fs");
const sharp = require('sharp');

const image = express.Router()

// GET function for getting the resize image
image.get('/:w/:g/:i', (req, res) => {
  console.log('in')
  const root = 'C:/Users/Pancinator/Desktop/NODEjs/bart-backend/node-backend'
  const { w, g, i } = req.params
  const pictEncoded = encodeURI(i)
  const galleryEncoded = encodeURI(g)
  const size = w.split("x")
    
  let p = path.join(root, './public', galleryEncoded, pictEncoded)
  console.log('path', p)

  sharp(p).resize({ height: parseInt(size[0]), width: parseInt(size[1])}).toBuffer((err, data, info) => {
    res.header('Content-Type', 'image/gif')
    if (err) return res.status(404).send('Not found')
    res.status(200).send(data)
  })
})


module.exports = image