const admin = require('firebase-admin');
const db = admin.firestore();

async function getRecipeById(req, res) {
    try {
        const recipeId = req.params.id;

        console.log('ID da receita recebido no backend para detalhes:', recipeId);

        // Validação para garantir que o ID não é nulo ou vazio
        if (!recipeId || typeof recipeId !== 'string' || recipeId.trim() === '') {
            console.error('ID da receita inválido ou vazio recebido:', recipeId);
            return res.status(400).send({ message: 'ID da receita inválido.' });
        }

        const recipeDocRef = db.collection('recipes').doc(recipeId);
        const recipeDoc = await recipeDocRef.get();

        if (!recipeDoc.exists) {
            return res.status(404).send({ message: 'Receita não encontrada.' });
        }

        const firestoreData = recipeDoc.data();

        // 2. Mapeamento e populamento dos ingredientes: Firestore snake_case para frontend camelCase
        let ingredientsFormatted = [];
        if (Array.isArray(firestoreData.ingredients) && firestoreData.ingredients.length > 0) {
            const unitPromises = firestoreData.ingredients.map(async (ing) => {
                let unitName = '';

                if (ing.unit_id && ing.unit_id.get) {
                    try {
                        const unitDoc = await ing.unit_id.get();
                        if (unitDoc.exists) {
                            unitName = unitDoc.data().label; // Supondo que o nome da unidade está no campo 'label'
                            console.log(`Unidade encontrada (referência) para ${ing.ingredient_name}: ID=${ing.unit_id.id}, Nome=${unitName}`);
                        } else {
                            console.log(`Documento da unidade (referência) ${ing.unit_id.id} não encontrado.`);
                            unitName = 'unidade desconhecida';
                        }
                    } catch (unitError) {
                        console.error(`Erro ao buscar unidade (referência) para ingrediente ${ing.ingredient_name}:`, unitError);
                        unitName = 'erro unidade';
                    }
                }
                // Se não for DocumentReference, tenta como string de ID
                else if (typeof ing.unit_id === 'string' && ing.unit_id.trim() !== '') {
                    try {
                        const unitDoc = await db.collection('units').doc(ing.unit_id).get();
                        if (unitDoc.exists) {
                            unitName = unitDoc.data().label;
                            console.log(`Unidade encontrada (ID string) para ${ing.ingredient_name}: ID=${ing.unit_id}, Nome=${unitName}`);
                        } else {
                            console.log(`Documento da unidade (ID string) ${ing.unit_id} não encontrado.`);
                            unitName = 'unidade desconhecida';
                        }
                    } catch (unitError) {
                        console.error(`Erro ao buscar unidade (ID string) para ingrediente ${ing.ingredient_name}:`, unitError);
                        unitName = 'erro unidade';
                    }
                } else {
                    console.log(`unit_id do ingrediente ${ing.ingredient_name} não é uma referência ou string válida:`, ing.unit_id);
                    unitName = 'N/A'; // Nenhuma unidade válida para buscar
                }

                return {
                    fdcId: ing.fdc_id, // Usando o nome original do Firestore (snake_case)
                    name: ing.ingredient_name,
                    quantity: ing.quantity,
                    unitId: ing.unit_id ? (ing.unit_id.id || ing.unit_id) : null, // Retorna o ID da unidade (seja da ref ou string)
                    unitName: unitName // ESTE É O CAMPO COM O LABEL DA UNIDADE PARA EXIBIÇÃO
                };
            });
            ingredientsFormatted = await Promise.all(unitPromises);
        }


        // 3. Busca os dados de referência (labels) em paralelo
        const [categoryDoc, difficultyDoc, timeDoc, userDoc] = await Promise.all([
            firestoreData.category_id ? db.collection('categories').doc(firestoreData.category_id.id).get() : Promise.resolve(null),
            firestoreData.difficulty_id ? db.collection('difficulties').doc(firestoreData.difficulty_id.id).get() : Promise.resolve(null),
            firestoreData.time_id ? db.collection('times').doc(firestoreData.time_id.id).get() : Promise.resolve(null),
            firestoreData.user_id ? db.collection('users').doc(firestoreData.user_id.id).get() : Promise.resolve(null)
        ]);

        // 4. Agrega todos os dados em um único objeto para enviar ao frontend (camelCase)
        const aggregatedRecipe = {
            id: recipeDoc.id,
            recipe: {
                recipeName: firestoreData.recipe_name || 'Sem Nome',
                description: firestoreData.description || '',
                photoUrl: firestoreData.photo || 'assets/placeholder.png',
                // CAMPO CORRIGIDO: Agora pegando 'preparation_mode' do Firestore
                preparationSteps: Array.isArray(firestoreData.preparation_mode) ? firestoreData.preparation_mode : [],
                ingredients: ingredientsFormatted, // Usando os ingredientes formatados com nomes de unidade
                ingredientFoodTypes: Array.isArray(firestoreData.ingredient_food_type) ? firestoreData.ingredient_food_type : [],

                categoryId: firestoreData.category_id ? firestoreData.category_id.id : null,
                difficultyId: firestoreData.difficulty_id ? firestoreData.difficulty_id.id : null,
                timeId: firestoreData.time_id ? firestoreData.time_id.id : null,
                userId: firestoreData.user_id ? firestoreData.user_id.id : null,

                categoryName: categoryDoc && categoryDoc.exists ? categoryDoc.data().label : 'Não definida',
                difficultyName: difficultyDoc && difficultyDoc.exists ? difficultyDoc.data().label : 'Não definida',
                timeName: timeDoc && timeDoc.exists ? timeDoc.data().label : 'Não definido',
                userName: userDoc && userDoc.exists ? userDoc.data().user_name : 'Desconhecido',

                createdAt: firestoreData.created_at && firestoreData.created_at.toDate ? firestoreData.created_at.toDate().toISOString() : null,
                updatedAt: firestoreData.updated_at && firestoreData.updated_at.toDate ? firestoreData.updated_at.toDate().toISOString() : null
            }
        };

        res.status(200).send(aggregatedRecipe);

    } catch (error) {
        console.error('Erro ao buscar receita por ID:', error);
        res.status(500).send({ message: 'Erro interno do servidor ao buscar receita.' });
    }
}

