const fs = require("fs");
const Joi = require('joi');
const path = require('path');
const { promisify } = require('util')
const readdir = promisify(require('fs').readdir)
const unlink = promisify(require('fs').unlink)

// Promise function for getting title picture from gallery
 function getPictureFromDir(file){
  return new Promise((resolve,reject) => {
      fs.readdir(file, (err, files) =>{

      if (err) return console.log(err)
  
      if (files.length > 0){
          resolve(files[0])    
      } else {
        reject(files)
      }
  });
})
}

// this function return Promise of deletion of files in directory
async function deleteAllPictures(gallery){

    return new Promise(async (resolve, reject) => {
        let images
        try {
            images = await readdir(path.join('./public', gallery))
        } catch (error) {
            reject(false)
        }
        
        for (let img of images){
            try {
                await unlink(path.join('./public', gallery, img))
            } catch (error) {
                reject(console.log(error))
            }
        }
        resolve(true)
    })
}

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

// function for getting actual time
function getNow(){
  const today = new Date();
  const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date+' '+time;
  return dateTime
}

module.exports.getPictureFromDir = getPictureFromDir
module.exports.validateGalleryCreation = validateGalleryCreation
module.exports.getNow = getNow
module.exports.deleteAllPictures = deleteAllPictures