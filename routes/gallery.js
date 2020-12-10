const { json } = require('body-parser');
const express = require('express')
const path = require('path')
const fs = require("fs")
const Joi = require('joi');

const gallery = express.Router()

gallery.get('/hello', (req, res) => {
    res.send('hello')
})

// POST method for creating new gallery directory
gallery.post('', json(), (req, res) => {
    let { error } = validateGalleryCreation(req)
    const galleryName = req.body.name

    if (error == undefined) {
        let encoded = encodeURI(galleryName)
        fs.mkdir(`./public/${encoded}`, (err) => {
            if (err && err.code === 'EEXIST') {
                res.status(409).send(err)
                return
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.status(201).send(JSON.stringify({ 
                    "name": `${galleryName}`,
                    "path": `${encoded}`  
                }))
                res.end()
                return
            }
        })
    } else {
        res.status(400).send(error.details[0].message)
    }
    
})

// validation function
function validateGalleryCreation(req){
    const schema = Joi.object({
        name: Joi.string().invalid('/').required().min(3)
    })

    if (!req.body.name.includes('/')){
        return schema.validate({ name: `${req.body.name}`});
    } else {
        req.body.name = '/'
        return schema.validate({ name: `${req.body.name}`});
    }
};

module.exports = gallery