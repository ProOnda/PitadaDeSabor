const admin = require('firebase-admin');
const db = admin.firestore();

// --- Função para obter detalhes de uma única receita ---
async function getRecipeById(req, res) {
    try {
        const recipeId = req.params.id;

        console.log('\n--- CALL: getRecipeById ---');
        console.log('ID da receita recebido no backend para detalhes:', recipeId);

        if (!recipeId || typeof recipeId !== 'string' || recipeId.trim() === '') {
            console.error('ID da receita inválido ou vazio recebido:', recipeId);
            return res.status(400).send({ message: 'ID da receita inválido.' });
        }

        const recipeDocRef = db.collection('recipes').doc(recipeId);
        const recipeDoc = await recipeDocRef.get();

        if (!recipeDoc.exists) {
            console.log(`[getRecipeById] Receita com ID ${recipeId} não encontrada.`);
            return res.status(404).send({ message: 'Receita não encontrada.' });
        }

        const firestoreData = recipeDoc.data();

        let ingredientsFormatted = [];
        if (Array.isArray(firestoreData.ingredients) && firestoreData.ingredients.length > 0) {
            ingredientsFormatted = firestoreData.ingredients.map(ing => ({
                fdcId: ing.fdc_id,
                name: ing.ingredient_name,
                quantity: ing.quantity,
                unitId: ing.unit_id ? ing.unit_id.id : null,
                unitLabel: ing.unit_label || 'N/A',
                foodTypeId: ing.food_type_id ? ing.food_type_id.id : null,
                foodTypeLabel: ing.food_type_label || 'N/A'
            }));
        }

        let userName = 'Desconhecido';
        if (firestoreData.user_id && firestoreData.user_id.get) {
            try {
                const userDoc = await firestoreData.user_id.get();
                if (userDoc.exists) {
                    userName = userDoc.data().user_name || userDoc.data().displayName || userDoc.data().email;
                    console.log(`[getRecipeById] Nome de usuário obtido para receita ${recipeId}:`, userName);
                }
            } catch (userError) {
                console.error(`Erro ao buscar nome de usuário para ID ${firestoreData.user_id.id}:`, userError);
            }
        }

        const aggregatedRecipe = {
            id: recipeDoc.id,
            recipe: {
                recipeName: firestoreData.recipe_name || 'Sem Nome',
                description: firestoreData.description || '',
                photoUrl: firestoreData.photo || 'assets/placeholder.png',
                preparationSteps: Array.isArray(firestoreData.preparation_mode) ? firestoreData.preparation_mode : [],
                ingredients: ingredientsFormatted,

                categoryId: firestoreData.category_id ? firestoreData.category_id.id : null,
                categoryLabel: firestoreData.category_label || 'Não definida',
                
                difficultyId: firestoreData.difficulty_id ? firestoreData.difficulty_id.id : null,
                difficultyLabel: firestoreData.difficulty_label || 'Não definida',
                
                timeId: firestoreData.time_id ? firestoreData.time_id.id : null,
                timeLabel: firestoreData.time_label || 'Não definido',
                
                userId: firestoreData.user_id ? firestoreData.user_id.id : null,
                userName: userName,

                createdAt: firestoreData.createdAt && firestoreData.createdAt.toDate ? firestoreData.createdAt.toDate().toISOString() : null,
                updatedAt: firestoreData.updatedAt && firestoreData.updatedAt.toDate ? firestoreData.updatedAt.toDate().toISOString() : null
            }
        };

        console.log(`[getRecipeById] Receita ${recipeId} encontrada e formatada.`);
        res.status(200).send(aggregatedRecipe);

    } catch (error) {
        console.error('[getRecipeById] Erro ao buscar receita por ID:', error);
        res.status(500).send({ message: 'Erro interno do servidor ao buscar receita.' });
    } finally {
        console.log('--- END: getRecipeById ---\n');
    }
}

