// controllers/receitasController.js
const mysql = require('mysql2');

// Crie a conexão com o banco ou importe a conexão já configurada
const connection = require('../database');

// Função para criar uma receita
exports.createReceita = (req, res) => {
  const { nome, ingredientes, modo_preparo, categoria } = req.body;
  const sql = 'INSERT INTO receitas (nome, ingredientes, modo_preparo, categoria) VALUES (?, ?, ?, ?)';
  connection.query(sql, [nome, ingredientes, modo_preparo, categoria], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao adicionar receita' });
    }
    res.status(201).json({ message: 'Receita adicionada com sucesso!', id: result.insertId });
  });
};

// Função para listar todas as receitas
exports.getReceitas = (req, res) => {
  const sql = 'SELECT * FROM receitas';
  connection.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar receitas' });
    }
    res.json(results);
  });
};

// Função para buscar uma receita específica pelo ID
exports.getReceitaById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM receitas WHERE id = ?';
  connection.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar a receita' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Receita não encontrada' });
    }
    res.json(results[0]);
  });
};

// Função para atualizar uma receita
exports.updateReceita = (req, res) => {
  const { id } = req.params;
  const { nome, ingredientes, modo_preparo, categoria } = req.body;
  const sql = 'UPDATE receitas SET nome = ?, ingredientes = ?, modo_preparo = ?, categoria = ? WHERE id = ?';
  connection.query(sql, [nome, ingredientes, modo_preparo, categoria, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar a receita' });
    }
    res.json({ message: 'Receita atualizada com sucesso!' });
  });
};

// Função para deletar uma receita
exports.deleteReceita = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM receitas WHERE id = ?';
  connection.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar a receita' });
    }
    res.json({ message: 'Receita deletada com sucesso!' });
  });
};
