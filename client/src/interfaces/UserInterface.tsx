/**
 * Interfaz UserInterface. Información de un usuario.
 */
export interface UserInterface {
  _id: string;
  username: string;
  email: string;
  password?: string;
  profilePic: string; 
  bio: string; 
  followers: string[]; 
  following: string[]; 
  recentSearches: string[];
  saved: string[];
  createdAt: Date;
}