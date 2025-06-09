from flask import Flask, render_template 
from flask_socketio import SocketIO 

app = Flask(__name__)

@app.route('/')
def home():   
    return render_template('home.html') 

@app.route('/create') 
def create(): 
    return render_template('create.html') 

@app.route('/join') 
def join(): 
    return render_template('join.html') 

if __name__ == '__main__':  
    app.run(debug=True) 


