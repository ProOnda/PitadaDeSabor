// backend/controllers/ingredientController.js
const axios = require('axios');
const admin = require('firebase-admin'); // Importar o admin SDK
const db = admin.firestore(); // Obter a instância do Firestore (do server.js)

const FDC_API_KEY = process.env.FDC_API_KEY;
const FDC_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// Função auxiliar para salvar/atualizar ingrediente na sua coleção 'ingredients' do Firestore
const saveOrUpdateIngredientInFirestore = async (fdcId, data) => {
  try {
    const ingredientRef = db.collection('ingredients').doc(fdcId.toString());
    await ingredientRef.set(data, { merge: true }); // 'merge: true' para atualizar campos existentes
    console.log(`Ingrediente FDC ID ${fdcId} salvo/atualizado no Firestore.`);
  } catch (error) {
    console.error(`Erro ao salvar/atualizar ingrediente ${fdcId} no Firestore:`, error);
  }
};

// Controlador para buscar um ingrediente por ID (fdc_id)
exports.getIngredientById = async (req, res) => {
  const { id } = req.params; // O ID do FDC virá da URL

  if (!id) {
    return res.status(400).json({ message: 'ID do ingrediente é obrigatório.' });
  }

  try {
    // 1. Tentar buscar no Firestore primeiro (para cache)
    const firestoreDoc = await db.collection('ingredients').doc(id).get();
    if (firestoreDoc.exists) {
      console.log(`Ingrediente ${id} encontrado no Firestore.`);
      return res.json(firestoreDoc.data()); // Retorna o que já está no seu Firestore
    }

    // 2. Se não encontrou no Firestore, buscar na API FDC
    console.log(`Ingrediente ${id} não encontrado no Firestore, buscando na API FDC...`);
    const response = await axios.get(`${FDC_BASE_URL}/food/${id}?api_key=${FDC_API_KEY}`);
    const foodData = response.data;

    // Transforme os dados da API FDC para o formato que você quer no seu Firestore e frontend
    const transformedData = {
      fdc_id: foodData.fdcId ? foodData.fdcId.toString() : id.toString(), // Garante que fdc_id é string
      ingredient_name: foodData.description || 'Nome Indisponível',
      ingredient_category: foodData.foodCategory ? foodData.foodCategory.description : 'Geral',
      // Adicione outros campos da API FDC que você queira persistir, ex:
      // calories: foodData.foodNutrients?.find(n => n.nutrientName === 'Energy')?.value || 0,
      // protein: foodData.foodNutrients?.find(n => n.nutrientName === 'Protein')?.value || 0,
      // ...
    };

    // 3. Salvar no Firestore para futuras buscas (cache)
    await saveOrUpdateIngredientInFirestore(transformedData.fdc_id, transformedData);

    res.json(transformedData); // Retorna os dados transformados para o frontend

  } catch (error) {
    console.error(`Erro ao buscar ingrediente com ID ${id}:`, error.message);
    if (error.response) {
      // Repassa o status e mensagem de erro da API FDC
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: 'Erro interno do servidor ao conectar com a API externa.' });
    }
  }
};

// Controlador para pesquisar ingredientes
exports.searchIngredients = async (req, res) => {
  const { query, pageNumber = 1, pageSize = 20 } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Parâmetro de busca "query" é obrigatório.' });
  }

  try {
    const response = await axios.get(`${FDC_BASE_URL}/foods/search?query=${query}&pageNumber=${pageNumber}&pageSize=${pageSize}&api_key=${FDC_API_KEY}`);
    const searchResults = response.data.foods;

    const transformedResults = searchResults.map(food => ({
      fdc_id: food.fdcId ? food.fdcId.toString() : '',
      ingredient_name: food.description || 'Nome Indisponível',
      ingredient_category: food.foodCategory ? food.foodCategory.description : 'Geral',
    }));

    // Opcional: Salvar todos os resultados da pesquisa no Firestore (cuidado com volume de dados)
    // for (const ingredient of transformedResults) {
    //   await saveOrUpdateIngredientInFirestore(ingredient.fdc_id, ingredient);
    // }

    res.json({
      totalHits: response.data.totalHits,
      currentPage: response.data.currentPage,
      pageSize: response.data.pageSize,
      ingredients: transformedResults
    });

  } catch (error) {
    console.error(`Erro ao pesquisar ingredientes com query "${query}":`, error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
};