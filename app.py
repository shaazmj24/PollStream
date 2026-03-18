from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS
import random
import string
import os

app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-change-in-production')

# Allow React dev server in development
CORS(app, origins=["http://localhost:5173", "http://localhost:4173"])
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory stores
polls = {}
votes = {}
voter_history = {}
voter_names = {}

def generate_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=7))

# ─── Serve React app (production) ────────────────────────────────────────────

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    dist = os.path.join(app.static_folder)
    if path and os.path.exists(os.path.join(dist, path)):
        return send_from_directory(dist, path)
    return send_from_directory(dist, 'index.html')

# ─── REST API ────────────────────────────────────────────────────────────────

@app.route('/api/create', methods=['POST'])
def create_poll():
    data = request.json
    name = data.get('name', '').strip()
    questions = data.get('questions', [])
    if not questions:
        return jsonify({'error': 'No questions provided'}), 400
    for q in questions:
        if not q.get('text', '').strip():
            return jsonify({'error': 'Question text required'}), 400
        if len(q.get('options', [])) < 2:
            return jsonify({'error': 'Each question needs at least 2 options'}), 400
    poll_code = generate_code()
    while poll_code in polls:
        poll_code = generate_code()
    polls[poll_code] = {
        'host_name': name,
        'questions': questions,
        'is_open': True,
    }
    votes[poll_code] = {i: {} for i in range(len(questions))}
    return jsonify({'poll_code': poll_code})

@app.route('/api/poll/<code>', methods=['GET'])
def get_poll(code):
    poll = polls.get(code.upper())
    if not poll:
        return jsonify({'error': 'Poll not found'}), 404
    return jsonify({
        'poll_code': code.upper(),
        'host_name': poll['host_name'],
        'questions': poll['questions'],
        'is_open': poll['is_open'],
    })

@app.route('/api/poll/<code>/results', methods=['GET'])
def get_results(code):
    code = code.upper()
    if code not in polls:
        return jsonify({'error': 'Poll not found'}), 404
    poll = polls[code]
    poll_votes = votes.get(code, {})
    results = []
    for i, q in enumerate(poll['questions']):
        q_votes = poll_votes.get(i, {})
        results.append({
            'question': q['text'],
            'options': q['options'],
            'votes': {opt: q_votes.get(opt, 0) for opt in q['options']},
            'total': sum(q_votes.values()),
        })
    return jsonify({'results': results, 'host_name': poll['host_name']})

@app.route('/api/poll/<code>/toggle', methods=['POST'])
def toggle_poll(code):
    code = code.upper()
    if code not in polls:
        return jsonify({'error': 'Poll not found'}), 404
    polls[code]['is_open'] = not polls[code]['is_open']
    is_open = polls[code]['is_open']
    socketio.emit('poll_status', {'is_open': is_open}, room=code)
    return jsonify({'is_open': is_open})

# ─── Socket.IO ───────────────────────────────────────────────────────────────

@socketio.on('join_poll')
def on_join(data):
    room = data.get('poll_code', '').upper()
    join_room(room)

@socketio.on('cast_vote')
def on_vote(data):
    voter_id = data['voter_id']
    voter_name = data.get('voter_name', 'Anonymous')
    poll_code = data['poll_code'].upper()
    q_index = int(data['question_index'])
    option = data['option']
    if poll_code not in polls:
        return
    if not polls[poll_code]['is_open']:
        emit('vote_rejected', {'reason': 'Poll is closed'})
        return
    poll = polls[poll_code]
    if q_index >= len(poll['questions']):
        return
    valid_options = poll['questions'][q_index]['options']
    if option not in valid_options:
        return
    voter_names[voter_id] = voter_name
    vkey = f"{voter_id}:{poll_code}:{q_index}"
    previous = voter_history.get(vkey)
    q_votes = votes[poll_code][q_index]
    if previous and previous in q_votes:
        q_votes[previous] = max(0, q_votes[previous] - 1)
    if previous == option:
        voter_history[vkey] = None
    else:
        q_votes[option] = q_votes.get(option, 0) + 1
        voter_history[vkey] = option
    result = {
        'question_index': q_index,
        'votes': {opt: q_votes.get(opt, 0) for opt in valid_options},
        'total': sum(q_votes.values()),
    }
    emit('vote_update', result, room=poll_code)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)
