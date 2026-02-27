const express = require('express');
const Empresa = require('../models/Empresa');

const router = express.Router();

// GET /api/empresa — Get company profile (singleton)
router.get('/', async (req, res) => {
    try {
        let empresa = await Empresa.findOne();
        if (!empresa) {
            empresa = await Empresa.create({ razon_social: 'BM Iluminación' });
        }
        res.json(empresa);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/empresa — Update company profile
router.put('/', async (req, res) => {
    try {
        let empresa = await Empresa.findOne();
        if (!empresa) {
            empresa = await Empresa.create(req.body);
        } else {
            Object.assign(empresa, req.body);
            await empresa.save();
        }
        res.json(empresa);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
