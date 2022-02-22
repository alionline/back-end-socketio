var app = require('express')();
var http = require('http').createServer(app);
const PORT = 8080;
var io = require('socket.io')(http);
var STATIC_CHANNELS = [{
    name: 'Global chat',
    participants: 0,
    id: 1,
    sockets: [],
    full: false
}, {
    name: 'Funny',
    participants: 0,
    id: 2,
    sockets: [],
    full: false
}, {
    name: 'topic3',
    participants: 0,
    id: 3,
    sockets: [],
    full: false
}, {
    name: 'topic4',
    participants: 0,
    id: 4,
    sockets: [],
    full: false
}];

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})


http.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});

io.on('connection', (socket) => { // socket object may be used to send specific messages to the new connected client
    console.log('new client connected');
    socket.emit('connection', null);
    socket.on('channel-join', id => {
        console.log('channel join', id);
        for(let i = 0; i < STATIC_CHANNELS.length; i++){
        // STATIC_CHANNELS.forEach(c => {
            
            let newID = STATIC_CHANNELS.length + 1;
            console.log('ik ben id: ', id)
            console.log('huidig loop id: ', STATIC_CHANNELS[i].id)
            if (STATIC_CHANNELS[i].id === id) {
                if(STATIC_CHANNELS[i].full){
                    console.log(newID)
                    STATIC_CHANNELS.push(
                        {
                            name: STATIC_CHANNELS[i].name,
                            participants: 0,
                            id: newID,
                            sockets: [],
                            full: false
                        }
                    )
                    console.log(STATIC_CHANNELS)
                    id = newID;
                }else{
                    if (STATIC_CHANNELS[i].sockets.indexOf(socket.id) == (-1)) {
                        STATIC_CHANNELS[i].sockets.push(socket.id);
                        STATIC_CHANNELS[i].participants++;
                        if(STATIC_CHANNELS[i].participants == 2 ){
                            STATIC_CHANNELS[i].full = true
                        }else if( STATIC_CHANNELS[i].participants < 2) {
                            STATIC_CHANNELS[i].full = false
                        }
                        io.emit('channel', STATIC_CHANNELS[i]);
                    }
                }
                
            } else {
                let index = STATIC_CHANNELS[i].sockets.indexOf(socket.id);
                if (index != (-1)) {
                    STATIC_CHANNELS[i].sockets.splice(index, 1);
                    STATIC_CHANNELS[i].participants--;
                    if(STATIC_CHANNELS[i].participants == 2 ){
                        STATIC_CHANNELS[i].full = true
                    }else if( STATIC_CHANNELS[i].participants < 2) {
                        STATIC_CHANNELS[i].full = false
                    }
                    io.emit('channel', STATIC_CHANNELS[i]);
                }
            }
            console.log(STATIC_CHANNELS[i])
        };

        return id;
    });
    socket.on('send-message', message => {
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        STATIC_CHANNELS.forEach(c => {
            let index = c.sockets.indexOf(socket.id);
            if (index != (-1)) {
                c.sockets.splice(index, 1);
                c.participants--;
                io.emit('channel', c);
            }
        });
    });

});



/**
 * @description This methos retirves the static channels
 */
app.get('/getChannels', (req, res) => {
    res.json({
        channels: STATIC_CHANNELS
    })
});