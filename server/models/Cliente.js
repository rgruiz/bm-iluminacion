const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    razon_social: { type: String, required: true, trim: true },
    cuit: { type: String, trim: true, default: '' },
    condicion_iva: {
        type: String,
        enum: ['Responsable Inscripto', 'Monotributista', 'Exento', 'Consumidor Final', ''],
        default: ''
    },
    domicilio_fiscal: { type: String, trim: true, default: '' },
    localidad: { type: String, trim: true, default: '' },
    provincia: { type: String, trim: true, default: 'Buenos Aires' },
    codigo_postal: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    telefono: { type: String, trim: true, default: '' },
    contacto: { type: String, trim: true, default: '' },
    transporte: { type: String, trim: true, default: '' },
    notas: { type: String, trim: true, default: '' },
    activo: { type: Boolean, default: true }
}, {
    timestamps: true
});

clienteSchema.index({ razon_social: 'text', cuit: 'text', email: 'text', contacto: 'text' });

module.exports = mongoose.model('Cliente', clienteSchema);
