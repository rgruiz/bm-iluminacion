const mongoose = require('mongoose');

const empresaSchema = new mongoose.Schema({
    razon_social: { type: String, trim: true, default: 'BM Iluminación' },
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
    notas: { type: String, trim: true, default: '' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Empresa', empresaSchema);
