const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require("cookie-parser");
const { MongoClient } = require('mongodb');
const crypto = require('crypto');


const uri = "mongodb+srv://root:10Jul2003@cluster0.m5wkf.mongodb.net/circles";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let connection = null

async function connectToDatabase(){
connection = await client.connect()
}
connectToDatabase()

const router = express.Router()
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(cookieParser());
router.use(bodyParser.json());

router.post('/deleteCircle', async (req, res)=>{
    if(req.body.id && req.cookies){
        const collection = client.db("circlesdb").collection("users");
        let credentials = Buffer.from(req.cookies.token, 'base64').toString('ascii').split(':')
        let login = credentials[0]
        let pass  = credentials[1]
        let user = await collection.find().toArray()
        if (user[0].login == login && user[0].password == pass){
            const collection = client.db("circlesdb").collection("circles");
            await collection.findOneAndDelete({id:parseInt(req.body.id)})
            res.json({status:"ok"})
        }
        else{
            res.sendStatus(401)
        }
    }
})

router.post('/changeCircle', async (req, res)=>{
    if(req.body.id && req.cookies && req.body.icon){
        const collection = client.db("circlesdb").collection("users");
        let credentials = Buffer.from(req.cookies.token, 'base64').toString('ascii').split(':')
        let login = credentials[0]
        let pass  = credentials[1]
        let user = await collection.find().toArray()
        if (user[0].login == login && user[0].password == pass){
            const collection = client.db("circlesdb").collection("circles");
            await collection.findOneAndUpdate({id:parseInt(req.body.id)},{ $set: {icon:req.body.icon} })
            res.json({status:"ok"})
        }
    }
    else{
        res.sendStatus(401)
    }
    
})

router.get('/getCircles', async (req, res)=>{
        const collection = client.db("circlesdb").collection("circles");
        let circles = (await collection.find().toArray())
        res.json(circles)
})

router.get('/verification', async (req, res)=>{
    if(req.query.login && req.query.pass){
        const collection = client.db("circlesdb").collection("users");
        let pass = crypto.createHash('md5').update(req.query.pass).digest('hex');
        let login= req.query.login
        let user = await collection.find().toArray()
        if (user[0].login == login && user[0].password == pass){
            res.json({status:"ok", token:`token=${Buffer.from(`${login}:${pass}`).toString('base64')}`})
        }
        else{
        res.sendStatus(401)
        }
    }
    else if(req.query.cookie){
        // Cookie verification
        const collection = client.db("circlesdb").collection("users");
        let cookie = Buffer.from(req.query.cookie, 'base64').toString('ascii')
        let credentials = Buffer.from(cookie.replace('token=', ''), 'base64').toString('ascii').split(':')
        let login = credentials[0]
        let pass  = credentials[1]
        let user = await collection.find().toArray()
        if (user[0].login == login && user[0].password == pass){
            res.json({status:"ok"})
        }      
        else{
            res.sendStatus(401) 
        }
    }
    else{
        res.sendStatus(401) 
    }
})

router.get('/getComments', async (req, res)=>{
        const collection = client.db("circlesdb").collection("circles");
        try{
        let query = (await collection.findOne({id:parseInt(req.query.id)}))
        let comments = query.comments
        res.json(comments)
        }
        catch(e){
            res.sendStatus(400)
        }
})

router.get('/getLikes', async (req, res)=>{
        const collection = client.db("circlesdb").collection("circles");
        try{
        let query = await collection.findOne({id:parseInt(req.query.id)})
        let likes = query.likes
        res.json(likes)
        }
        catch(e){
            res.sendStatus(400)
        }
})

router.post('/addCircle', async (req, res)=>{
    if(req.body.latlng){
            const collection = client.db("circlesdb").collection("circles");
            let array = await collection.find().toArray()
            let id = array[array.length - 1].id + 1
            let circle = {
                id:id,
                icon:req.body.icon,
                latlng:req.body.latlng,
                likes:0,
                comments: []
            }
            await collection.insertOne(circle)  
            console.log(`New circle added ${circle}`)     
            res.json({status:"ok", circle})
    }
    else{
        res.sendStatus(400)
    }
})

router.post('/addLike', async (req, res)=>{
 if(req.body.user && req.body.circle_id){
    const collection = client.db("circlesdb").collection("circles");
    try{
    let query = await collection.findOne( { id:parseInt(req.body.circle_id) })
    let likes = query.likes
    likes+=1
    await collection.findOneAndUpdate( { id:parseInt(req.body.circle_id) }, { $set: {likes:likes} })
    console.log(`Added new like on ${query.id}`)
    res.json({status:"ok", likes:likes})
    }catch(e){
      res.sendStatus(400)
    }
 }
 else{
     res.sendStatus(400)
 }
})

router.post('/addComment', async (req, res)=>{
    if(req.body.comment && req.body.circle_id && req.body.author){
        let comment = req.body.comment.replace(/&/g, "&amp;") // we need to escape html chars here or its an xss vulnerable
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")

        let author = req.body.author.replace(/&/g, "&amp;") // we need to escape html chars here or its an xss vulnerable
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")

            const collection = client.db("circlesdb").collection("circles");
            try{
              let query = await collection.findOne( { id:parseInt(req.body.circle_id) })
              let comments = query.comments
              comments.push({author:author, comment:comment})
              await collection.findOneAndUpdate( { id:parseInt(req.body.circle_id) }, { $set: {comments:comments} })
              console.log(`Added new comment [${author}:${comment}] on ${query.id}`)
              res.json({status:"ok", author:req.body.author, comments:comments, id:req.body.circle_id})
            }catch(e){
              res.sendStatus(400)
            }
           
     }
     else{
         res.sendStatus(400)
     }
})


module.exports = router