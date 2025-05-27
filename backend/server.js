// backend/server.js
require('dotenv').config(); // Carrega as variáveis de ambiente do .env

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuração do Firebase Admin SDK ---
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: "https://<SUA_DATABASE_NAME>.firebaseio.com" // Opcional, se usar Realtime Database
});

const db = admin.firestore();
exports.db = db;

// --- Importar Rotas ---
const ingredientRoutes = require('./routes/ingredientRoutes');
const recipeRoutes = require('./routes/recipeRoutes');


// --- Middlewares ---
app.use(cors({
  origin: 'http://localhost:4200' // <--- CORRIGIDO AQUI! Mude para 4200
  // Em produção, você pode definir isso para o seu domínio real: 'https://seunome.com'
}));
app.use(express.json());

// --- Usar Rotas ---
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);


// --- Rota de Teste ---
app.get('/', (req, res) => {
  res.send('API de Receitas funcionando!');
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`Backend API rodando em http://localhost:${PORT}`);
  console.log(`Conectado ao Firebase com sucesso.`);
});