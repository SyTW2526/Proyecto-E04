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
  createdAt: Date;
}