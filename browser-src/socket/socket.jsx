// initialize socket as a singleton
import * as io from 'socket.io-client';
export const socket = io.connect();