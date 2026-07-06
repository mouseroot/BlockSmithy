import os
import re
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from werkzeug.middleware.proxy_fix import ProxyFix

db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'


def create_app(testing=False):
    app = Flask(__name__)

    db_url = os.environ.get('DATABASE_URL', 'sqlite:///dev.db')
    if db_url.startswith('postgres://'):
        db_url = re.sub(r'^postgres://', 'postgresql://', db_url)

    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret')
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['WTF_CSRF_ENABLED'] = False

    if not testing:
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1)

    db.init_app(app)
    login_manager.init_app(app)

    from app import routes
    app.register_blueprint(routes.bp)

    with app.app_context():
        db.create_all()
        _run_migrations(app)

    return app


def _run_migrations(app):
    from app import models
    with app.app_context():
        inspector = db.inspect(db.engine)
        cols = [c['name'] for c in inspector.get_columns('users')]
        if 'theme' not in cols:
            db.session.execute(db.text('ALTER TABLE users ADD COLUMN theme VARCHAR(20) DEFAULT \'light\''))
            db.session.commit()
