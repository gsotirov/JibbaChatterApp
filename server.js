var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    port = process.env.PORT || 3000;

server.listen(port, function() {
    console.log('Server listening to port %d', port);
});

app.use(express.static(__dirname + '/public'));

var users = [];

io.on('connection', function(socket) {

    var addedUser = false;
    
    socket.on('new message', function(message, userData) {
        socket.broadcast.emit('new message', {
            username: userData.username,
            pic: userData.pic,
            message: message
        });
    });
    
    socket.on('add user', function(user) {

        socket.username = user.name;
        
        users.push({
            name: user.name,
            pic: user.pic
        });
        
        addedUser = true;
        
        socket.emit('login', {
            usersList: users
        });
        
        socket.broadcast.emit('user joined', {
            name: socket.username,
            pic: user.pic
        });
        
    });
    
    socket.on('disconnect', function() {

        if(addedUser) {
            
            var removed = removeElement(users, socket.username);
            
            socket.broadcast.emit('user left', removed);
        }
    });

    function removeElement(array, elemToRemove) {

        var removeElement = null;

        for(var i = 0; i < array.length; i++) {
            if(array[i].name === elemToRemove) {
                removedElement = array[i];
                array.splice(i, 1);
            }
        }
        return removedElement;
    }
    
});








