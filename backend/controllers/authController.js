const { User } = require('../serve');
const bcrypt = require('bcrypt');

exports.cadastrarUsuario = async (req, res) => {
    console.log('Recebida requisição de cadastro:', req.body);
    const { nome, email, senha, confirmarSenha } = req.body;

    if (!nome || !email || !senha || !confirmarSenha) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    if (senha !== confirmarSenha) {
        return res.status(400).json({ message: 'As senhas não coincidem.' });
    }

    try {
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Este email já está cadastrado.' });
        }

        const newUser = await User.create({
            nome: nome,
            email: email,
            senha: senha, // Passe a senha em texto plano aqui
        });

        res.status(201).json({ message: 'Cadastro realizado com sucesso!' });

    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Este email já está cadastrado.' });
        }
        return res.status(500).json({ message: 'Erro interno no servidor durante o cadastro.' });
    }
};
exports.loginUsuario = async (req, res) => {
    console.log('Recebida requisição de login:', req.body);
    const { email, senha } = req.body;
    console.log('Email recebido:', email);
    console.log('Senha recebida:', senha);

    try {
        const user = await User.findOne({ where: { email: email } });
        if (!user) { /* ... */ }

        console.log('Senha fornecida:', senha);
        console.log('Senha hash do banco de dados:', user.senha);

        const senhaCorreta = await bcrypt.compare(senha, user.senha);

        console.log('Resultado da comparação de senhas:', senhaCorreta);

        if (senhaCorreta) {
            return res.status(200).json({ message: 'Login realizado com sucesso!', nome: user.nome });
        } else {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};