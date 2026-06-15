const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Multer Setup for real image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create a clean filename
        cb(null, 'img_' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 500000 }, // 500KB limit
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Database Initialization
const db = new sqlite3.Database('./nexus.db', (err) => {
    if (err) console.error(err.message);
    console.log('Connected to the Nexus SQLite database.');
});

// Enable foreign keys and initialize tables/seeds
db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON;");

    db.run(`CREATE TABLE IF NOT EXISTS company (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        tagline TEXT DEFAULT '',
        description TEXT NOT NULL,
        mission TEXT NOT NULL,
        vision TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS team (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        image TEXT DEFAULT '',
        bio TEXT NOT NULL,
        linkedin TEXT DEFAULT '',
        github TEXT DEFAULT ''
    )`);

    // Auto-seed Company if empty
    db.get(`SELECT COUNT(*) AS count FROM company`, (err, row) => {
        if (row.count === 0) {
            db.run(`INSERT INTO company (name, tagline, description, mission, vision) VALUES (?, ?, ?, ?, ?)`, 
            ['Nexus', 'We Build What Matters Most', 'A collective of designers, engineers, and strategists committed to crafting digital products that drive real impact. Since 2019, we\'ve partnered with startups and enterprises to turn bold ideas into scalable solutions.', 
            'To democratize access to world-class digital products by combining strategic thinking with cutting-edge technology. We believe every business — regardless of size — deserves design and engineering that competes at the highest level.', 
            'To become the go-to partner for companies building the next generation of intelligent, human-centered digital experiences. We envision a future where technology amplifies human potential, not replaces it.']);
        }
    });

    // Auto-seed Team if empty
    db.get(`SELECT COUNT(*) AS count FROM team`, (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare(`INSERT INTO team (id, name, role, image, bio, linkedin, github) VALUES (?, ?, ?, ?, ?, ?, ?)`);
            stmt.run('tm_001', 'Alexandra Chen', 'Manager', 'https://picsum.photos/seed/alex-chen/400/500.jpg', 'Former Google PM with 12 years of experience leading cross-functional teams. Alexandra drives our strategic direction and ensures every project delivers measurable business impact.', 'https://linkedin.com/in/alexandrachen', '');
            stmt.run('tm_002', 'Marcus Johnson', 'Developer', 'https://picsum.photos/seed/marcus-j/400/500.jpg', 'Full-stack engineer specializing in React, Node.js, and cloud architecture. Marcus has shipped products used by millions and leads our technical decision-making.', 'https://linkedin.com/in/marcusjohnson', 'https://github.com/marcusjohnson');
            stmt.run('tm_003', 'Priya Sharma', 'Designer', 'https://picsum.photos/seed/priya-s/400/500.jpg', 'Award-winning UI/UX designer with a background in cognitive psychology. Priya creates interfaces that are both beautiful and backed by user research.', 'https://linkedin.com/in/priyasharma', '');
            stmt.run('tm_004', 'Daniel Kim', 'Developer', 'https://picsum.photos/seed/daniel-k/400/500.jpg', 'Backend specialist focused on distributed systems and API design. Daniel ensures our applications are scalable, secure, and performant under load.', 'https://linkedin.com/in/danielkim', 'https://github.com/danielkim');
            stmt.run('tm_005', 'Sofia Rodriguez', 'Data Scientist', 'https://picsum.photos/seed/sofia-r/400/500.jpg', 'PhD in Machine Learning from MIT. Sofia builds the AI models that power our intelligent features, from recommendation engines to natural language processing.', 'https://linkedin.com/in/sofiarodriguez', 'https://github.com/sofiarodriguez');
            stmt.run('tm_006', 'James Wright', 'DevOps', 'https://picsum.photos/seed/james-w/400/500.jpg', 'Infrastructure architect with deep expertise in AWS, Kubernetes, and CI/CD pipelines. James keeps our systems running at 99.99% uptime.', 'https://linkedin.com/in/jameswright', 'https://github.com/jameswright');
            stmt.finalize();
        }
    });
});

// ==========================================
// API ROUTES
// ==========================================

