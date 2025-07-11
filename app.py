from flask import Flask, render_template, request, redirect, url_for
from flask_socketio import SocketIO 
from flask import abort 
import random 
import string 
import json 
import time

app = Flask(__name__)
polls = {} 

@app.route('/')
def home():   
    return render_template('home.html') 

def generate_code(): 
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))  #k=n returns list of random elements, join combine list into one string. 
                                                                                 #the '' represents something between letter. for e.g '-' then A-1-B-B-3

@app.route('/create', methods=['POST', 'GET']) 
def create(): 
    if request.method == 'POST': 
        time = request.form.get('time')
        question = request.form.get('ques') 
        options = [request.form.get(letter) for letter in string.ascii_uppercase if request.form.get(letter)]   #if op returns actual value otherwie none  
        poll_code = generate_code()
        while poll_code in polls: 
            poll_code = generate_code()
        
        polls[poll_code] = { 
            "ques": question, 
            "time": time, 
            "options": options, 
        }  
        return render_template('code.html', poll_code=poll_code)
    return render_template('create.html') 
 
@app.route('/join', methods=['GET', 'POST'])
def join(): 
    if request.method == 'POST': 
        code_entered = request.form.get('code').upper()
        if code_entered in polls: 
            return redirect(url_for('view_poll', code=code_entered))
        else: 
            return abort(404)
    return render_template('join.html') 

@app.route('/poll/<code>')
def view_poll(code): 
    return render_template('poll.html', code=polls[code], timer=polls[code]["time"])  

@app.route('/result', methods=['POST']) 
def chart():   
    selected = request.form.get('vote')  
    choice = request.form.get('op')
    return render_template('chart.html', selected=selected, choice=choice)


if __name__ == '__main__':  
    app.run(debug=True)   



 





 