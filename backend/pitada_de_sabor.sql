-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 04/05/2025 às 18:35
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `pitada_de_sabor`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `comentario`
--

CREATE TABLE `comentario` (
  `id_comentario` int(11) NOT NULL,
  `conteudo` text DEFAULT NULL,
  `data_comentario` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_receita` int(11) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `ingrediente`
--

CREATE TABLE `ingrediente` (
  `id_ingrediente` int(11) NOT NULL,
  `nome_ingrediente` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `listacompra`
--

CREATE TABLE `listacompra` (
  `id_lista_compra` int(11) NOT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_usuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `receita`
--

CREATE TABLE `receita` (
  `id_receita` int(11) NOT NULL,
  `nome_receita` varchar(100) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `modo_preparo` text DEFAULT NULL,
  `tempo_preparo` int(11) DEFAULT NULL,
  `dificuldade_receita` enum('Fácil','Média','Difícil') DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `url_foto` varchar(255) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `receita`
--

INSERT INTO `receita` (`id_receita`, `nome_receita`, `descricao`, `modo_preparo`, `tempo_preparo`, `dificuldade_receita`, `categoria`, `url_foto`, `id_usuario`) VALUES
(4, 'Salmão Assado com Molho de Maracujá', 'Um prato sofisticado e saboroso, perfeito para um jantar especial. O salmão assado fica suculento e o molho agridoce de maracujá adiciona um toque tropical irresistível.', '1. Preaqueça o forno a 200°C. 2. Tempere os filés de salmão com sal e pimenta. 3. Em uma tigela pequena, misture a polpa de maracujá, mel, shoyu e gengibre ralado. 4. Coloque os filés de salmão em uma assadeira forrada com papel alumínio. 5. Despeje o molho sobre o salmão. 6. Asse por 12-15 minutos ou até o salmão estar cozido e o molho levemente caramelizado. 7. Sirva quente com arroz branco e legumes salteados.', 25, 'Fácil', 'Peixes e Frutos do Mar', 'https://www.mareriopescados.com.br/uploads/receitas/42cd505435159ef7bc5d39bf8da917d4.jpg', 1),
(7, 'Frango Assado com Batatas Rústicas', 'Um clássico reconfortante, perfeito para um almoço de domingo. O frango fica dourado e saboroso, acompanhado de batatas assadas com ervas.', '1. Preaqueça o forno a 200°C. 2. Tempere o frango inteiro ou em pedaços com sal, pimenta, alho picado e as ervas de sua preferência (alecrim, tomilho). 3. Corte as batatas em pedaços grandes, tempere com azeite, sal, pimenta e páprica. 4. Coloque o frango e as batatas em uma assadeira grande. 5. Asse por cerca de 1 hora e 15 minutos ou até o frango estar cozido e dourado e as batatas macias. Regue o frango com o próprio caldo durante o cozimento. 6. Sirva quente.', 90, 'Média', 'Aves', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnmtCh1VhA7fDXR4BL5PAp5CSscReam7liqzKKZ0v23SyKmWizI-jAm4rpB4bZ', 1),
(8, 'Mousse de Chocolate Simples', 'Uma sobremesa clássica e irresistível, fácil de preparar e perfeita para os amantes de chocolate.', '1. Derreta o chocolate em banho-maria ou no micro-ondas. 2. Separe as gemas das claras. 3. Bata as gemas com o açúcar até obter um creme claro e fofo. 4. Adicione o chocolate derretido e misture bem. 5. Bata as claras em neve com uma pitada de sal até ficarem firmes. 6. Incorpore delicadamente as claras em neve à mistura de chocolate. 7. Divida a mousse em taças individuais e leve à geladeira por pelo menos 2 horas antes de servir. 8. Decore com raspas de chocolate ou frutas vermelhas.', 30, 'Fácil', 'Sobremesas', 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcS9Bm0EjwS-QXjPP2FASCKvQ6eklGDlpuwwnCNQ975FjMug3RAYWwEyA84P0G8y', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `receitaingrediente`
--

CREATE TABLE `receitaingrediente` (
  `id_receita` int(11) NOT NULL,
  `id_ingrediente` int(11) NOT NULL,
  `quantidade` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `senha` varchar(100) DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `data_criacao` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nome`, `email`, `senha`, `foto_perfil`, `data_criacao`) VALUES
(1, 'Nome de Teste', 'emaildeteste@example.com', 'senha123', NULL, '2025-04-26 15:15:17'),
(2, 'maria', 'marialuisaapolinario98@gmail.com', '$2b$10$dbkPfzOqqasIfixUH/Lhk.YjGPL6egypXbD6Iwgf2M773pXWQFopK', NULL, NULL),
(5, 'arthur', 'arthurpaulino@gmail.com', '$2b$10$E0GKvQq.KOHmKkdEoUH.5Od2uZYyAOBQZpSlJTksVTqJM963SkUy2', NULL, NULL),
(17, 'gabriel', 'biel@gmail.com', '$2b$10$tPgZoxr96239iKJKcEZmnOo3PBtqF7e2K17SQirOigE3SGFZcQR6G', NULL, '2025-05-04 16:26:04');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `comentario`
--
ALTER TABLE `comentario`
  ADD PRIMARY KEY (`id_comentario`),
  ADD KEY `id_receita` (`id_receita`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Índices de tabela `ingrediente`
--
ALTER TABLE `ingrediente`
  ADD PRIMARY KEY (`id_ingrediente`);

--
-- Índices de tabela `listacompra`
--
ALTER TABLE `listacompra`
  ADD PRIMARY KEY (`id_lista_compra`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Índices de tabela `receita`
--
ALTER TABLE `receita`
  ADD PRIMARY KEY (`id_receita`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Índices de tabela `receitaingrediente`
--
ALTER TABLE `receitaingrediente`
  ADD PRIMARY KEY (`id_receita`,`id_ingrediente`),
  ADD KEY `id_ingrediente` (`id_ingrediente`);

--
-- Índices de tabela `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `comentario`
--
ALTER TABLE `comentario`
  MODIFY `id_comentario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `ingrediente`
--
ALTER TABLE `ingrediente`
  MODIFY `id_ingrediente` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `listacompra`
--
ALTER TABLE `listacompra`
  MODIFY `id_lista_compra` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `receita`
--
ALTER TABLE `receita`
  MODIFY `id_receita` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `comentario`
--
ALTER TABLE `comentario`
  ADD CONSTRAINT `comentario_ibfk_1` FOREIGN KEY (`id_receita`) REFERENCES `receita` (`id_receita`),
  ADD CONSTRAINT `comentario_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Restrições para tabelas `listacompra`
--
ALTER TABLE `listacompra`
  ADD CONSTRAINT `listacompra_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Restrições para tabelas `receita`
--
ALTER TABLE `receita`
  ADD CONSTRAINT `receita_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Restrições para tabelas `receitaingrediente`
--
ALTER TABLE `receitaingrediente`
  ADD CONSTRAINT `receitaingrediente_ibfk_1` FOREIGN KEY (`id_receita`) REFERENCES `receita` (`id_receita`),
  ADD CONSTRAINT `receitaingrediente_ibfk_2` FOREIGN KEY (`id_ingrediente`) REFERENCES `ingrediente` (`id_ingrediente`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
