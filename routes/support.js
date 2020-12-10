const fs = require("fs");


// Promise function for getting title picture from gallery
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