
const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const app = express();

app.use(cors());
app.use(express.json());

// Test backend
app.get('/', (req, res) => {
    res.send('Online Student Feedback System Backend is Running!');
});

// Get all courses
app.get('/courses', (req, res) => {
    db.query('SELECT * FROM courses', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to fetch courses' });
        }
        res.json(results);
    });
});

// Submit feedback
app.post('/feedback', (req, res) => {
    const { student_id, course_id, rating, comments } = req.body;

    if (!student_id || !course_id || !rating || rating < 1 || rating > 5 || !comments?.trim()) {
        return res.status(400).json({ message: 'Please enter valid feedback details.' });
    }

    const sql = `INSERT INTO feedback
        (student_id, course_id, rating, comments)
        VALUES (?, ?, ?, ?)`;

    db.query(sql, [student_id, course_id, rating, comments], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Failed to save feedback.' });
        }

        res.status(201).json({ message: 'Feedback submitted successfully!' });
    });
});

app.get('/admin/feedback', (req, res) => {
    const sql = `
        SELECT
            f.feedback_id,
            s.name AS student_name,
            c.course_name,
            c.faculty_name,
            f.rating,
            f.comments,
            f.submitted_at
        FROM feedback f
        JOIN students s ON f.student_id = s.student_id
        JOIN courses c ON f.course_id = c.course_id
        ORDER BY f.submitted_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({
                message: 'Failed to fetch feedback'
            });
        }

        res.json(results);
    });
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 6) {
        return res.status(400).json({
            message: 'Enter your name, email and a password of at least 6 characters.'
        });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);

        db.query(
            'INSERT INTO students (name, email, password, password_hash) VALUES (?, ?, ?, ?)',
            [name, email, 'USE_HASH', passwordHash],
            (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({
                            message: 'Email is already registered.'
                        });
                    }

                    console.error(err.message);
                    return res.status(500).json({
                        message: 'Registration failed.'
                    });
                }

                res.status(201).json({
                    message: 'Registration successful!',
                    student_id: result.insertId
                });
            }
        );
    } catch {
        res.status(500).json({ message: 'Registration failed.' });
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: 'Enter email and password.'
        });
    }

    db.query(
        'SELECT student_id, name, email, password_hash FROM students WHERE email = ?',
        [email],
        async (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: 'Login failed.'
                });
            }

            if (results.length === 0 || !results[0].password_hash) {
                return res.status(401).json({
                    message: 'Invalid email or password.'
                });
            }

            const valid = await bcrypt.compare(
                password,
                results[0].password_hash
            );

            if (!valid) {
                return res.status(401).json({
                    message: 'Invalid email or password.'
                });
            }

            res.json({
                message: 'Login successful!',
                student: {
                    student_id: results[0].student_id,
                    name: results[0].name,
                    email: results[0].email
                }
            });
        }
    );
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
