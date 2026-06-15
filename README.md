# Nexus – Dynamic About Page with Team Management (Full‑Stack)

A complete full‑stack web application featuring a company about page, a dynamic team directory with full CRUD operations, search/filter, dark/light mode, and a full database management panel (export/import/reset). Built with Node.js, Express, SQLite, and vanilla front‑end technologies.

<br>

## 📋 Task Requirements – Fully Fulfilled

| Requirement | Status |
|-------------|--------|
| About section with company info (mission, vision, services) | ✅ |
| Team section – at least 6 members with image, name, role, bio, social links | ✅ |
| Admin panel – Add, Edit, Delete team members (full CRUD) | ✅ |
| Search by name | ✅ |
| Filter by role | ✅ |
| Responsive card layout with hover effects | ✅ |
| Modal popup for full profile details | ✅ |
| Dark / Light mode toggle | ✅ |
| Scroll reveal animations | ✅ |
| Lazy loading for images | ✅ |
| Back‑end: Node.js + Express | ✅ |
| Database: SQLite (persistent storage) | ✅ |
| Data fetched from database (no localStorage) | ✅ |
| Bonus: Export database to JSON | ✅ |
| Bonus: Import database from JSON | ✅ |
| Bonus: Reset database to default values | ✅ |

<br>

## 🛠️ Technologies Used

**Back‑end**
- Node.js
- Express.js
- SQLite3
- Multer (file uploads)

<br>

**Front‑end**
- HTML5
- CSS3 (CSS variables, Grid, Flexbox, animations)
- Vanilla JavaScript (no frameworks)
- Font Awesome 6
- Google Fonts (Space Grotesk, Syne)

<br>

## 📁 Project Structure
```bash
nexus-about-fullstack/
├── public/ # Static front‑end files
│ ├── index.html
│ ├── script.js
│ ├── styles.css
├── database.sql # Schema + seed data (SQLite)
├── package.json
├── package-lock.json
├── server.js # Main Express server
└── README.md
```

<br>

## 🧩 Key Features

### Front‑end
- **Company Info** – Editable via admin panel; dynamically rendered from the database.
- **Team Directory** – Cards with member photo, name, role, short bio; hover overlay shows social links.
- **Search & Filter** – Instant filtering by name (client‑side) and role buttons.
- **Modal Profile** – Click any card to see full bio and social links.
- **Dark / Light Mode** – Persistent theme preference using CSS variables + localStorage.
- **Responsive Design** – Works perfectly on desktop, tablet, and mobile.

<br>

### Admin Panel (slide‑out)
- **Company Tab** – Edit company name, tagline, description, mission, vision.
- **Team Tab** – Add new member (with optional image upload), edit existing member, delete member (with double‑click confirmation).
- **Database Tab** – Export all data as JSON, import data from a JSON file, reset to default seeded data.

<br>

### Back‑end API
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/company` | GET | Fetch company info |
| `/api/company` | PUT | Update company info |
| `/api/team` | GET | Fetch all team members |
| `/api/team` | POST | Add new team member (multipart/form‑data) |
| `/api/team/:id` | PUT | Update member (multipart/form‑data) |
| `/api/team/:id` | DELETE | Delete member |
| `/api/export` | GET | Download full database as JSON |
| `/api/import` | POST | Replace database with uploaded JSON |
| `/api/reset` | POST | Reset database to default seed data |

<br>

## 🧪 How to Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/Umaima-Manzoor/Nexus-About-Page.git
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Ensure the public/ folder exists with your front‑end files (or adjust express.static path if needed).**
4. **Start the server**
   ```bash
   node server.js
   ```
5. Open your browser and go to
   ```bash
   http://localhost:3000
   ```

<br>
   
## 👩‍💻 Author
Umaima Manzoor – [My GitHub](https://github.com/Umaima-Manzoor/)

<br>

## 📄 License
MIT
