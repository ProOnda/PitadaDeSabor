const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize'); // Importe o Sequelize
const app = express();
const PORT = 3000;

// Configurar a conexão Sequelize
const sequelize = new Sequelize('pitada_de_sabor', 'root', '', { // Substitua pelas suas credenciais
    host: 'localhost', // Geralmente 'localhost' para o XAMPP
    dialect: 'mysql',
    port: 3306, // Porta padrão do MySQL no XAMPP
    logging: console.log, // Opcional: para ver os logs do Sequelize
});

// Importar o modelo User
const User = require('./models/user')(sequelize);

// Sincronizar o modelo com o banco de dados
sequelize.sync()
    .then(() => {
        console.log('Modelo User sincronizado com o banco de dados.');
    })
    .catch((err) => {
        console.error('Erro ao sincronizar o modelo User:', err);
    });

// Exportar o Sequelize e o modelo User para usar no authController
module.exports = { sequelize, User };

app.use(cors({
    origin: 'http://localhost:8100', // Permite requisições do seu frontend Ionic (porta padrão)
}));

app.use(express.json());

const receitasRoutes = require('./routes/receitasRoutes');
const authRoutes = require('./routes/authRoutes'); // Importe as rotas de autenticação
app.use('/receitas', receitasRoutes);
app.use('/auth', authRoutes); // Use o prefixo /auth para as rotas de autenticação

app.get('/', (req, res) => {
    res.send('API de Receitas funcionando!');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});