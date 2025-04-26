const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Se você tiver uma senha, coloque aqui
  database: 'pitada_de_sabor', // Use o nome correto do seu banco de dados
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    throw err; // Importante: lançar o erro para interromper a aplicação
  } else {
    console.log('Conectado ao MySQL!');
  }
});

module.exports = connection;