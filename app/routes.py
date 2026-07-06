import json
from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from app import db
from app.models import User, Snippet, Canvas

bp = Blueprint('main', __name__)


@bp.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('main.workbench'))
    return redirect(url_for('main.login'))


@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('main.workbench'))
        flash('Invalid email or password.', 'error')
    return render_template('login.html')


@bp.route('/signup', methods=['POST'])
def signup():
    email = request.form.get('email', '').strip().lower()
    password = request.form.get('password', '')
    if not email or not password:
        flash('Email and password are required.', 'error')
        return redirect(url_for('main.login'))
    if User.query.filter_by(email=email).first():
        flash('An account with that email already exists.', 'error')
        return redirect(url_for('main.login'))
    if len(password) < 6:
        flash('Password must be at least 6 characters.', 'error')
        return redirect(url_for('main.login'))
    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    login_user(user)
    return redirect(url_for('main.workbench'))


@bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.login'))


@bp.route('/workbench')
@login_required
def workbench():
    snippets = Snippet.query.filter_by(user_id=current_user.id).order_by(Snippet.position).all()
    canvases = Canvas.query.filter_by(user_id=current_user.id).order_by(Canvas.updated_at.desc()).all()
    return render_template('workbench.html', snippets=snippets, canvases=canvases)


@bp.route('/api/snippets', methods=['GET'])
@login_required
def get_snippets():
    snippets = Snippet.query.filter_by(user_id=current_user.id).order_by(Snippet.position).all()
    return jsonify([{
        'id': s.id,
        'title': s.title,
        'content': s.content,
        'position': s.position
    } for s in snippets])


@bp.route('/api/snippets', methods=['POST'])
@login_required
def create_snippet():
    data = request.get_json()
    title = data.get('title', 'Untitled')
    content = data.get('content', '')
    snippet = Snippet(user_id=current_user.id, title=title, content=content)
    db.session.add(snippet)
    db.session.commit()
    return jsonify({'id': snippet.id, 'title': snippet.title, 'content': snippet.content}), 201


@bp.route('/api/snippets/<snippet_id>', methods=['PUT'])
@login_required
def update_snippet(snippet_id):
    snippet = Snippet.query.filter_by(id=snippet_id, user_id=current_user.id).first_or_404()
    data = request.get_json()
    if 'title' in data:
        snippet.title = data['title']
    if 'content' in data:
        snippet.content = data['content']
    if 'position' in data:
        snippet.position = data['position']
    db.session.commit()
    return jsonify({'ok': True})


@bp.route('/api/snippets/<snippet_id>', methods=['DELETE'])
@login_required
def delete_snippet(snippet_id):
    snippet = Snippet.query.filter_by(id=snippet_id, user_id=current_user.id).first_or_404()
    db.session.delete(snippet)
    db.session.commit()
    return jsonify({'ok': True})


@bp.route('/api/canvases', methods=['GET'])
@login_required
def get_canvases():
    canvases = Canvas.query.filter_by(user_id=current_user.id).order_by(Canvas.updated_at.desc()).all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'blocks': c.blocks,
        'updated_at': c.updated_at.isoformat()
    } for c in canvases])


@bp.route('/api/canvases', methods=['POST'])
@login_required
def create_canvas():
    data = request.get_json()
    canvas = Canvas(user_id=current_user.id, name=data.get('name', 'Untitled Canvas'), blocks=data.get('blocks', []))
    db.session.add(canvas)
    db.session.commit()
    return jsonify({'id': canvas.id, 'name': canvas.name}), 201


@bp.route('/api/canvases/<canvas_id>', methods=['PUT'])
@login_required
def update_canvas(canvas_id):
    canvas = Canvas.query.filter_by(id=canvas_id, user_id=current_user.id).first_or_404()
    data = request.get_json()
    if 'name' in data:
        canvas.name = data['name']
    if 'blocks' in data:
        canvas.blocks = data['blocks']
    db.session.commit()
    return jsonify({'ok': True})


@bp.route('/api/canvases/<canvas_id>', methods=['DELETE'])
@login_required
def delete_canvas(canvas_id):
    canvas = Canvas.query.filter_by(id=canvas_id, user_id=current_user.id).first_or_404()
    db.session.delete(canvas)
    db.session.commit()
    return jsonify({'ok': True})
