-- ==========================================
-- Nexus Database Schema & Seed Data
-- Database: SQLite
-- ==========================================

-- Create Company Table
CREATE TABLE IF NOT EXISTS company (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    tagline TEXT DEFAULT '',
    description TEXT NOT NULL,
    mission TEXT NOT NULL,
    vision TEXT NOT NULL
);

-- Create Team Table
CREATE TABLE IF NOT EXISTS team (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image TEXT DEFAULT '',
    bio TEXT NOT NULL,
    linkedin TEXT DEFAULT '',
    github TEXT DEFAULT ''
);

-- Seed Company Data
INSERT OR IGNORE INTO company (id, name, tagline, description, mission, vision) 
VALUES (
    1, 
    'Nexus', 
    'We Build What Matters Most', 
    'A collective of designers, engineers, and strategists committed to crafting digital products that drive real impact. Since 2019, we''ve partnered with startups and enterprises to turn bold ideas into scalable solutions.', 
    'To democratize access to world-class digital products by combining strategic thinking with cutting-edge technology. We believe every business — regardless of size — deserves design and engineering that competes at the highest level.', 
    'To become the go-to partner for companies building the next generation of intelligent, human-centered digital experiences. We envision a future where technology amplifies human potential, not replaces it.'
);

-- Seed Team Data
INSERT OR IGNORE INTO team (id, name, role, image, bio, linkedin, github) VALUES 
('tm_001', 'Alexandra Chen', 'Manager', 'https://picsum.photos/seed/alex-chen/400/500.jpg', 'Former Google PM with 12 years of experience leading cross-functional teams. Alexandra drives our strategic direction and ensures every project delivers measurable business impact.', 'https://linkedin.com/in/alexandrachen', ''),
('tm_002', 'Marcus Johnson', 'Developer', 'https://picsum.photos/seed/marcus-j/400/500.jpg', 'Full-stack engineer specializing in React, Node.js, and cloud architecture. Marcus has shipped products used by millions and leads our technical decision-making.', 'https://linkedin.com/in/marcusjohnson', 'https://github.com/marcusjohnson'),
('tm_003', 'Priya Sharma', 'Designer', 'https://picsum.photos/seed/priya-s/400/500.jpg', 'Award-winning UI/UX designer with a background in cognitive psychology. Priya creates interfaces that are both beautiful and backed by user research.', 'https://linkedin.com/in/priyasharma', ''),
('tm_004', 'Daniel Kim', 'Developer', 'https://picsum.photos/seed/daniel-k/400/500.jpg', 'Backend specialist focused on distributed systems and API design. Daniel ensures our applications are scalable, secure, and performant under load.', 'https://linkedin.com/in/danielkim', 'https://github.com/danielkim'),
('tm_005', 'Sofia Rodriguez', 'Data Scientist', 'https://picsum.photos/seed/sofia-r/400/500.jpg', 'PhD in Machine Learning from MIT. Sofia builds the AI models that power our intelligent features, from recommendation engines to natural language processing.', 'https://linkedin.com/in/sofiarodriguez', 'https://github.com/sofiarodriguez'),
('tm_006', 'James Wright', 'DevOps', 'https://picsum.photos/seed/james-w/400/500.jpg', 'Infrastructure architect with deep expertise in AWS, Kubernetes, and CI/CD pipelines. James keeps our systems running at 99.99% uptime.', 'https://linkedin.com/in/jameswright', 'https://github.com/jameswright');