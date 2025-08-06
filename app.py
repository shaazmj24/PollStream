from flask import Flask, render_template, request, redirect, url_for, session
from flask_socketio import SocketIO 
from flask import abort 
import random 
import string 
import json 
import time

app = Flask(__name__)
app.secret_key = '8989dog4040'
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
        code_entered = request.form.get('code').upper().strip()
        if code_entered in polls: 
            return redirect(url_for('view_poll', code=code_entered))
        else: 
            return abort(404) 
    
    return render_template('join.html') 

@app.route('/poll/<code>')
def view_poll(code): 
    return render_template('poll.html', code=polls[code], timer=polls[code]["time"], identity=code)  


@app.route('/result', methods=['POST'])
def voters():  
    identity = request.form.get('identity')
    option = request.form.get('vote')
    #make new session if not created yet (global variable)
    if identity in session: 
        choice_map = session[identity]
    else:   
        choice_map = {}

    if (option == "none"):  
        choice, selected = None, None
    else:  
        selected, choice = option.split("&")  
        if choice in choice_map:  
            choice_map[choice] += 1
        else: 
            choice_map[choice] = 1 

    #save updated map back to session 
    session[identity] = choice_map      #like session[#code#, variable]  
    return '', 204                          #return silent/empty response with 204 to avoid invalid response 
                                            #error and stay on the same page(poll). ideal for using AJAX JS


@app.route('/chart') 
def chart(): 
    identity = request.args.get("id")        #query parameter in url so use args 
    choice_map = session[identity] 
    key_choices = list(choice_map.keys())
    nofchoices = list(choice_map.values())

    return render_template('chart.html', key_choices=key_choices, nofchoices=nofchoices)

@app.route('/livechart', methods=['GET', 'POST'])
def livechart(): 
    identity = request.args.get("id") 
    choice_map = session[identity]
    key_choices = list(choice_map.keys())
    nofchoices = list(choice_map.values())
    return render_template('live.html', key_choices=key_choices, nofchoices=nofchoices)

if __name__ == '__main__':  
    app.run(host='0.0.0.0', port=5001, debug=True)   




 