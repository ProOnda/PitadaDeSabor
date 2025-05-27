// backend/routes/ingredientRoutes.js
const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');

// Rota para buscar detalhes de um ingrediente por ID (ex: FDC_ID)
// O ID será passado como parâmetro na URL: /api/ingredients/170422
router.get('/:id', ingredientController.getIngredientById);

// Rota para pesquisar ingredientes por nome
// A query será passada como parâmetro na URL: /api/ingredients/search?query=frango
router.get('/search', ingredientController.searchIngredients);

module.exports = router;