export interface Recipe {
    _id: string;
    name: string;
    steps: string;
    ingredients: {ingredient: string, quantity: string}[];
    tools: string[];
    userId: {_id: string, username: string, profilePic:string}; 
    category: string[]; // Pasta, postre, carne, etc. 
    images: string[]; // URLs de imágenes o vídeos 
    videos: string[]; // URLs de vídeos 
    creacionDate: Date;
}