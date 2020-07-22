var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);



//Tạo socket 
io.on('connection', function (socket) {
    console.log('Có Connection mới');

    socket.on('send', function (data) {
        console.log(data)
        io.sockets.emit('send', data);
    });
    socket.on('disconnect', () => {
        console.log('User vừa disconnect');
    });
});

//Khởi tạo 1 server listen tại 1 port
console.log('Server Run On Port Localhost:2000')
server.listen(2000);