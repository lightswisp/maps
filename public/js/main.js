let defaultGeolocation = [45.5, -73.6] // Coordinates for the default map location (Montreal), later we can add ip geolocation 
let colors = {
    GREEN: "#149F5B",
    RED: "#DD4F43",
    GRAY: "#2E2E2E"
}
let api_link = "https://OfficialSmartCryptos.lightswisp.repl.co/"
let mymap = L.map('mapid').setView(defaultGeolocation, 13);
let token = "pk.eyJ1IjoibGlnaHRzd2lzcCIsImEiOiJja3VvcmJic2s0ZHl1MzFrNmtubmFiMG12In0.j3dVRIo0uNpIA85GvkATRA"
//https://api.mapbox.com/styles/v1/lightswisp/ckv1lrkmu2hi014laaoxhnew7.html?title=copy&access_token=pk.eyJ1IjoibGlnaHRzd2lzcCIsImEiOiJja3VvcmJic2s0ZHl1MzFrNmtubmFiMG12In0.j3dVRIo0uNpIA85GvkATRA&zoomwheel=true&fresh=true#13/33.75001/-118.4106
L.tileLayer('https://api.mapbox.com/styles/v1/lightswisp/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'developer: Discord -> @ya_v_inkognito#2752. Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'ckv1lrkmu2hi014laaoxhnew7',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: token
}).addTo(mymap);

window.onload = () =>{
    userVerifySession()
    getCircles()
}// Getting circles from database on page load, using api

var pupa = L.icon({
    iconUrl: '/images/pupa2.png',
    iconSize:     [60, 75], // size of the icon
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [9, -76] // point from which the popup should open relative to the iconAnchor
});

mymap.on('popupopen', (e)=>{
    getCommentsAndUpdate(e.popup.options.id);
    getLikesAndUpdate(e.popup.options.id);
    userVerifySession().then((response)=>{
        if(response){
        document.querySelector(`#delete_${e.popup.options.id}`).style.display = "block"
        document.querySelector(`#checkmark_${e.popup.options.id}`).style.display = "block"
        }
    })
})

mymap.on('click', (e)=>{
    let circle = L["marker"](e.latlng, {

    }).addTo(mymap)
    fetch(api_link+"api/addCircle", {
        method:"POST",
        headers: {'Content-Type': 'application/json'},
        body:JSON.stringify({latlng:circle._latlng, icon:false})
    }).then(res => res.json()).then((json)=> {
        let id = json.circle.id
        circle.bindPopup("<h3>Hello there! Please visit me :)</h3><br><input class='name' placeholder='Your name...'><textarea class='comment' placeholder='Enter your comment here...'></textarea><div class='buttons'><button onclick='deleteCircle()' class='delete' id='delete_"+id+"'>Delete</button><button class='send' onclick='sendData(`comment`)'>Send</button><button class='checkmark' onclick='changeCircle()' id='checkmark_"+id+"'><i class='fas fa-check-square'></i></button><button class='like' id='likes_"+id+"' onclick='sendData(`like`)'><i class='fas fa-heart'></i></button></div><div class='comment_section' id='"+id+"'></div>", {id:id});
    })
});

function getCircles(){
    fetch(api_link+"api/getCircles").then(res => res.json()).then(json => json.forEach(circle=>{
        let comments = circle.comments.map((comment)=>{return `<h3>${comment.author}</h3>${comment.comment}</br><hr>`}).join().replaceAll(',','')
        let likes    = circle.likes
        let id       = circle.id
        let icon     = circle.icon
        if(icon){
            L["marker"](circle.latlng, {
                icon:pupa
            }).addTo(mymap).bindPopup("<h3>Visited :)</h3><br><input class='name' placeholder='Your name...'><textarea class='comment' placeholder='Enter your comment here...'></textarea><div class='buttons'><button onclick='deleteCircle()' class='delete' id='delete_"+id+"'>Delete</button><button class='send' onclick='sendData(`comment`)'>Send</button class=''><button class='checkmark' onclick='changeCircle()' id='checkmark_"+id+"'><i class='fas fa-check-square'></i></button><button class='like' id='likes_"+id+"' onclick='sendData(`like`)'>"+likes+"<i class='fas fa-heart'></i></button></div><div class='comment_section' id='"+circle.id+"'>"+comments+"</div>", {id:id});
        }
        else{
            L["marker"](circle.latlng, {
           
            }).addTo(mymap).bindPopup("<h3>Hello there! Please visit me :)</h3><br><input class='name' placeholder='Your name...'><textarea class='comment' placeholder='Enter your comment here...'></textarea><div class='buttons'><button onclick='deleteCircle()' class='delete' id='delete_"+id+"'>Delete</button><button class='send' onclick='sendData(`comment`)'>Send</button><button class='checkmark' onclick='changeCircle()' id='checkmark_"+id+"'><i class='fas fa-check-square'></i></button><button class='like' id='likes_"+id+"' onclick='sendData(`like`)'>"+likes+"<i class='fas fa-heart'></i></button></div><div class='comment_section' id='"+circle.id+"'>"+comments+"</div>", {id:id});
        }
    }))
}

