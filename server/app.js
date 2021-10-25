const express = require('express')
const app     = express()
const router = require('./router')
const path   = require('path')
const PORT    = 3333

app.set('trust proxy', true)
app.use((req,res,next)=>{
  console.log(req.ip)
  next()
})
app.use(express.static('../public')) 
app.use('/api', router)

app.get("/", (req, res)=>{
    console.log("asd")
    res.sendFile(path.join(__dirname, "../", "index.html"))
})

app.listen(PORT, ()=>{
    console.log(`Server is listening on port ${PORT}`)
})