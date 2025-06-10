from flask import Flask, render_template, request, redirect, url_for
from flask_socketio import SocketIO 
from flask import abort 
import random 
import string 

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
        question = request.form.get('ques') 
        options = [request.form.get(str(i)) for i in range(1, 5)] 
        options = [op for op in options if op]              #if op returns actual value otherwie none  
        poll_code = generate_code()
        while poll_code in polls: 
            poll_code = generate_code()
        
        polls[poll_code] = { 
            "ques": question, 
            "options": options, 
        }  
        return poll_code
    return render_template('create.html') 
 
@app.route('/join', methods=['GET', 'POST'])
def join(): 
    Valid_code = ["abd", "123", "cc"]
    if request.method == 'POST': 
        code_entered = request.form.get('code')
        if code_entered in Valid_code: 
            return redirect(url_for('poll'))
        else: 
            return abort(404)
    return render_template('join.html') 


if __name__ == '__main__':  
    app.run(debug=True)   


   

 