// --- Função para criar uma nova receita ---
async function createRecipe(req, res) {
    console.log('\n--- CALL: createRecipe ---');
    try {
        console.log('BACKEND - createRecipe: Conteúdo completo do req.body:', JSON.stringify(req.body, null, 2));

        const {
            recipeName, description, photoUrl, userId,
            categoryId, difficultyId, timeId, preparationSteps,
            ingredients
        } = req.body;

        console.log('BACKEND - createRecipe: userId recebido no req.body:', userId);

        if (!recipeName || !userId || !ingredients || !Array.isArray(ingredients)) {
            console.error('[createRecipe] Campos obrigatórios ausentes: recipeName, userId, ingredients.');
            return res.status(400).send({ message: 'Campos obrigatórios da receita ausentes ou inválidos.' });
        }
        for (const ingredient of ingredients) {
            if (!ingredient.name || typeof ingredient.quantity !== 'number' || !ingredient.unitId || !ingredient.foodTypeId) {
                console.error('[createRecipe] Estrutura de ingrediente inválida:', ingredient);
                return res.status(400).send({ message: 'Estrutura de ingrediente inválida.' });
            }
        }

        const [
            categoryDoc,
            difficultyDoc,
            timeDoc,
            userDoc,
            allUnitsSnapshot,
            allFoodTypesSnapshot
        ] = await Promise.all([
            categoryId ? db.collection('categories').doc(categoryId).get() : Promise.resolve(null),
            difficultyId ? db.collection('difficulties').doc(difficultyId).get() : Promise.resolve(null),
            timeId ? db.collection('times').doc(timeId).get() : Promise.resolve(null),
            userId ? db.collection('users').doc(userId).get() : Promise.resolve(null),
            db.collection('units').get(),
            db.collection('foodTypes').get()
        ]);

        const unitsMap = new Map();
        allUnitsSnapshot.forEach(doc => unitsMap.set(doc.id, doc.data().label));
        const foodTypesMap = new Map();
        allFoodTypesSnapshot.forEach(doc => foodTypesMap.set(doc.id, doc.data().label));

        const ingredientsToSave = ingredients.map(ing => ({
            fdc_id: ing.fdcId || null,
            ingredient_name: ing.name,
            quantity: ing.quantity,
            unit_id: ing.unitId ? db.collection('units').doc(ing.unitId) : null,
            unit_label: ing.unitId ? (unitsMap.get(ing.unitId) || 'N/A') : 'N/A',
            food_type_id: ing.foodTypeId ? db.collection('foodTypes').doc(ing.foodTypeId) : null,
            food_type_label: ing.foodTypeId ? (foodTypesMap.get(ing.foodTypeId) || 'N/A') : 'N/A'
        }));

        const uniqueFoodTypeLabels = [...new Set(ingredientsToSave.map(ing => ing.food_type_label).filter(Boolean))];

        const categoryRef = categoryId ? db.collection('categories').doc(categoryId) : null;
        const difficultyRef = difficultyId ? db.collection('difficulties').doc(difficultyId) : null;
        const timeRef = timeId ? db.collection('times').doc(timeId) : null;
        const userRef = userId ? db.collection('users').doc(userId) : null;

        console.log('BACKEND - createRecipe: userRef ID (referência para salvar):', userRef ? userRef.id : 'Nulo');

        const newRecipeData = {
            recipe_name: recipeName,
            description: description,
            photo: photoUrl,
            
            user_id: userRef,
            category_id: categoryRef,
            category_label: categoryDoc && categoryDoc.exists ? categoryDoc.data().label : 'Não definida',
            
            difficulty_id: difficultyRef,
            difficulty_label: difficultyDoc && difficultyDoc.exists ? difficultyDoc.data().label : 'Não definida',
            
            time_id: timeRef,
            time_label: timeDoc && timeDoc.exists ? timeDoc.data().label : 'Não definido',
            
            preparation_mode: preparationSteps,
            ingredients: ingredientsToSave,
            ingredient_food_type: uniqueFoodTypeLabels,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('recipes').add(newRecipeData);

        console.log(`[createRecipe] Receita criada com sucesso. ID: ${docRef.id}`);
        console.log('BACKEND - createRecipe: user_id salvo na receita:', newRecipeData.user_id ? newRecipeData.user_id.id : 'Nulo');

        res.status(201).send({
            message: 'Receita criada com sucesso!',
            recipeId: docRef.id
        });

    } catch (error) {
        console.error('[createRecipe] Erro ao criar receita:', error);
        res.status(500).send({ message: 'Erro interno do servidor ao criar receita.' });
    } finally {
        console.log('--- END: createRecipe ---\n');
    }
}

// --- Função para atualizar uma receita existente ---
async function updateRecipe(req, res) {
    console.log('\n--- CALL: updateRecipe ---');
    try {
        const recipeId = req.params.id;
        console.log('BACKEND - updateRecipe: Conteúdo completo do req.body:', JSON.stringify(req.body, null, 2));

        const {
            recipeName, description, photoUrl, userId,
            categoryId, difficultyId, timeId, preparationSteps, ingredients
        } = req.body;

        console.log('BACKEND - updateRecipe: userId recebido no req.body:', userId);

        if (!recipeId || !ingredients || !Array.isArray(ingredients)) {
            console.error('[updateRecipe] ID da receita ou dados de ingrediente ausentes para atualização.');
            return res.status(400).send({ message: 'ID da receita ou dados de ingrediente ausentes para atualização.' });
        }
        for (const ingredient of ingredients) {
            if (!ingredient.name || typeof ingredient.quantity !== 'number' || !ingredient.unitId || !ingredient.foodTypeId) {
                console.error('[updateRecipe] Estrutura de ingrediente inválida:', ingredient);
                return res.status(400).send({ message: 'Estrutura de ingrediente inválida.' });
            }
        }

        const [
            categoryDoc,
            difficultyDoc,
            timeDoc,
            userDoc,
            allUnitsSnapshot,
            allFoodTypesSnapshot
        ] = await Promise.all([
            categoryId ? db.collection('categories').doc(categoryId).get() : Promise.resolve(null),
            difficultyId ? db.collection('difficulties').doc(difficultyId).get() : Promise.resolve(null),
            timeId ? db.collection('times').doc(timeId).get() : Promise.resolve(null),
            userId ? db.collection('users').doc(userId).get() : Promise.resolve(null),
            db.collection('units').get(),
            db.collection('foodTypes').get()
        ]);

        const unitsMap = new Map();
        allUnitsSnapshot.forEach(doc => unitsMap.set(doc.id, doc.data().label));
        const foodTypesMap = new Map();
        allFoodTypesSnapshot.forEach(doc => foodTypesMap.set(doc.id, doc.data().label));

        const ingredientsToSave = ingredients.map(ing => ({
            fdc_id: ing.fdcId || null,
            ingredient_name: ing.name,
            quantity: ing.quantity,
            unit_id: ing.unitId ? db.collection('units').doc(ing.unitId) : null,
            unit_label: ing.unitId ? (unitsMap.get(ing.unitId) || 'N/A') : 'N/A',
            food_type_id: ing.foodTypeId ? db.collection('foodTypes').doc(ing.foodTypeId) : null,
            food_type_label: ing.foodTypeId ? (foodTypesMap.get(ing.foodTypeId) || 'N/A') : 'N/A'
        }));

        const uniqueFoodTypeLabels = [...new Set(ingredientsToSave.map(ing => ing.food_type_label).filter(Boolean))];

        const categoryRef = categoryId ? db.collection('categories').doc(categoryId) : null;
        const difficultyRef = difficultyId ? db.collection('difficulties').doc(difficultyId) : null;
        const timeRef = timeId ? db.collection('times').doc(timeId) : null;
        const userRef = userId ? db.collection('users').doc(userId) : null;

        console.log('BACKEND - updateRecipe: userRef ID (referência para salvar):', userRef ? userRef.id : 'Nulo');

        const updatedRecipeData = {
            recipe_name: recipeName,
            description: description,
            photo: photoUrl,
            
            user_id: userRef,
            category_id: categoryRef,
            category_label: categoryDoc && categoryDoc.exists ? categoryDoc.data().label : 'Não definida',
            
            difficulty_id: difficultyRef,
            difficulty_label: difficultyDoc && difficultyDoc.exists ? difficultyDoc.data().label : 'Não definida',
            
            time_id: timeRef,
            time_label: timeDoc && timeDoc.exists ? timeDoc.data().label : 'Não definido',
            
            preparation_mode: preparationSteps,
            ingredients: ingredientsToSave,
            ingredient_food_type: uniqueFoodTypeLabels,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('recipes').doc(recipeId).update(updatedRecipeData);

        console.log(`[updateRecipe] Receita ${recipeId} atualizada com sucesso.`);
        console.log('BACKEND - updateRecipe: user_id salvo na receita:', updatedRecipeData.user_id ? updatedRecipeData.user_id.id : 'Nulo');

        res.status(200).send({ message: 'Receita atualizada com sucesso!' });

    } catch (error) {
        console.error('[updateRecipe] Erro ao atualizar receita:', error);
        res.status(500).send({ message: 'Erro interno do servidor ao atualizar receita.' });
    } finally {
        console.log('--- END: updateRecipe ---\n');
    }
}

// --- Função para listar receitas (com filtros opcionais) ---
async function listRecipes(req, res) {
    console.log('\n--- CALL: listRecipes ---');
    try {
        const { foodType, categoryId, userId, ...otherFilters } = req.query;

        let queryRef = db.collection('recipes');

        if (foodType) {
            queryRef = queryRef.where('ingredient_food_type', 'array-contains', foodType);
        }
        
        if (categoryId) {
            queryRef = queryRef.where('category_id', '==', db.collection('categories').doc(categoryId));
        }
        
        if (userId) {
            queryRef = queryRef.where('user_id', '==', db.collection('users').doc(userId));
        }

        const recipesSnapshot = await queryRef.get();

        const recipes = [];
        for (const doc of recipesSnapshot.docs) {
            const data = doc.data();

            let userName = 'Desconhecido';
            if (data.user_id && data.user_id.get) { 
                try {
                    const userDoc = await data.user_id.get();
                    if (userDoc.exists) {
                        userName = userDoc.data().user_name || userDoc.data().displayName || userDoc.data().email;
                        console.log(`[listRecipes] Nome de usuário na lista para receita ${doc.id}:`, userName);
                    }
                } catch (userError) {
                    console.error(`Erro ao buscar nome de usuário para ID ${data.user_id.id}:`, userError);
                }
            }

            recipes.push({
                id: doc.id,
                recipeName: data.recipe_name || 'Sem Nome',
                photoUrl: data.photo || 'assets/placeholder.png',
                description: data.description || '',
                
                categoryId: data.category_id ? data.category_id.id : null,
                difficultyId: data.difficulty_id ? data.difficulty_id.id : null,
                timeId: data.time_id ? data.time_id.id : null,
                userId: data.user_id ? data.user_id.id : null,
                
                categoryLabel: data.category_label || 'Não definida',
                difficultyLabel: data.difficulty_label || 'Não definida',
                timeLabel: data.time_label || 'Não definido',
                userName: userName
            });
        }
        console.log(`[listRecipes] Retornando ${recipes.length} receitas.`);
        res.status(200).send(recipes);

    } catch (error) {
        console.error('[listRecipes] Erro ao listar receitas:', error);
        res.status(500).send({ message: 'Erro interno do servidor.' });
    } finally {
        console.log('--- END: listRecipes ---\n');
    }
}

// --- Função para deletar uma receita ---
async function deleteRecipe(req, res) {
    console.log('\n--- CALL: deleteRecipe ---');
    try {
        const recipeId = req.params.id;
        console.log('BACKEND - deleteRecipe: Tentando deletar receita com ID:', recipeId);

        if (!recipeId || typeof recipeId !== 'string' || recipeId.trim() === '') {
            console.error('[deleteRecipe] ID da receita inválido ou vazio recebido para deleção:', recipeId);
            return res.status(400).send({ message: 'ID da receita inválido para deleção.' });
        }

        const recipeDocRef = db.collection('recipes').doc(recipeId);
        const recipeDoc = await recipeDocRef.get();

        if (!recipeDoc.exists) {
            console.log(`[deleteRecipe] Receita com ID ${recipeId} não encontrada para deleção.`);
            return res.status(404).send({ message: 'Receita não encontrada para deleção.' });
        }

        await recipeDocRef.delete();
        console.log(`[deleteRecipe] Receita ${recipeId} deletada com sucesso.`);
        res.status(200).send({ message: 'Receita deletada com sucesso!' });

    } catch (error) {
        console.error('[deleteRecipe] Erro ao deletar receita:', error);
        res.status(500).send({ message: 'Erro interno do servidor ao deletar receita.' });
    } finally {
        console.log('--- END: deleteRecipe ---\n');
    }
}

// --- Exporta as funções do controlador ---
module.exports = {
    getRecipeById,
    createRecipe,
    updateRecipe,
    listRecipes,
    deleteRecipe, // <<<<< CORREÇÃO: Certifique-se de que deleteRecipe está exportado
};