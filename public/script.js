const socket = io(`/`);
const videoGrid = document.getElementById('video-grid');
const peer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

const myVideo = document.createElement('video');
myVideo.muted = false;
myVideo.play();


const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio:true
}).then(stream => {
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    })
})

socket.on('user-disconnected', userId => {
    if(peers[userId]) peers[userId].close();
})

peer.on('open', id => {   
    socket.emit("join-room", ROOM_ID, id);
})

function addVideoStream(video, stream) {
    video.srcObject = stream;

    video.addEventListener('loadmetadata', () => {
        video.play();
    })

    videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream);
    call.on('stream', userVideoStream => {
        const video = document.createElement('video');
        addVideoStream(video, userVideoStream);
    })

    call.on('close', () => {
        video.remove();
        peers[userId] = call;
    })
}