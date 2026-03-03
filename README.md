# BackendCMS (Admin Dashboard)

Admin dashboard for managing CEIT content.

## Important: Use Collaboration Branch (not main)

This project should be run from the collaboration branch because integration updates are not yet merged into `main`.

# 1) Fork the repository first on GitHub
```
Example fork: https://github.com/<your-username>/BackendCMS
```
# 2) Clone your fork
```bash
git clone https://github.com/<your-username>/BackendCMS.git
cd BackendCMS
```

# 3) Add original repo as upstream
```bash
git remote add upstream https://github.com/SecretAccountJM/BackendCMS.git
```

# 4) Fetch branches and switch to collaboration branch
```bash
git fetch upstream collaboration
git checkout -b collaboration --track upstream/collaboration
```

# 5) Keep your branch updated
```bash
git pull --rebase upstream collaboration
```

## Start This Project Only

```bash
cd /path/to/BackendCMS
npm install
npm run dev
```

or using yarn

```bash
cd /path/to/BackendCMS
yarn install
yarn dev
```

Open: `http://localhost:3001`

---

## Backend API (required)

```bash
cd ceit-cms-backend
(OPTIONAL IF USING VENV) python3 -m venv .venv
(OPTIONAL IF USING VENV) source .venv/bin/activate
alembic upgrade head
python scripts/seed.py
python -m app.main
```

## URLs

- Admin Dashboard: `http://localhost:3001`
- API: `http://127.0.0.1:8000`


## Auth Accounts

- `admin@ceit.edu` / `Admin123!`
- `ce.author@ceit.edu` / `Admin123!`
- `ee.author@ceit.edu` / `Admin123!`
- `it.author@ceit.edu` / `Admin123!`