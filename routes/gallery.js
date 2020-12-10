const { json } = require('body-parser');
const express = require('express');
const path = require('path');
const fs = require("fs");
const Joi = require('joi');
const formidable = require('formidable');
const { date } = require('joi');
const { parse } = require('path');
const { response } = require('express');
//const async = require('async')
const { promisify } = require('util')

const readdir = promisify(require('fs').readdir)


const gallery = express.Router()

function getPictureFromDir(file){
    return new Promise((resolve,reject) => {
        fs.readdir(file, (err, files) =>{

        if (err) return console.log(err)
        if (files.length > 0){
            console.log('returned file', files[0])
            resolve(files[0])
            
        } else reject(null)
    });
})
}


gallery.get('', async (req, res) => {
    console.log('start')
    const files = await readdir('./public')
    let response = { galleries: []}
    for (let file of files){
        p = path.join('./public', file)
        const pict = await getPictureFromDir(p)
        if (pict != null){
            g = {
                path: file,
                name: decodeURI(file),
                image: {
                    path: pict,
                    fullpath: path.join(p, pict),
                    name: path.basename(path.join(p, pict), path.extname(pict)),
                    modified: getNow()
                } 
            }
        } else {
            g = {
                path: file,
                name: decodeURI(file)
            }
        }
        response.galleries.push(g)
    }
    console.log('finall response', response)
    console.log('end')
    res.send(JSON.stringify(response))
})       

gallery.get('/hello', (req, res) => {
    res.send('hello')
})

gallery.post('/:g', (req, res) => {
    let { g } = req.params
    const encodedGalleryName = encodeURI(g)
    const form = new formidable.IncomingForm()

    form.parse(req, (err, fields, files) => {
        let oldPath = files.image.path
        let newPath = path.join('./public', encodedGalleryName , files.image.name)
        if (err) return res.status(500).send(err)
        if (files.image.size == 0) return res.status(400).send('Bad request, image not found')

        fs.rename(oldPath, newPath, (err) => {
            if (err) return res.status(404).send(JSON.stringify({
                error:'Gallery with such name not found'
            }))

            res.status(201).send(JSON.stringify({
                uploaded:[{
                    path: files.image.name,
                    fullpath: path.join(encodedGalleryName, files.image.name),
                    name: path.basename(newPath, path.extname(files.image.name)),
                    modified: getNow()
                }]
            }))
            return
        })
    })
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
}

function getNow(){
    const today = new Date();
    const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date+' '+time;
    return dateTime
}

module.exports = gallery