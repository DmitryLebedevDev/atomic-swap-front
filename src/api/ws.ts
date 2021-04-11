import openSocket from 'socket.io-client';

export const wsClient = openSocket('http://localhost:3113')