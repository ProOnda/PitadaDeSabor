// src/app/interfaces/user.interfaces.ts

export interface UserData {
  user_name?: string;
  displayName?: string;
  email?: string;
  uid?: string; // Adicionar UID para fácil acesso
  favoriteRecipeIds?: string[]; // Array de IDs de receitas favoritas
  photoURL?: string; // ADICIONADO PARA RESOLVER O ERRO
  // Adicione outras propriedades do seu documento de usuário aqui, se houver
}