// GET Company Info
app.get('/api/company', (req, res) => {
    db.get(`SELECT * FROM company LIMIT 1`, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// UPDATE Company Info
app.put('/api/company', (req, res) => {
    const { name, tagline, description, mission, vision } = req.body;
    db.run(`UPDATE company SET name = ?, tagline = ?, description = ?, mission = ?, vision = ? WHERE id = 1`,
        [name, tagline, description, mission, vision], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // If no row was updated, insert a new row with id=1
        if (this.changes === 0) {
            db.run(`INSERT INTO company (id, name, tagline, description, mission, vision) 
                     VALUES (1, ?, ?, ?, ?, ?)`,
                [name, tagline, description, mission, vision], (err2) => {
                if (err2) return res.status(500).json({ error: err2.message });
                res.json({ message: 'Company information created successfully' });
            });
        } else {
            res.json({ message: 'Company information updated successfully' });
        }
    });
});

// GET All Team Members
app.get('/api/team', (req, res) => {
    db.all(`SELECT * FROM team ORDER BY id ASC`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ADD New Team Member (with image upload)
app.post('/api/team', upload.single('image'), (req, res) => {
    const id = 'tm_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || '');
    
    db.run(`INSERT INTO team (id, name, role, image, bio, linkedin, github) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, req.body.name, req.body.role, image, req.body.bio, req.body.linkedin || '', req.body.github || ''], 
    function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id, message: 'Team member added successfully' });
    });
});

// UPDATE Team Member (with image upload)
app.put('/api/team/:id', upload.single('image'), (req, res) => {
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
    
    db.run(`UPDATE team SET name = ?, role = ?, image = ?, bio = ?, linkedin = ?, github = ? WHERE id = ?`,
        [req.body.name, req.body.role, image, req.body.bio, req.body.linkedin || '', req.body.github || '', req.params.id], 
    function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Member not found' });
        res.json({ message: 'Team member updated successfully' });
    });
});

// DELETE Team Member
app.delete('/api/team/:id', (req, res) => {
    db.run(`DELETE FROM team WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Member not found' });
        res.json({ message: 'Team member deleted successfully' });
    });
});

// ==========================================
// EXPORT DATABASE AS JSON
// ==========================================
app.get('/api/export', (req, res) => {
  db.get(`SELECT * FROM company LIMIT 1`, (err, company) => {
    if (err) return res.status(500).json({ error: err.message });
    db.all(`SELECT * FROM team ORDER BY id ASC`, (err, team) => {
      if (err) return res.status(500).json({ error: err.message });
      const data = JSON.stringify({ company, team }, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=nexus-database-export.json');
      res.send(data);
    });
  });
});

// ==========================================
// IMPORT DATABASE FROM JSON
// ==========================================
app.post('/api/import', (req, res) => {
  const { company, team } = req.body;
  if (!team || !Array.isArray(team)) {
    return res.status(400).json({ error: "Invalid format. Expected { company: {...}, team: [...] }" });
  }

  db.serialize(() => {
    db.run(`DELETE FROM team`);
    db.run(`DELETE FROM company`);
    
    if (company) {
      db.run(`INSERT INTO company (id, name, tagline, description, mission, vision) VALUES (1, ?, ?, ?, ?, ?)`,
        [company.name, company.tagline || '', company.description, company.mission, company.vision]);
    } else {
      // If no company data in JSON, restore default
      db.run(`INSERT INTO company (id, name, tagline, description, mission, vision) VALUES (1, 'Nexus', 'We Build What Matters Most', 'Default Description', 'Default Mission', 'Default Vision')`);
    }

    const stmt = db.prepare(`INSERT OR REPLACE INTO team (id, name, role, image, bio, linkedin, github) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    team.forEach(m => {
      stmt.run(m.id, m.name, m.role, m.image || '', m.bio, m.linkedin || '', m.github || '');
    });
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: `Database imported successfully (${team.length} members loaded)` });
    });
  });
});

// ==========================================
// RESET DATABASE TO DEFAULTS
// ==========================================
app.post('/api/reset', (req, res) => {
  db.serialize(() => {
    db.run(`DELETE FROM team`);
    db.run(`DELETE FROM company`);
    
    db.run(`INSERT INTO company (id, name, tagline, description, mission, vision) VALUES (1, 'Nexus', 'We Build What Matters Most', 'A collective of designers, engineers, and strategists committed to crafting digital products that drive real impact. Since 2019, we''ve partnered with startups and enterprises to turn bold ideas into scalable solutions.', 'To democratize access to world-class digital products by combining strategic thinking with cutting-edge technology. We believe every business — regardless of size — deserves design and engineering that competes at the highest level.', 'To become the go-to partner for companies building the next generation of intelligent, human-centered digital experiences. We envision a future where technology amplifies human potential, not replaces it.')`);
    
    const stmt = db.prepare(`INSERT INTO team (id, name, role, image, bio, linkedin, github) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    stmt.run('tm_001', 'Alexandra Chen', 'Manager', 'https://picsum.photos/seed/alex-chen/400/500.jpg', 'Former Google PM with 12 years of experience leading cross-functional teams. Alexandra drives our strategic direction and ensures every project delivers measurable business impact.', 'https://linkedin.com/in/alexandrachen', '');
    stmt.run('tm_002', 'Marcus Johnson', 'Developer', 'https://picsum.photos/seed/marcus-j/400/500.jpg', 'Full-stack engineer specializing in React, Node.js, and cloud architecture. Marcus has shipped products used by millions and leads our technical decision-making.', 'https://linkedin.com/in/marcusjohnson', 'https://github.com/marcusjohnson');
    stmt.run('tm_003', 'Priya Sharma', 'Designer', 'https://picsum.photos/seed/priya-s/400/500.jpg', 'Award-winning UI/UX designer with a background in cognitive psychology. Priya creates interfaces that are both beautiful and backed by user research.', 'https://linkedin.com/in/priyasharma', '');
    stmt.run('tm_004', 'Daniel Kim', 'Developer', 'https://picsum.photos/seed/daniel-k/400/500.jpg', 'Backend specialist focused on distributed systems and API design. Daniel ensures our applications are scalable, secure, and performant under load.', 'https://linkedin.com/in/danielkim', 'https://github.com/danielkim');
    stmt.run('tm_005', 'Sofia Rodriguez', 'Data Scientist', 'https://picsum.photos/seed/sofia-r/400/500.jpg', 'PhD in Machine Learning from MIT. Sofia builds the AI models that power our intelligent features, from recommendation engines to natural language processing.', 'https://linkedin.com/in/sofiarodriguez', 'https://github.com/sofiarodriguez');
    stmt.run('tm_006', 'James Wright', 'DevOps', 'https://picsum.photos/seed/james-w/400/500.jpg', 'Infrastructure architect with deep expertise in AWS, Kubernetes, and CI/CD pipelines. James keeps our systems running at 99.99% uptime.', 'https://linkedin.com/in/jameswright', 'https://github.com/jameswright');
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Database reset to default values" });
    });
  });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});