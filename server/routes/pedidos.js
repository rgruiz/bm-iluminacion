const express = require('express');
const Pedido = require('../models/Pedido');

const router = express.Router();

// GET /api/pedidos — List with search, filter, pagination
router.get('/', async (req, res) => {
    try {
        const { search, estado, activo, fecha_desde, fecha_hasta, page = 1, limit = 20 } = req.query;
        const query = {};

        if (activo !== undefined && activo !== '') {
            query.activo = activo === 'true';
        }

        if (estado && estado !== 'todos') {
            query.estado = estado;
        }

        if (search) {
            query.$or = [
                { folio: { $regex: search, $options: 'i' } },
                { notas: { $regex: search, $options: 'i' } }
            ];
        }

        if (fecha_desde || fecha_hasta) {
            query.fecha_pedido = {};
            if (fecha_desde) query.fecha_pedido.$gte = new Date(fecha_desde);
            if (fecha_hasta) query.fecha_pedido.$lte = new Date(fecha_hasta + 'T23:59:59');
        }

        const total = await Pedido.countDocuments(query);
        const pedidos = await Pedido.find(query)
            .populate('cliente_id', 'razon_social cuit')
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        res.json({
            data: pedidos,
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

// GET /api/pedidos/stats — Dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const [totalClientes, pedidosActivos, pedidosMes, montosMes, porEstado, recientes] = await Promise.all([
            require('../models/Cliente').countDocuments({ activo: true }),
            Pedido.countDocuments({ activo: true, estado: { $nin: ['entregado', 'cobrado', 'cancelado'] } }),
            Pedido.countDocuments({
                activo: true,
                fecha_pedido: { $gte: startOfMonth, $lte: endOfMonth }
            }),
            Pedido.aggregate([
                {
                    $match: {
                        activo: true,
                        estado: 'cobrado',
                        fecha_pedido: { $gte: startOfMonth, $lte: endOfMonth }
                    }
                },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            Pedido.aggregate([
                { $match: { activo: true } },
                { $group: { _id: '$estado', count: { $sum: 1 } } }
            ]),
            Pedido.find({ activo: true })
                .populate('cliente_id', 'razon_social')
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        res.json({
            totalClientes,
            pedidosActivos,
            pedidosMes,
            montoMes: montosMes[0]?.total || 0,
            porEstado: porEstado.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
            recientes
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/pedidos/:id
router.get('/:id', async (req, res) => {
    try {
        const pedido = await Pedido.findById(req.params.id)
            .populate('cliente_id', 'razon_social cuit');
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json(pedido);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/pedidos
router.post('/', async (req, res) => {
    try {
        const data = { ...req.body };
        // Calculate item subtotals
        if (data.items) {
            data.items = data.items.map(item => ({
                ...item,
                subtotal: Math.round(item.cantidad * item.precio_unitario * 100) / 100
            }));
        }
        const pedido = new Pedido(data);
        await pedido.save();
        await pedido.populate('cliente_id', 'razon_social cuit');
        res.status(201).json(pedido);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/pedidos/:id
router.put('/:id', async (req, res) => {
    try {
        const data = { ...req.body };
        // Calculate item subtotals
        if (data.items) {
            data.items = data.items.map(item => ({
                ...item,
                subtotal: Math.round(item.cantidad * item.precio_unitario * 100) / 100
            }));
            // Calculate total
            data.total = data.items.reduce((sum, item) => sum + item.subtotal, 0);
        }

        const pedido = await Pedido.findByIdAndUpdate(
            req.params.id,
            data,
            { new: true, runValidators: true }
        );
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
        await pedido.populate('cliente_id', 'razon_social cuit');
        res.json(pedido);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/pedidos/:id — Soft delete
router.delete('/:id', async (req, res) => {
    try {
        const pedido = await Pedido.findByIdAndUpdate(
            req.params.id,
            { activo: false },
            { new: true }
        );
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json({ message: 'Pedido desactivado', pedido });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH /api/pedidos/:id/reactivar
router.patch('/:id/reactivar', async (req, res) => {
    try {
        const pedido = await Pedido.findByIdAndUpdate(
            req.params.id,
            { activo: true },
            { new: true }
        );
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json({ message: 'Pedido reactivado', pedido });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
