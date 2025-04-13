// routes/receitasRoutes.js
const express = require('express');
const router = express.Router();

// Importa o controller
const receitasController = require('../controllers/receitasController');

// Rota para criar uma receita
router.post('/', receitasController.createReceita);

// Rota para listar todas as receitas
router.get('/', receitasController.getReceitas);

// Rota para buscar uma receita específica
router.get('/:id', receitasController.getReceitaById);

// Rota para atualizar uma receita
router.put('/:id', receitasController.updateReceita);

// Rota para deletar uma receita
router.delete('/:id', receitasController.deleteReceita);

module.exports = router;
