# Product Design Document (PRD)

## 1. Executive Summary
An interactive web application where users visually assemble, arrange, and manage text snippets to construct optimized prompts for Large Language Models (LLMs). The backend is powered by Python (Flask/Gunicorn) and specifically optimized for Render's managed network and PostgreSQL instances. The frontend provides a drag-and-drop or tap-to-rearrange interface where users build prompts, save their work via authenticated profiles, and export/copy the finalized text.

---

## 2. Target Audience
* **AI Power Users:** Professionals running repetitive prompt structures daily.
* **Content Creators & Developers:** Users needing rapid, structured engineering frameworks.
* **Teams & Collaborators:** Users who save and iterate on reliable prompt templates.

---

## 3. Tech Stack Architecture (Render & Postgres Optimized)
* **Backend Framework:** Flask (Python 3.11+)
* **WSGI HTTP Server:** Gunicorn (for production scaling on Render)
* **Frontend:** HTML5, CSS3 (Tailwind CSS via CDN), and Vanilla JavaScript or Alpine.js (ensuring a lightweight structure without node build pipelines).
* **Drag-and-Drop Engine:** SortableJS (highly customizable, touch-friendly for mobile taps and desktop mouse drag/drop).
* **Database / State:** Managed Render PostgreSQL (PostgreSQL 18 default).
* **ORM:** Flask-SQLAlchemy for database abstraction.
* **Database Driver:** `psycopg2-binary` required by Flask to connect to the PostgreSQL instance.
* **Authentication:** Flask-Login with Werkzeug password hashing.

---

## 4. Core Features & User Stories

### User Authentication & Data Persistence
* **Sign Up/Login:** Secure user account creation using email and password.
* **Session Management:** Flask-Login handles user sessions securely with session cookies.
* **Cloud Storage:** Authenticated users automatically sync saved text snippets and structured prompt canvases to the Render Postgres database.

### The Workbench (Canvas Interface)
* **Drag-and-Drop / Tap-to-Move:** Users use mouse or touch gestures to easily re-order blocks of text vertically or horizontally.
* **Snippet Repository:** Sidebar listing pre-saved boilerplate instructions (e.g., "Act as an expert coder", "Format the output as Markdown").
* **Dynamic Fields:** Custom blocks allowing users to input variable text placeholder fields inline.

### Output & Export Functions
* **One-Click Copy:** Instant clipboard copy of the combined string.
* **Document Export:** Download compiled layout directly as a text file (`.txt`) or Markdown document (`.md`).

---

## 5. Render & PostgreSQL Infrastructure Specifications

### Database Connection Strategy
1. **Network Routing:** The Flask Web Service connects to the database utilizing Render's **Internal Database URL** (port 5432). This ensures database traffic stays within Render's private network, preventing network latency and eliminating data egress costs.
2. **SQLAlchemy Scheme Compatibility:** Render provides the connection string starting with `postgres://`. Because SQLAlchemy 1.4+ deprecated this protocol, the Flask application configuration must programmatically rewrite the incoming environment string to `postgresql://` before initializing the database engine to prevent runtime driver crashes.
3. **Database Maintenance:** Leveraging Render's fully managed environment, the database utilizes automated storage autoscaling (expanding whenever disk usage hits 90%) and automated daily backups.

---

## 6. Project Directory Structure

```text
prompt-builder/
│
├── app/
│   ├── __init__.py      <-- Contains the postgres:// -> postgresql:// URI rewrite fix
│   ├── models.py        <-- SQLAlchemy DB models mapped to Render Postgres
│   ├── routes.py
│   ├── templates/
│   │   ├── base.html
│   │   ├── login.html
│   │   └── workbench.html
│   └── static/
│       ├── js/
│       │   └── main.js
│       └── css/
│           └── style.css
│
├── wsgi.py
├── requirements.txt     <-- Includes psycopg2-binary for Postgres compilation
└── render.yaml
```

---

## 7. Build and Launch Requirements
* **`requirements.txt` essential dependencies:**
  * `Flask`
  * `gunicorn`
  * `Flask-SQLAlchemy`
  * `Flask-Login`
  * `psycopg2-binary`
* **Gunicorn Entry Point:** `wsgi:app`
* **Render Environment Variables:**
  * `DATABASE_URL`: Set directly to Render's **Internal Database URL** string.
  * `SECRET_KEY`: For Flask session signing.
  * `FLASK_ENV`: Set to `production`.
