const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id_usuario' // Mapeamento para o nome da coluna
        },
        nome: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'nome' // Mapeamento para o nome da coluna
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
            field: 'email' // Mapeamento para o nome da coluna
        },
        senha: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'senha' // Mapeamento para o nome da coluna
        },
        foto_perfil: {
            type: DataTypes.STRING,
            field: 'foto_perfil' // Mapeamento para o nome da coluna (opcional)
        },
        data_criacao: {
            type: DataTypes.DATE,
            field: 'data_criacao' // Mapeamento para o nome da coluna (opcional)
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'data_criacao' // Mapeamento para o nome da coluna
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'data_criacao' // Podemos usar a mesma coluna para simplificar, ou ter uma 'data_atualizacao'
        },
    }, {
        tableName: 'usuario', // Nome da sua tabela
        timestamps: true, // Se true, Sequelize adiciona createdAt e updatedAt (mapeados acima)
        hooks: {
            beforeCreate: async (user) => {
                console.log('Senha recebida no beforeCreate:', user.senha); // Adicione este log
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.senha, salt);
                user.senha = hashedPassword;
                console.log('Senha hasheada no beforeCreate:', hashedPassword); // Adicione este log
            },
        },
        instanceMethods: {
            comparePassword: async function (candidatePassword) {
                return await bcrypt.compare(candidatePassword, this.senha);
            },
        },
    });

    User.prototype.comparePassword = async function (candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.senha);
    };

    return User;
};