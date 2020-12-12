const { json } = require('body-parser');
const express = require('express');
const path = require('path');
const fs = require("fs");
const formidable = require('formidable');
const { promisify } = require('util')
const readdir = promisify(require('fs').readdir)
const { getNow, validateGalleryCreation, getPictureFromDir, deleteAllPictures } = require('./support')
const unlink = promisify(require('fs').unlink)

const gallery = express.Router()

gallery.get('', async (req, res) => {
    const files = await readdir('./public')
    let response = { galleries: []}

    for (let file of files){
        p = path.join('./public', file)
        let pict = null
        try {
            pict = await getPictureFromDir(p)
        } catch (error) {
            console.log('logged err', error)
        }
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
    res.send(JSON.stringify(response))
})       


gallery.get('/hello', (req, res) => {
    res.send('hello')
})

// POST method for uploading a file 
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

        fs.chmod(newPath, 0o600, (err) => { 
            console.log("Trying to write to file")
            console.log(err)
            return
        })
    })
})

// GET method for getting all images from gallery
gallery.get('/:p', async (req, res) => {
    let { p } = req.params
    const encodedGalleryName = encodeURI(p)
    try {
        const images = await readdir(path.join('./public', p))
    } catch (error) {
        return res.status(404).send('Zvolena galeria neexistuje')
    }
    
    let gallery = { 
        gallery: { 
            path: encodedGalleryName,
            name: p
        },
        images: []
        }

    for (let file of images){
        let f = {
            path: file,
            fullpath: path.join('./public', file),
            name: path.basename(file, path.extname(file)),
            modified: getNow()
        }
        gallery.images.push(f)
    }
    res.status(200).send(JSON.stringify(gallery))
})

// POST method for creating new gallery directory
gallery.post('', json(), (req, res) => {
    let { error } = validateGalleryCreation(req)
    const galleryName = req.body.name
    let encoded = encodeURI(galleryName)
    if (error == undefined) {
        
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
    fs.chmod(path.join('./public', encoded), 0o600, (err) => { 
        console.log("Trying to write to file")
        console.log(err)
        return
    })
})

// DELETE method for deletening whole gallery
gallery.delete('/:g', async (req, res) => {
    const { g } = req.params
    const galleryEncoded = encodeURI(g)
    let result 
    try {
        result = await deleteAllPictures(galleryEncoded)
    } catch (error) {
        console.log(error)
    }
    
    if ( result == true){
    } else {
        res.status(404).send('Zvolena galeria neexistuje')
    }

    try {
        fs.rmdir(path.join('./public', galleryEncoded), (err) => {
            if (err) {
                return res.status(404).send(err)
            } else {
                res.status(200).send('Obrazok/galeria uspesne vymazana')
            }
        })
    } catch (error) {
        return res.status(500).send()
    }
    
})

// DELTE method for deletening single picture
gallery.delete('/:g/:p', async (req, res) => {
    const { g, p } = req.params
    const galleryEncoded = encodeURI(g)
    const pictEncoded = encodeURI(p)

    try {
        await unlink(path.join('./public', galleryEncoded, pictEncoded))
    } catch (error) {
        console.log(error)
        return res.status(404).send('Zvoleny obrazok neexistuje')
    }
    res.status(200).send('Obrazok vymazany')

})

module.exports = gallery