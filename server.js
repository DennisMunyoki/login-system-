const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database config
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'login_system'
};

let db;

// Initialize database
async function initDB() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL database');
        
        // Create tables
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await db.execute(`
            CREATE TABLE IF NOT EXISTS surveys (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                username VARCHAR(255) NOT NULL,
                q1 VARCHAR(10),
                q2 VARCHAR(10),
                q3 VARCHAR(10),
                q4 VARCHAR(255),
                q5 VARCHAR(255),
                q6 VARCHAR(255),
                q7 INT,
                q8 VARCHAR(255),
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
    } catch (err) {
        console.error('Database error:', err);
        process.exit(1);
    }
}

initDB();

// Routes
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        const [userCheck] = await db.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?', 
            [username, email]
        );
        
        if (userCheck.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username or email already exists' 
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        
        res.json({ success: true });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
        
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
        
        res.json({ 
            success: true,
            redirect: '/dashboard.html',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

app.get('/getUser', async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, username, email FROM users LIMIT 1');
        res.json(users[0] || null);
    } catch (err) {
        console.error('User fetch error:', err);
        res.status(500).json({ success: false, message: 'Error fetching user' });
    }
});

app.post('/submitSurvey', async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, username FROM users LIMIT 1');
        if (users.length === 0) return res.status(401).json({ success: false });
        
        const { q1, q2, q3, q4, q5, q6, q7, q8 } = req.body;
        
        await db.execute(
            `INSERT INTO surveys 
             (user_id, username, q1, q2, q3, q4, q5, q6, q7, q8) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [users[0].id, users[0].username, q1, q2, q3, q4, q5, q6, q7, q8]
        );
        
        res.json({ success: true });
    } catch (err) {
        console.error('Survey error:', err);
        res.status(500).json({ success: false, message: 'Survey submission failed' });
    }
});

app.post('/logout', (req, res) => {
    res.json({ success: true });
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});