// --- Função para criar uma nova receita ---
async function createRecipe(req, res) {
    try {
        const {
            recipeName, description, photoUrl, userId,
            categoryId, difficultyId, timeId, preparationSteps, // preparationSteps vem do frontend
            ingredients // Este virá do frontend como Array de objetos { fdcId, name, foodType, quantity, unitId }
        } = req.body;

        // Validações básicas (adicione mais conforme necessário)
        if (!recipeName || !userId || !ingredients || !Array.isArray(ingredients)) {
            return res.status(400).send({ message: 'Campos obrigatórios da receita ausentes ou inválidos.' });
        }
        for (const ingredient of ingredients) {
            if (!ingredient.name || typeof ingredient.quantity !== 'number' || !ingredient.unitId || !ingredient.foodType || !ingredient.fdcId) {
                return res.status(400).send({ message: 'Estrutura de ingrediente inválida.' });
            }
        }

        // Mapeamento dos ingredientes: frontend camelCase para Firestore snake_case
        const ingredientsToSave = ingredients.map(ing => ({
            fdc_id: ing.fdcId,
            ingredient_name: ing.name,
            food_type: ing.foodType,
            quantity: ing.quantity,
            // AQUI: Converte unitId (string) para DocumentReference ao salvar
            unit_id: ing.unitId ? db.collection('units').doc(ing.unitId) : null
        }));

        // Geração do campo `ingredient_food_type` para consultas futuras (Firestore snake_case)
        const uniqueFoodTypes = [...new Set(ingredients.map(ing => ing.foodType))];

        // Converte os IDs de string para DocumentReference antes de salvar no Firestore
        const categoryRef = categoryId ? db.collection('categories').doc(categoryId) : null;
        const difficultyRef = difficultyId ? db.collection('difficulties').doc(difficultyId) : null;
        const timeRef = timeId ? db.collection('times').doc(timeId) : null;
        const userRef = userId ? db.collection('users').doc(userId) : null;


        const newRecipeData = {
            recipe_name: recipeName,
            description: description,
            photo: photoUrl,
            user_id: userRef, // Salva como referência
            category_id: categoryRef, // Salva como referência
            difficulty_id: difficultyRef, // Salva como referência
            time_id: timeRef, // Salva como referência
            // CAMPO CORRIGIDO: Salva no Firestore como 'preparation_mode'
            preparation_mode: preparationSteps, // <<-- Alterado de 'preparation_steps' para 'preparation_mode'
            ingredients: ingredientsToSave,
            ingredient_food_type: uniqueFoodTypes,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('recipes').add(newRecipeData);

        res.status(201).send({
            message: 'Receita criada com sucesso!',
            recipeId: docRef.id
        });

    } catch (error) {
        console.error('Erro ao criar receita:', error);
        res.status(500).send({ message: 'Erro interno do servidor ao criar receita.' });
    }
}

// --- Função para atualizar uma receita existente ---
async function updateRecipe(req, res) {
    try {
        const recipeId = req.params.id;
        const {
            recipeName, description, photoUrl, userId,
            categoryId, difficultyId, timeId, preparationSteps, ingredients
        } = req.body;

        if (!recipeId || !ingredients || !Array.isArray(ingredients)) {
            return res.status(400).send({ message: 'ID da receita ou dados de ingrediente ausentes para atualização.' });
        }

        // Mapeamento dos ingredientes para salvar: frontend camelCase para Firestore snake_case
        const ingredientsToSave = ingredients.map(ing => ({
            fdc_id: ing.fdcId,
            ingredient_name: ing.name,
            food_type: ing.foodType,
            quantity: ing.quantity,
            // AQUI: Converte unitId (string) para DocumentReference ao salvar
            unit_id: ing.unitId ? db.collection('units').doc(ing.unitId) : null
        }));

        // Re-gera o campo `ingredient_food_type` em cada atualização para manter a consistência
        const uniqueFoodTypes = [...new Set(ingredients.map(ing => ing.foodType))];

        // Converte os IDs de string para DocumentReference antes de salvar no Firestore
        const categoryRef = categoryId ? db.collection('categories').doc(categoryId) : null;
        const difficultyRef = difficultyId ? db.collection('difficulties').doc(difficultyId) : null;
        const timeRef = timeId ? db.collection('times').doc(timeId) : null;
        const userRef = userId ? db.collection('users').doc(userId) : null;

        const updatedRecipeData = {
            recipe_name: recipeName,
            description: description,
            photo: photoUrl,
            user_id: userRef, // Salva como referência
            category_id: categoryRef, // Salva como referência
            difficulty_id: difficultyRef, // Salva como referência
            time_id: timeRef, // Salva como referência
            // CAMPO CORRIGIDO: Salva no Firestore como 'preparation_mode'
            preparation_mode: preparationSteps, // <<-- Alterado de 'preparation_steps' para 'preparation_mode'
            ingredients: ingredientsToSave,
            ingredient_food_type: uniqueFoodTypes,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('recipes').doc(recipeId).update(updatedRecipeData);

        res.status(200).send({ message: 'Receita atualizada com sucesso!' });

    } catch (error) {
        console.error('Erro ao atualizar receita:', error);
        res.status(500).send({ message: 'Erro interno do servidor ao atualizar receita.' });
    }
}

// --- Função para listar receitas (com filtros opcionais) ---
async function listRecipes(req, res) {
    try {
        const { foodType, categoryId, userId, ...otherFilters } = req.query; // Pega filtros da query string

        let queryRef = db.collection('recipes');

        // --- Aplicar filtros usando nomes de campos do Firestore (snake_case) ---
        if (foodType) {
            queryRef = queryRef.where('ingredient_food_type', 'array-contains', foodType);
        }
        if (categoryId) {
            // Se no Firestore o category_id é salvo como DocumentReference, a query precisa ser feita com a referência.
            queryRef = queryRef.where('category_id', '==', db.collection('categories').doc(categoryId));
        }
        if (userId) {
            // Semelhante ao categoryId, se user_id for salvo como DocumentReference.
            queryRef = queryRef.where('user_id', '==', db.collection('users').doc(userId));
        }


        const recipesSnapshot = await queryRef.get();

        const recipes = [];
        // Mapear os dados do Firestore (snake_case) para o RecipeListItem do frontend (camelCase)
        for (const doc of recipesSnapshot.docs) { // Usando for...of para await dentro do loop se precisar
            const data = doc.data();

            let categoryName = null;
            if (data.category_id && data.category_id.get) { // Verifica se é uma DocumentReference
                const categoryDoc = await data.category_id.get();
                if (categoryDoc.exists) {
                    categoryName = categoryDoc.data().label;
                }
            }

            // Repita para difficulty, time, user se precisar dos nomes na lista
            let difficultyName = null;
            if (data.difficulty_id && data.difficulty_id.get) {
                const difficultyDoc = await data.difficulty_id.get();
                if (difficultyDoc.exists) {
                    difficultyName = difficultyDoc.data().label;
                }
            }

            let timeName = null;
            if (data.time_id && data.time_id.get) {
                const timeDoc = await data.time_id.get();
                if (timeDoc.exists) {
                    timeName = timeDoc.data().label;
                }
            }

            let userName = null;
            if (data.user_id && data.user_id.get) {
                const userDoc = await data.user_id.get();
                if (userDoc.exists) {
                    userName = userDoc.data().user_name; // Ajuste para o campo de nome de usuário real
                }
            }


            recipes.push({
                id: doc.id,
                recipeName: data.recipe_name || 'Sem Nome', // Converte de recipe_name para recipeName
                photoUrl: data.photo || 'assets/placeholder.png', // Converte de photo para photoUrl
                description: data.description || '', // Pode truncar para a lista se quiser
                // Inclua IDs de referência para que o frontend possa usá-los se precisar
                categoryId: data.category_id ? data.category_id.id : null,
                difficultyId: data.difficulty_id ? data.difficulty_id.id : null,
                timeId: data.time_id ? data.time_id.id : null,
                userId: data.user_id ? data.user_id.id : null,
                // Inclua os nomes populados para a lista, se necessário
                categoryName: categoryName,
                difficultyName: difficultyName,
                timeName: timeName,
                userName: userName
            });
        }

        res.status(200).send(recipes);

    } catch (error) {
        console.error('Erro ao listar receitas:', error);
        res.status(500).send({ message: 'Erro interno do servidor.' });
    }
}


// --- Exporta as funções do controlador ---
module.exports = {
    getRecipeById,
    createRecipe,
    updateRecipe,
    listRecipes,
};