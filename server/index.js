const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { db, initDb } = require('./db');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false // disabled because lucide CDN is used
}));
app.use(cors({ origin: true, credentials: true }));

// Global Rate Limiter for API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api', apiLimiter);

// Specific Brute-Force limit for Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' }
});

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const APP_PASSWORD = process.env.APP_PASSWORD || 'admin';

// --- AUTH ENDPOINTS ---
app.post('/api/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  if (password === APP_PASSWORD) {
    const token = jwt.sign({ user: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.json({ message: 'Logged in successfully' });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Protect all other API routes
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
app.use('/api', authMiddleware);

// --- API ENDPOINTS ---

// Parties
app.get('/api/parties', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM parties ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/parties', async (req, res) => {
  const { name } = req.body;
  try {
    await db.execute({
      sql: 'INSERT INTO parties (name) VALUES (?)',
      args: [name]
    });
    res.status(201).json({ message: 'Party added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/parties/:id', async (req, res) => {
  const id = Number(req.params.id);
  console.log(`[DELETE] Request for Party ID: ${id} (Type: ${typeof id})`);
  try {
    // Phase 1: Wipe associated history
    await db.execute({
      sql: 'DELETE FROM tasks WHERE party_id = ?',
      args: [id]
    });
    console.log(`[DELETE] Cleaned up associated task history for party: ${id}`);

    // Phase 2: Wipe the party record
    const partyDel = await db.execute({
      sql: 'DELETE FROM parties WHERE id = ?',
      args: [id]
    });
    
    if (partyDel.rowsAffected > 0) {
      res.json({ message: 'Success: Party and history wiped' });
    } else {
      res.status(404).json({ error: 'Party record not found' });
    }
  } catch (err) {
    console.error('[DELETE ERROR]:', err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// Articles
app.get('/api/articles', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM articles ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/articles', async (req, res) => {
  const { name } = req.body;
  try {
    await db.execute({
      sql: 'INSERT INTO articles (name) VALUES (?)',
      args: [name]
    });
    res.status(201).json({ message: 'Article added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/articles/:id', async (req, res) => {
  const id = Number(req.params.id);
  console.log(`[DELETE] Request for Article ID: ${id} (Type: ${typeof id})`);
  try {
    // Phase 1: Wipe associated work
    await db.execute({
      sql: 'DELETE FROM tasks WHERE article_id = ?',
      args: [id]
    });
    console.log(`[DELETE] Cleaned up associated task assignments for article: ${id}`);

    // Phase 2: Wipe the article record
    const articleDel = await db.execute({
      sql: 'DELETE FROM articles WHERE id = ?',
      args: [id]
    });
    
    if (articleDel.rowsAffected > 0) {
      res.json({ message: 'Success: Article and records wiped' });
    } else {
      res.status(404).json({ error: 'Article record not found' });
    }
  } catch (err) {
    console.error('[DELETE ERROR]:', err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const { party_id, article_id, status } = req.query;
    let query = `
      SELECT t.*, t.sub_work as task_name, t.date as created_at, t.remarks as description, p.name as client_name, a.name as assigned_to 
      FROM tasks t
      JOIN parties p ON t.party_id = p.id
      JOIN articles a ON t.article_id = a.id
      WHERE 1=1
    `;
    const args = [];
    if (party_id) { query += ' AND t.party_id = ?'; args.push(party_id); }
    if (article_id) { query += ' AND t.article_id = ?'; args.push(article_id); }
    if (status) { query += ' AND t.status = ?'; args.push(status); }
    
    query += ' ORDER BY t.id DESC';
    
    const result = await db.execute({ sql: query, args });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { client_name, task_name, assigned_to, status, description } = req.body;
  const created_at = new Date().toISOString().split('T')[0];
  
  try {
    // 1. Resolve or Create Party
    let partyResult = await db.execute({
      sql: 'SELECT id FROM parties WHERE name = ?',
      args: [client_name]
    });
    let party_id;
    if (partyResult.rows.length === 0) {
      const insert = await db.execute({
        sql: 'INSERT INTO parties (name) VALUES (?) RETURNING id',
        args: [client_name]
      });
      party_id = insert.rows[0].id;
    } else {
      party_id = partyResult.rows[0].id;
    }

    // 2. Resolve or Create Article
    let articleResult = await db.execute({
      sql: 'SELECT id FROM articles WHERE name = ?',
      args: [assigned_to]
    });
    let article_id;
    if (articleResult.rows.length === 0) {
      const insert = await db.execute({
        sql: 'INSERT INTO articles (name) VALUES (?) RETURNING id',
        args: [assigned_to]
      });
      article_id = insert.rows[0].id;
    } else {
      article_id = articleResult.rows[0].id;
    }

    // 3. Insert Task
    await db.execute({
      sql: 'INSERT INTO tasks (party_id, article_id, sub_work, status, remarks, date) VALUES (?, ?, ?, ?, ?, ?)',
      args: [party_id, article_id, task_name, status, description, created_at]
    });

    res.status(201).json({ message: 'Task created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  const { status, remarks } = req.body;
  try {
    let query = 'UPDATE tasks SET status = COALESCE(?, status), remarks = COALESCE(?, remarks)';
    let args = [status || null, remarks || null];
    
    if (status === 'Completed') {
      query += ', completion_date = ?';
      args.push(new Date().toISOString().split('T')[0]);
    }
    
    query += ' WHERE id = ?';
    args.push(req.params.id);

    await db.execute({ sql: query, args });
    res.json({ message: 'Task updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await db.execute({
      sql: 'DELETE FROM tasks WHERE id = ?',
      args: [req.params.id]
    });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

initDb().catch(console.error);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
