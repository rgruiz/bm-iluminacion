require('dotenv').config();
const mongoose = require('mongoose');
const Pedido = require('./models/Pedido');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bruno-project', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function migrate() {
    try {
        console.log('Migrating old order statuses...');

        const resEntregado = await Pedido.updateMany(
            { estado: 'entregado' },
            { $set: { estado: 'entregado_sin_cobrar' } }
        );
        console.log(`Updated ${resEntregado.modifiedCount} 'entregado' orders to 'entregado_sin_cobrar'`);

        const resCobrado = await Pedido.updateMany(
            { estado: 'cobrado' },
            { $set: { estado: 'cobrado_pendiente_entrega' } }
        );
        console.log(`Updated ${resCobrado.modifiedCount} 'cobrado' orders to 'cobrado_pendiente_entrega'`);

        console.log('Migration completed.');
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

migrate();
