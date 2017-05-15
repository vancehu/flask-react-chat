from flask import Flask, render_template, request, json
from flask_socketio import SocketIO, send, emit, join_room
import time

app = Flask(__name__)
# app.debug = True
app.config['SECRET_KEY'] = ":8h=!SvF"
io = SocketIO(app)

# app template


@app.route('/')
def index():
    return render_template('index.html')

# names list will be re-broadcasted everytime a new 'register/disconnect' event occurs
# this is a workaround for not saving any user info on server
# use 'update_counter' to resolve conflicts


update_counter = 0


@io.on('register')
def handle_register(name):
    # register: join a room of the same name (to receive message);
    # send a success status and request all users to re-broadcast their names
    global update_counter
    update_counter += 1
    join_room(name)
    emit('register_success', name)
    emit('request_update_name', update_counter, broadcast=True)


@io.on('disconnect')
def handle_disconnect():
    # request all users to re-broadcast their names (so disconnected users can
    # be detected)
    global update_counter
    update_counter += 1
    emit('request_update_name', update_counter, broadcast=True)


@io.on('update_name')
def handle_update_name(data):
    # forward name broadcast
    #data: {update_counter: int, name: str}
    emit('update_name', data, broadcast=True)


@io.on('send')
def handle_send(data):
    # send message to a specified user (room)
    # data: {body: str, from: str, to: str}
    timestamp = int(time.time() * 1000)
    # response a confirmation with timestamp to the sender
    emit('send_success', {'body': data['body'],
                          'user': data['to'], 'timestamp': timestamp})
    # send the message to the receiver
    emit('new_message', {'body': data['body'],
                         'user': data['from'], 'timestamp': timestamp}, room=data['to'])


if __name__ == '__main__':
    io.run(app, host="0.0.0.0")
