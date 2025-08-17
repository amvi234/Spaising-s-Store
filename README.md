# Spaising's store

A full stack web solution to
- CRUD operations for the product items is supported. 
- Includes a SMTP SendGrid email verification after the order is placed.
- order table management
- role-based access control

## 🛠️ Tech Stack

This project uses the following technologies:

### Frontend

- React.js
- Typescript
- Tailwind CSS

### Backend

- Django
- SQLite

### Development Tools

- Python 12
- Node.js 20+

## Setup to run this project:-

### Environment Configuration

- The default environment variables are defined in `.env.template`. For enhanced security:
  1. Copy `.env.template` to `.env`:
     ```bash
     cp .env.template .env
     ```
  2. Update sensitive information like API keys, secrets, and database credentials in `.env`.


## Frontend

- Move to frontend directory:-
```bash
cd frontend
 ```

- Install all packages from node with:-
```bash
npm install
 ```

- Run the server with:-
```bash
npm run dev
```

## Backend
- Move to backend directory:-
```bash
cd backend
 ```
- Create a virtual environment with:-
```bash
python -m venv virtual_env
```

- Activate using:-
```bash
source virtual_env\bin\activate
```

- Install dependencies
```bash
pip install -r requirements.txt
```

- Run sever
```bash
python manage.py runserver
```


