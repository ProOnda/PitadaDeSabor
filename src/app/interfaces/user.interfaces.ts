// src/app/interfaces/user.interfaces.ts

export interface UserData {
  uid: string; // Mantenho a recomendação de que UID seja obrigatório, pois é a chave do documento
  user_name?: string | null; // <<< Adicionado | null
  displayName?: string | null; // <<< Adicionado | null
  email?: string | null; // <<< Adicionado | null
  favoriteRecipeIds?: string[] | null; // <<< Adicionado | null (se puder ser null no Firestore)
  photoURL?: string | null; // <<< Adicionado | null
  // Adicione outras propriedades do seu documento de usuário aqui, se houver
}