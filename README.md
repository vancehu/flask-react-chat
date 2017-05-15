# React + Flask + Socket.io Chatroom

Installation
-----------------

run directly (javascript is pre-built):
```
pip install -r ./requirements.txt
python ./server.py
```

debug/build javascript:

`npm install` or `yarn install`

`npm run build:dev` for dev environment
`npm run build` for prod environment

output folder is `./static`

Key files
--------------------

server.py                   Server script

browser-src/
  
  index.jsx:                Entry point
  
  App.jsx:                  Main component
  
  partials/                 Partial components
    
    ChatBox/ChatBox.jsx

    Register/Register.jsx

    Unopened/Unopened.jsx

    UserList/UserList.jsx

  socket/

    socket.jsx             socket.io instance
