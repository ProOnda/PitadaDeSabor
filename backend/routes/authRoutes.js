// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/cadastro', authController.cadastrarUsuario);
router.post('/login', (req, res) => { // Modificamos aqui
  console.log('--- ROTA DE LOGIN ATINGIDA ---');
  authController.loginUsuario(req, res);
});

module.exports = router;