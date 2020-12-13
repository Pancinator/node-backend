const express = require('express');
const bcrypt = require('bcrypt');
const user = express.Router()


const users = [] 

user.post('/register', async (req, res) => {
try {
    const salt = await bcrypt.genSalt(5)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
   
    let user = {
        name: req.body.name,
        password: hashedPassword
    }
    users.push(user)
    res.status(201).send('created')
    console.log(users)
} catch (error) {  
    res.status(500).send(error)
}})


user.post('/login', async (req, res) => {
    const user = users.find(user => user.name = req.body.name)
    if (user == null){
        return res.status(400).send('cant fing user')
    } else {
        try {
            if(await bcrypt.compare(req.body.password, user.password)) {
                res.status(200).send('User logged in')
            } else {
                res.status(409).send('Not allowed')
            }
        } catch (error) {
            res.status(500).send(error)
        }
    }
})

module.exports = user