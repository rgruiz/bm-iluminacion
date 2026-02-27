require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');
const Usuario = require('./models/Usuario');
const Cliente = require('./models/Cliente');
const Pedido = require('./models/Pedido');

const seed = async () => {
    await connectDB();

    // Create admin user
    const existingUser = await Usuario.findOne({ username: 'bmilumina' });
    if (!existingUser) {
        const user = new Usuario({
            username: 'bmilumina',
            password_hash: 'Tortuga77710'
        });
        await user.save();
        console.log('✅ Usuario admin creado (usuario: admin)');
    } else {
        console.log('ℹ️  Usuario admin ya existe');
    }

    // Create sample clients
    const clientCount = await Cliente.countDocuments();
    if (clientCount === 0) {
        const clientes = await Cliente.insertMany([
            {
                razon_social: 'Electricidad López S.R.L.',
                cuit: '30-71234567-0',
                condicion_iva: 'Responsable Inscripto',
                domicilio_fiscal: 'Av. Rivadavia 1234',
                localidad: 'Morón',
                provincia: 'Buenos Aires',
                codigo_postal: '1708',
                email: 'info@lopezelectricidad.com.ar',
                telefono: '011-4567-8901',
                contacto: 'Juan López'
            },
            {
                razon_social: 'Decoración Interior BA',
                cuit: '20-34567890-5',
                condicion_iva: 'Monotributista',
                domicilio_fiscal: 'Calle 50 Nro 789',
                localidad: 'La Plata',
                provincia: 'Buenos Aires',
                codigo_postal: '1900',
                email: 'contacto@decoracionba.com.ar',
                telefono: '0221-456-7890',
                contacto: 'María García'
            },
            {
                razon_social: 'Construcciones Roca S.A.',
                cuit: '30-98765432-1',
                condicion_iva: 'Responsable Inscripto',
                domicilio_fiscal: 'Belgrano 456',
                localidad: 'Quilmes',
                provincia: 'Buenos Aires',
                codigo_postal: '1878',
                email: 'compras@construccionesroca.com',
                telefono: '011-4253-1234',
                contacto: 'Carlos Roca'
            }
        ]);
        console.log(`✅ ${clientes.length} clientes de ejemplo creados`);

        // Create sample orders
        const pedido1 = new Pedido({
            cliente_id: clientes[0]._id,
            fecha_pedido: new Date(),
            fecha_entrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            estado: 'pendiente',
            items: [
                { descripcion: 'Lámpara LED empotrable 18W', cantidad: 20, precio_unitario: 4500, subtotal: 90000 },
                { descripcion: 'Panel LED 60x60 40W', cantidad: 10, precio_unitario: 12000, subtotal: 120000 }
            ],
            notas: 'Entrega en obra, Av. Mitre 890'
        });
        await pedido1.save();

        const pedido2 = new Pedido({
            cliente_id: clientes[1]._id,
            fecha_pedido: new Date(),
            fecha_entrega: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            estado: 'en_produccion',
            items: [
                { descripcion: 'Aplique de pared decorativo', cantidad: 8, precio_unitario: 8500, subtotal: 68000 },
                { descripcion: 'Colgante industrial vintage', cantidad: 4, precio_unitario: 15000, subtotal: 60000 },
                { descripcion: 'Tira LED RGB 5m', cantidad: 6, precio_unitario: 7200, subtotal: 43200 }
            ],
            notas: 'Cliente solicita envío a domicilio'
        });
        await pedido2.save();

        console.log('✅ 2 pedidos de ejemplo creados');
    } else {
        console.log('ℹ️  Ya existen datos de ejemplo');
    }

    console.log('\n🚀 Seed completado exitosamente');
    process.exit(0);
};

seed().catch(err => {
    console.error('Error en seed:', err);
    process.exit(1);
});
