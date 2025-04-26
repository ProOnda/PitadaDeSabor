const express = require('express');
const router = express.Router();
const receitasController = require('../controllers/receitasController');

router.post('/', receitasController.createReceita);
router.get('/', receitasController.getReceitas);
router.get('/:id', receitasController.getReceitaById);
router.put('/:id', receitasController.updateReceita);
router.delete('/:id', receitasController.deleteReceita);

module.exports = router;