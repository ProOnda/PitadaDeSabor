const mysql = require('mysql');
const fs = require('fs');
 
// Configuração do banco de dados (ajuste conforme necessário)
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',  // ajuste se houver senha
  multipleStatements: true  // importante para executar vários comandos
});
 
// Lê o arquivo SQL
const sql = fs.readFileSync(__dirname + '/receitas_db.sql').toString();
 
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar no MySQL:', err);
    return;
  }
  console.log('Conectado ao MySQL.');
 
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Erro ao importar o banco de dados:', error);
      return;
    }
    console.log('Banco de dados importado com sucesso!');
    connection.end();
  });
});