async function deleteCircle(){
    let id = document.querySelector('.comment_section').id
    fetch(api_link+"api/deleteCircle", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body:JSON.stringify({
        id:id,
        })   
    })
    location.reload()
}

async function changeCircle(){
    let id = document.querySelector('.comment_section').id
    fetch(api_link+"api/changeCircle", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body:JSON.stringify({
        id:id,
        icon:true
        })   
    })
    location.reload()
}

async function userVerifySession(){
    if(!document.cookie) {  return false   }
        let response = await fetch(api_link+`api/verification?cookie=${btoa(document.cookie)}`)
        let status   = await response.status
    if(status != 200) { return false  }
        document.querySelector('.login_panel_button').style.display  = "none"
        document.querySelector('.logout_panel_button').style.display = "block"
        return true
  }

function showLogInPanel(){
    document.querySelector('.login_panel_button').innerHTML = (document.querySelector('.login').style.display == "none" || document.querySelector('.login').style.display == '') ? "x" : "Log in"
    document.querySelector('.login').style.display          = (document.querySelector('.login').style.display == "none" || document.querySelector('.login').style.display == '') ? "flex" : "none"
}

function userLogOut(){
    document.cookie = "token=;"
    location.reload()
}

async function userSignIn(){
        let login    = document.querySelector("#_login").value
        let pass     = document.querySelector("#_pass").value
        try{
        let response   = await fetch(api_link+`api/verification?login=${login}&pass=${pass}`)
        let status     = await response.status
        let json       = await response.json()
        if(status == 200){
            document.cookie=json.token
            location.reload()
        }
        }catch(e){
            document.querySelector('.status').innerHTML = "Bad credentials!"
        }
}

async function getCommentsAndUpdate(id){
  let element       = document.getElementById(id)
  let response      = await fetch(api_link+`api/getComments?id=${id}`)
  let comments      = await response.json()
  comments          = comments.map((comment)=>{return `<h3>${comment.author}</h3>${comment.comment}</br><hr>`}).join().replaceAll(',','')
  element.innerHTML = comments              
}

async function getLikesAndUpdate(id){
    let element       = document.getElementById(`likes_${id}`)
    let response      = await fetch(api_link+`api/getLikes?id=${id}`)
    let likes         = await response.json()
    element.innerHTML = likes+"<i class='fas fa-heart'></i>" 
}

async function updateComments(element, comments){
    comments          = comments.map((comment)=>{return `<h3>${comment.author}</h3>${comment.comment}</br><hr>`}).join().replaceAll(',','')
    element.innerHTML = comments
}

async function updateLikes(element, likes){
    element.innerHTML = likes+"<i class='fas fa-heart'></i>"
}

function sendData(data){
    switch(data){
        case "comment":
            fetch(api_link+"api/addComment", {
                method:"POST", 
                headers: {'Content-Type': 'application/json'},
                body:JSON.stringify({circle_id: document.querySelector('.comment_section').id, author:document.querySelector('.name').value, comment:document.querySelector('.comment').value})
            }).then(res => res.json()).then(json =>{
                updateComments(document.querySelector('.comment_section'), json.comments)
            })
        break;

        case "like":
            fetch(api_link+"api/addLike", {
                method:"POST", 
                headers: {'Content-Type': 'application/json'},
                body:JSON.stringify({circle_id: document.querySelector('.comment_section').id, user:"test"})
            }).then(res => res.json()).then(json=>{
                updateLikes(document.querySelector('.like'), json.likes)
            })
            
        break;
    }
}
