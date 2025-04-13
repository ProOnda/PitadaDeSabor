const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Conexão com o banco de dados
require('./database'); // importa a conexão (não precisa atribuir)

app.use(express.json());

// Ativando o CORS
app.use(cors({
  origin: 'http://localhost:8100',
}));

// Rotas
const receitasRoutes = require('./routes/receitasRoutes');
app.use('/receitas', receitasRoutes);

// Teste API
app.get('/', (req, res) => {
  res.send('API de Receitas funcionando!');
});

// Start servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
