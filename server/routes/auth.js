const express = require('express');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Usuario.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// GET /api/auth/verify
router.get('/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ valid: false });
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        res.json({ valid: true });
    } catch {
        res.status(401).json({ valid: false });
    }
});

module.exports = router;
