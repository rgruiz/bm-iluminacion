const express = require('express');
const Cliente = require('../models/Cliente');

const router = express.Router();

// GET /api/clientes — List with search, filter, pagination
router.get('/', async (req, res) => {
    try {
        const { search, activo, page = 1, limit = 20 } = req.query;
        const query = {};

        if (activo !== undefined && activo !== '') {
            query.activo = activo === 'true';
        }

        if (search) {
            query.$or = [
                { razon_social: { $regex: search, $options: 'i' } },
                { cuit: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { contacto: { $regex: search, $options: 'i' } },
                { localidad: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Cliente.countDocuments(query);
        const clientes = await Cliente.find(query)
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        res.json({
            data: clientes,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/clientes/all — All active clients (for dropdowns)
router.get('/all', async (req, res) => {
    try {
        const clientes = await Cliente.find({ activo: true })
            .select('razon_social cuit')
            .sort({ razon_social: 1 });
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/clientes/:id
router.get('/:id', async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id);
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/clientes
router.post('/', async (req, res) => {
    try {
        const cliente = new Cliente(req.body);
        await cliente.save();
        res.status(201).json(cliente);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/clientes/:id
router.put('/:id', async (req, res) => {
    try {
        const cliente = await Cliente.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(cliente);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/clientes/:id — Soft delete
router.delete('/:id', async (req, res) => {
    try {
        const cliente = await Cliente.findByIdAndUpdate(
            req.params.id,
            { activo: false },
            { new: true }
        );
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json({ message: 'Cliente desactivado', cliente });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH /api/clientes/:id/reactivar
router.patch('/:id/reactivar', async (req, res) => {
    try {
        const cliente = await Cliente.findByIdAndUpdate(
            req.params.id,
            { activo: true },
            { new: true }
        );
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json({ message: 'Cliente reactivado', cliente });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
