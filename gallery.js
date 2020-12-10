const { json } = require('body-parser');
const express = require('express')
const path = require('path')
const fs = require("fs")
const Joi = require('joi');

const gallery = express.Router()

gallery.use((req, res, next) => {
    console.log('routing')
    next()
})


gallery.get('/hello', (req, res) => {
    res.send('hello')
})

gallery.post('', json(),(req, res) => {
    console.log(req.body)
    let result = validateGalleryCreation(req)
    if (!result.error) {
        fs.mkdir(`./public/${req.body.name}`, (err) => {
            if (err) {
                return console.error(err)
            } else {
                return console.log('created successguly')
            }
        })
        res.setHeader('Content-Type', 'application/json');
        res.status(201).send(JSON.stringify({ "name": `${req.body.name}`}))
        res.end()
        return
    } else {
        res.status(400).send(result.error.details[0])
    }
    
})

// validation function
function validateGalleryCreation(req){
    const schema = Joi.object({
        name: Joi.string().invalid('/').required()
    })
    console.log(schema.validate({ name: `${req.body.name}`}))
    return schema.validate({ name: `${req.body.name}`});
};

module.exports = gallery