import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});


io.on('connection', (socket) => {
    console.log('A user Connected');
    
    handler(socket);
})

server.listen(8000, () => {
    console.log('Server is running on port 8000');
})


function handler(socket) {
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log('User joined room', room);
        socket.to(room).emit('fullStateReq', 'User joined'); // request (full) state from master so that new user syncs
    }) 

    socket.on('leaveRoom', (room) => {
        socket.leave(room);
        console.log('User left room', room);
    })


    socket.on('message', (data) => {
        const { room, message } = data;
        console.log(`Message sent to room ${room}: ${JSON.stringify(message)}`);
        socket.to(room).emit('message', message);
    })

    // triggered on y-axis scroll
    socket.on('yUpdate', (data) => {
        const { room, y } = data;
        console.log(`Y update sent to room ${room}: ${y}`);
        socket.to(room).emit('yUpdate', y);
    
    })

    // triggered on any state update (text, fontsize, etc) 
    socket.on('state', (data) => {
        const { room, state } = data;
        console.log(`State update sent to room ${room}: ${JSON.stringify(state)}`);
        socket.to(room).emit('state', state);
    })
}