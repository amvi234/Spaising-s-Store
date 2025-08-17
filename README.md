# Spaising's store

A full stack web solution to
- Register and Login users with access control
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

- In order to register user, make sure to set:
```bash
     ADMIN_REGISTRATION_KEY
```

- Move to below url to access admin panel
```bash
127.0.0.1:8000/admin
```

## Screenshots




<img width="1920" height="1080" alt="Screenshot from 2025-08-17 08-42-49" src="https://github.com/user-attachments/assets/bcb095ee-dc8a-42b7-8519-496df77c9644" />

<img width="1920" height="1080" alt="Screenshot from 2025-08-17 08-42-55" src="https://github.com/user-attachments/assets/e21dc2ed-c9e2-46ad-9864-d73e67e5a2d8" />

<img width="1920" height="1080" alt="Screenshot from 2025-08-17 08-41-21" src="https://github.com/user-attachments/assets/bc2ab69e-6c2d-4a84-b27c-8caf3c84daa8" />

<img width="1920" height="1080" alt="Screenshot from 2025-08-17 08-48-17" src="https://github.com/user-attachments/assets/17804e6f-09e3-4f48-808f-612ea912710a" />


<img width="1920" height="1080" alt="Screenshot from 2025-08-17 08-48-12" src="https://github.com/user-attachments/assets/8044e2ea-9bba-4ead-8416-c2d84a9b5007" />




<img width="1920" height="1080" alt="Screenshot from 2025-08-17 08-48-25" src="https://github.com/user-attachments/assets/e90f37d4-ba60-4fb4-8c4e-09d9960f6f7d" />

<img width="1920" height="1080" alt="Screenshot from 2025-08-17 08-41-16" src="https://github.com/user-attachments/assets/e91101ce-0150-45a6-95e2-64918a1c71a6" />

<img width="1920" height="1080" alt="Screenshot from 2025-08-17 08-41-47" src="https://github.com/user-attachments/assets/d62857d9-2627-4c80-badd-b7687cd3c7f6" />
