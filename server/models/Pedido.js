const mongoose = require('mongoose');

const pedidoItemSchema = new mongoose.Schema({
    descripcion: { type: String, required: true, trim: true },
    cantidad: { type: Number, required: true, min: 1 },
    precio_unitario: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 }
}, { _id: true });

const pedidoSchema = new mongoose.Schema({
    cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
    folio: { type: String, unique: true },
    fecha_pedido: { type: Date, default: Date.now },
    fecha_entrega: { type: Date },
    estado: {
        type: String,
        enum: ['pendiente', 'en_produccion', 'listo', 'entregado', 'cobrado', 'cancelado'],
        default: 'pendiente'
    },
    items: [pedidoItemSchema],
    total: { type: Number, default: 0 },
    notas: { type: String, trim: true, default: '' },
    activo: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Auto-generate folio before saving
pedidoSchema.pre('save', async function () {
    if (!this.folio) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('Pedido').countDocuments({
            folio: new RegExp(`^PED-${year}-`)
        });
        this.folio = `PED-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    // Calculate total
    this.total = this.items.reduce((sum, item) => sum + item.subtotal, 0);
});

pedidoSchema.index({ folio: 'text' });

module.exports = mongoose.model('Pedido', pedidoSchema);
