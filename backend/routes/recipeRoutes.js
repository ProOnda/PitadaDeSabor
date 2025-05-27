// backend/routes/recipeRoutes.js

const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController'); // Verifique o caminho

// Rota para obter detalhes de uma única receita
router.get('/:id', recipeController.getRecipeById);

// Rota para criar uma nova receita
router.post('/', recipeController.createRecipe);

// Rota para atualizar uma receita existente
router.put('/:id', recipeController.updateRecipe);

// Rota para listar receitas (com filtros opcionais)
router.get('/', recipeController.listRecipes);

module.exports = router;