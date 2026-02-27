const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password_hash: { type: String, required: true }
}, {
    timestamps: true
});

usuarioSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
};

usuarioSchema.pre('save', async function () {
    if (this.isModified('password_hash')) {
        this.password_hash = await bcrypt.hash(this.password_hash, 10);
    }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
