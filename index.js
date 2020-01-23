var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path =require('path');
var mysql = require('mysql');
var router = express.Router();

app.get('/',function(req,res){
     res.sendFile(__dirname + '/index.html');
});
app.use('/static',express.static(__dirname+'/static'));
app.use('/static',express.static(__dirname+'/static/assets/images'));

server.listen(80,function(){
    console.log("server is on and listening on port 80");
});
var users = [];
var connections =[];
var roomno =1;
var rooms = [];


rooms.push("room-"+roomno);
io.on('connection',function(socket){
    
    connections.push(socket);
    console.log("%s Connected : %s",socket.id ,connections.length);
    socket.room = 'room-'+roomno;


    if(io.nsps['/'].adapter.rooms["room-"+roomno]&& io.nsps['/'].adapter.rooms["room-"+roomno].length > 1){
        roomno++;
        rooms.push("room-"+roomno);
    }
    socket.join("room-"+roomno);
    
    io.sockets.in("room-"+roomno).emit('connectToRoom',"You have been assigned game room: "+roomno);

     //new user
     socket.on('new users',function(data,callback){
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUserNames();
    
    });

    function updateUserNames(){
        io.sockets.emit('get users',users);
    }

    function getRooms(){
        for(var r=0; r<rooms.length;r++){
            console.log("room generated :"+rooms[r]);
        }   
    }

    getRooms();
     //disconnect
     socket.on('disconnect',function(data){
        //if(!socket.username)return
        users.splice(users.indexOf(socket.id),1);
        //updateUserNames();
        connections.splice(connections.indexOf(socket),1);
        console.log("Disconnected %s : %s connected",socket.id ,connections.length);
    });
    socket.on('sendchat',function(data){
        io.sockets.in(socket.room).emit('updatechat',socket.username,data);
    });

})