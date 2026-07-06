# BlockSmithy

**Visually build better LLM prompts — block by block.**

BlockSmithy is an interactive web application where users visually assemble, arrange, and manage text snippets to construct optimized prompts for Large Language Models (LLMs). Drag, drop, save, and export your prompt engineering work with ease.

## Features

- **Drag-and-Drop Workbench** — Rearrange prompt blocks with mouse or touch via SortableJS.
- **Snippet Repository** — Save and reuse boilerplate instructions (e.g., "Act as an expert coder", "Format output as Markdown").
- **Dynamic Fields** — Insert variable placeholders inline within custom blocks.
- **One-Click Copy** — Instantly copy the assembled prompt to your clipboard.
- **Export** — Download your prompt layout as `.txt` or `.md`.
- **User Authentication** — Sign up / log in with email + password (Flask-Login).
- **Cloud Sync** — All snippets and canvases persist to a managed PostgreSQL database.

## Tech Stack

| Layer        | Technology                                     |
| ------------ | ---------------------------------------------- |
| **Backend**  | Python 3.11+, Flask, Gunicorn                  |
| **Frontend** | HTML5, Tailwind CSS (CDN), Vanilla JS          |
| **Drag-Drop**| SortableJS                                     |
| **Database** | Render Managed PostgreSQL (via psycopg2-binary)|
| **ORM**      | Flask-SQLAlchemy                                |
| **Auth**     | Flask-Login + Werkzeug password hashing        |

## Project Structure

```
prompt-builder/
├── app/
│   ├── __init__.py       Flask app factory with PostgreSQL URI rewrite
│   ├── models.py         SQLAlchemy models (User, Snippet, Canvas)
│   ├── routes.py         Login, workbench, and API endpoints
│   ├── templates/
│   │   ├── base.html
│   │   ├── login.html
│   │   └── workbench.html
│   └── static/
│       ├── js/main.js
│       └── css/style.css
├── wsgi.py               Gunicorn entry point
├── requirements.txt
└── render.yaml           Render infrastructure config
```

## Deploy on Render

1. Create a **Web Service** pointing to this repo.
2. Set **Build Command**: `pip install -r requirements.txt`
3. Set **Start Command**: `gunicorn wsgi:app`
4. Add a **PostgreSQL** database (any plan).
5. Set environment variables:
   - `DATABASE_URL` — Render's Internal Database URL
   - `SECRET_KEY` — A random secret for session signing
   - `FLASK_ENV` = `production`
6. Deploy.

> The app automatically rewrites `postgres://` to `postgresql://` at startup to maintain SQLAlchemy compatibility.

## Local Development

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://localhost/blockSmithy
export SECRET_KEY=dev-secret
flask run
```

## License

MIT
