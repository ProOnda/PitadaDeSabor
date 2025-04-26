const mysql = require('mysql2');
const connection = require('../database');

exports.createReceita = (req, res) => {
  const { nome_receita, descricao, modo_preparo, tempo_preparo, dificuldade_receita, categoria, id_usuario, url_foto } = req.body;
  const sql = 'INSERT INTO receita (nome_receita, descricao, modo_preparo, tempo_preparo, dificuldade_receita, categoria, id_usuario, url_foto) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

  connection.query(sql, [nome_receita, descricao, modo_preparo, tempo_preparo, dificuldade_receita, categoria, id_usuario, url_foto], (err, result) => {
    if (err) {
      console.error('Erro ao criar receita:', err);
      return res.status(500).json({ error: 'Erro ao adicionar receita', details: err.message });
    }
    res.status(201).json({ message: 'Receita adicionada com sucesso!', id_receita: result.insertId });
  });
};

exports.getReceitas = (req, res) => {
  const sql = 'SELECT * FROM receita';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar receitas:', err);
      return res.status(500).json({ error: 'Erro ao buscar receitas', details: err.message });
    }
    res.json(results);
  });
};

exports.getReceitaById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM receita WHERE id_receita = ?';
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar receita por ID:', err);
      return res.status(500).json({ error: 'Erro ao buscar receita', details: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Receita não encontrada' });
    }
    res.json(results[0]);
  });
};

exports.updateReceita = (req, res) => {
  const { id } = req.params;
  const { nome_receita, descricao, modo_preparo, tempo_preparo, dificuldade_receita, categoria, id_usuario, url_foto } = req.body;
  const sql = 'UPDATE receita SET nome_receita = ?, descricao = ?, modo_preparo = ?, tempo_preparo = ?, dificuldade_receita = ?, categoria = ?, id_usuario = ?, url_foto = ? WHERE id_receita = ?';
  connection.query(sql, [nome_receita, descricao, modo_preparo, tempo_preparo, dificuldade_receita, categoria, id_usuario, url_foto, id], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar receita:', err);
      return res.status(500).json({ error: 'Erro ao atualizar receita', details: err.message });
    }
    res.json({ message: 'Receita atualizada com sucesso!' });
  });
};

exports.deleteReceita = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM receita WHERE id_receita = ?';
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Erro ao deletar receita:', err);
      return res.status(500).json({ error: 'Erro ao deletar receita', details: err.message });
    }
    res.json({ message: 'Receita deletada com sucesso!' });
  });
};