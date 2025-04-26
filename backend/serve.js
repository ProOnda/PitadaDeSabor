const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

require('./database');

app.use(cors({
  origin: 'http://localhost:8100',
}));

app.use(express.json());

const receitasRoutes = require('./routes/receitasRoutes');
app.use('/receitas', receitasRoutes);

app.get('/', (req, res) => {
  res.send('API de Receitas funcionando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});