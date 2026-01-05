import mongoose, { Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Recipe, RecipeInterface } from '../items/recipe.js'; 
import { User } from '../items/user.js'; 

const testUsersData = [
	{ _id: new mongoose.Types.ObjectId("000000000000000000000001"), username: 'ChefElenaES', email: 'elena.sanchez@test.com', bio: 'Especialista en tapas y arroces.' },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000002"), username: 'ItalianoCucina', email: 'marco.rossi@test.com', bio: 'La verdadera cocina del sur de Italia.' },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000003"), username: 'FrenchBakeMaster', email: 'sophie.legrand@test.com', bio: 'Panadería y repostería clásica.' },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000004"), username: 'NordicFeast', email: 'johan.andersson@test.com', bio: 'Platos sencillos y frescos del norte.' },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000005"), username: 'GermanKitchen', email: 'hanna.schmidt@test.com', bio: 'Guías completas para platos abundantes.' },

	{ _id: new mongoose.Types.ObjectId("000000000000000000000006"), username: 'TiaMariaMX', email: 'maria.gomez@test.com', bio: 'Auténtico sabor mexicano. ¡Picante!' },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000007"), username: 'BrazilGourmet', email: 'rafael.silva@test.com', bio: 'Feijoada, moqueca y más delicias.' },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000008"), username: 'NYC_Foodie', email: 'chris.peters@test.com', bio: 'Comida callejera y comfort food americano.' },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000009"), username: 'AndeanCooking', email: 'pilar.lopez@test.com', bio: 'Ceviches, papas y ajíes inolvidables.' },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000010"), username: 'CanadianPantry', email: 'alex.fortin@test.com', bio: 'Jarabe de arce y todo lo que lo acompaña.' },

	{ _id: new mongoose.Types.ObjectId("000000000000000000000011"), username: 'TokyoTable', email: 'kenji.tanaka@test.com', bio: 'Recetas de sushi y ramen originales.' },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000012"), username: 'SpicyIndia', email: 'priya.singh@test.com', bio: 'Secretos del curry y el tandoor.' },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000013"), username: 'KoreanEats', email: 'jiwoo.kim@test.com', bio: 'Kimchi casero y barbacoa coreana.' },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000014"), username: 'ThaiChefNom', email: 'chompoo.sri@test.com', bio: 'El balance perfecto de dulce, agrio y picante.' },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000015"), username: 'VietnamFoodTour', email: 'linh.nguyen@test.com', bio: 'Pho, rolls y la frescura de Hanoi.' },
	
	{ _id: new mongoose.Types.ObjectId("000000000000000000000016"), username: 'AussieGrill', email: 'jack.o_connor@test.com', bio: 'Todo lo que puedes hacer en la barbacoa.' },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000017"), username: 'CapeTownSpice', email: 'zola.mabuza@test.com', bio: 'Biltong y cocina tradicional africana.' },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000018"), username: 'MoroccanTagine', email: 'fatima.elali@test.com', bio: 'Secretos de las especias y el cuscús.' },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000019"), username: 'EgyptianDesserts', email: 'ahmed.hassan@test.com', bio: 'Postres dulces y bebidas tradicionales.' },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000020"), username: 'KiwiCook', email: 'emma.brown@test.com', bio: 'Cocina de granja y platos modernos.' },
].map(user => ({...user, password: 'Password123!', followers: [], following: [], recentSearches: [] })); 

const VALID_TOOLS = [ 'cuchillo', 'tabla de cortar', 'sartén', 'olla', 'horno', 'batidora' ];
const VALID_CATEGORIES = [ 'entrante', 'plato principal', 'postre', 'bebida', 'panadería', 'carne', 'vegetariano', 'salsa o aderezo' ];
const VALID_INGREDIENTS = [ 'harina', 'azucar', 'sal', 'huevo', 'leche', 'mantequilla', 'aceite', 'levadura', 'chocolate', 'vainilla', 'frutas', 'verduras', 'carne', 'pescado', 'especias' ];

const defaultRecipesData = [
	{ _id: new mongoose.Types.ObjectId("000000000000000000000021"), name: "Gazpacho Andaluz", steps: "Triturar tomates, pepino, pimiento, pan, aceite y vinagre. Servir frío.", tools: [VALID_TOOLS[0], VALID_TOOLS[5]], category: [VALID_CATEGORIES[0], VALID_CATEGORIES[7], VALID_CATEGORIES[3]], images: ["default/images/gazpacho.jpg"], tempAuthor: 'ChefElenaES', ingredients: [{ ingredient: VALID_INGREDIENTS[6], quantity: '100ml' }, { ingredient: VALID_INGREDIENTS[2], quantity: '1 pizca' }] as any },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000022"), name: "Pasta Cacio e Pepe", steps: "Hervir pasta. Mezclar queso Pecorino y pimienta con agua de cocción para crear salsa.", tools: [VALID_TOOLS[3]], category: [VALID_CATEGORIES[1], 'pasta'], images: ["default/images/Pasta.jpeg"], tempAuthor: 'ItalianoCucina', ingredients: [{ ingredient: VALID_INGREDIENTS[6], quantity: '50ml' }, { ingredient: VALID_INGREDIENTS[2], quantity: '1 pizca' }] as any },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000023"), name: "Croissant Casero", steps: "Preparar masa de hojaldre, doblar con mantequilla y hornear.", tools: [VALID_TOOLS[4]], category: [VALID_CATEGORIES[2], VALID_CATEGORIES[4]], images: ["default/images/Croissant.webp"], tempAuthor: 'FrenchBakeMaster', ingredients: [{ ingredient: VALID_INGREDIENTS[0], quantity: '500g' }, { ingredient: VALID_INGREDIENTS[5], quantity: '250g' }] as any },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000024"), name: "Salmón con Eneldo", steps: "Marinar el salmón en eneldo y limón. Asar a la parrilla o al horno.", tools: [VALID_TOOLS[4]], category: [VALID_CATEGORIES[1], 'pescado'], images: ["default/images/Salmon.jpg"], tempAuthor: 'NordicFeast', ingredients: [{ ingredient: VALID_INGREDIENTS[9], quantity: '200g' }, { ingredient: VALID_INGREDIENTS[2], quantity: '1 pizca' }] as any },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000025"), name: "Sauerbraten (Estofado)", steps: "Marinar la carne por varios días, luego estofar lentamente.", tools: [VALID_TOOLS[3]], category: [VALID_CATEGORIES[1], VALID_CATEGORIES[5]], images: ["default/images/Carne.jpg"], tempAuthor: 'GermanKitchen', ingredients: [{ ingredient: VALID_INGREDIENTS[8], quantity: '1kg' }, { ingredient: VALID_INGREDIENTS[6], quantity: '30ml' }] as any },
	
	{ _id: new mongoose.Types.ObjectId("000000000000000000000026"), name: "Mole Poblano", steps: "Hacer una pasta de chiles y especias. Cocinar el pollo en la salsa.", tools: [VALID_TOOLS[5], VALID_TOOLS[3]], category: [VALID_CATEGORIES[1], VALID_CATEGORIES[5]], images: ["default/images/Curry.jpg"], tempAuthor: 'TiaMariaMX', ingredients: [{ ingredient: VALID_INGREDIENTS[9], quantity: '500g' }, { ingredient: VALID_INGREDIENTS[8], quantity: '50g' }] as any },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000027"), name: "Pão de Queijo", steps: "Mezclar almidón de yuca, huevos y queso. Hornear pequeñas bolitas.", tools: [VALID_TOOLS[4]], category: [VALID_CATEGORIES[0], VALID_CATEGORIES[4]], images: ["default/images/Pao.jpg"], tempAuthor: 'BrazilGourmet', ingredients: [{ ingredient: VALID_INGREDIENTS[3], quantity: '2 uds' }, { ingredient: VALID_INGREDIENTS[4], quantity: '100ml' }] as any },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000028"), name: "New York Cheesecake", steps: "Base de galleta, relleno de queso crema y cocción lenta al horno.", tools: [VALID_TOOLS[4]], category: [VALID_CATEGORIES[2]], images: ["default/images/TartaQueso.jpg"], tempAuthor: 'NYC_Foodie', ingredients: [{ ingredient: VALID_INGREDIENTS[1], quantity: '200g' }, { ingredient: VALID_INGREDIENTS[3], quantity: '3 uds' }] as any },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000029"), name: "Aji de Gallina", steps: "Deshilachar pollo, cocinar en salsa cremosa de ají amarillo y pan.", tools: [VALID_TOOLS[3], VALID_TOOLS[5]], category: [VALID_CATEGORIES[1], VALID_CATEGORIES[5]], images: ["default/images/Aji.jpg"], tempAuthor: 'AndeanCooking', ingredients: [{ ingredient: VALID_INGREDIENTS[4], quantity: '250ml' }, { ingredient: VALID_INGREDIENTS[5], quantity: '50g' }] as any },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000030"), name: "Poutine Clásico", steps: "Papas fritas, queso en grano y salsa gravy caliente.", tools: [VALID_TOOLS[2]], category: [VALID_CATEGORIES[1]], images: ["default/images/Papas.webp"], tempAuthor: 'CanadianPantry', ingredients: [{ ingredient: VALID_INGREDIENTS[6], quantity: '150ml' }, { ingredient: VALID_INGREDIENTS[2], quantity: '1 pizca' }] as any },
	
	{ _id: new mongoose.Types.ObjectId("000000000000000000000031"), name: "Tonkotsu Ramen", steps: "Preparar un caldo de huesos de cerdo por horas. Añadir fideos y toppings.", tools: [VALID_TOOLS[3]], category: [VALID_CATEGORIES[1]], images: ["default/images/Ramen.jpg"], tempAuthor: 'TokyoTable', ingredients: [{ ingredient: VALID_INGREDIENTS[4], quantity: '50ml' }, { ingredient: VALID_INGREDIENTS[2], quantity: '1 pizca' }] as any },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000032"), name: "Pollo Tandoori", steps: "Marinar el pollo en yogur y especias. Hornear o asar a alta temperatura.", tools: [VALID_TOOLS[4]], category: [VALID_CATEGORIES[1], VALID_CATEGORIES[5]], images: ["default/images/Pollo.avif"], tempAuthor: 'SpicyIndia', ingredients: [{ ingredient: VALID_INGREDIENTS[10], quantity: '20g' }, { ingredient: VALID_INGREDIENTS[8], quantity: '400g' }] as any },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000033"), name: "Kimchi Jjigae", steps: "Estofado de kimchi, tofu y carne de cerdo en caldo picante.", tools: [VALID_TOOLS[3]], category: [VALID_CATEGORIES[1], VALID_CATEGORIES[5]], images: ["default/images/Kimchi.jpg"], tempAuthor: 'KoreanEats', ingredients: [{ ingredient: VALID_INGREDIENTS[11], quantity: '200g' }, { ingredient: VALID_INGREDIENTS[6], quantity: '30ml' }] as any },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000034"), name: "Pad Thai", steps: "Saltear fideos de arroz con camarones, tofu y salsa de tamarindo.", tools: [VALID_TOOLS[2]], category: [VALID_CATEGORIES[1]], images: ["default/images/Salteado.jpg"], tempAuthor: 'ThaiChefNom', ingredients: [{ ingredient: VALID_INGREDIENTS[9], quantity: '150g' }, { ingredient: VALID_INGREDIENTS[6], quantity: '30ml' }] as any },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000035"), name: "Rollitos de Primavera", steps: "Rellenar papel de arroz con verduras y camarones. Servir con salsa.", tools: [VALID_TOOLS[0]], category: [VALID_CATEGORIES[0]], images: ["default/images/Rollitos.jpg"], tempAuthor: 'VietnamFoodTour', ingredients: [{ ingredient: VALID_INGREDIENTS[9], quantity: '100g' }, { ingredient: VALID_INGREDIENTS[11], quantity: '200g' }] as any },

	{ _id: new mongoose.Types.ObjectId("000000000000000000000036"), name: "Lamingtons", steps: "Bizcocho bañado en salsa de chocolate y cubierto con coco rallado.", tools: [VALID_TOOLS[4]], category: [VALID_CATEGORIES[2]], images: ["default/images/Lamington.jpg"], tempAuthor: 'AussieGrill', ingredients: [{ ingredient: VALID_INGREDIENTS[8], quantity: '100g' }, { ingredient: VALID_INGREDIENTS[1], quantity: '150g' }] as any },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000037"), name: "Biltong Casero", steps: "Carne curada y sazonada (proceso de secado).", tools: [VALID_TOOLS[0]], category: [VALID_CATEGORIES[0], VALID_CATEGORIES[5]], images: ["default/images/Biltong.jpg"], tempAuthor: 'CapeTownSpice', ingredients: [{ ingredient: VALID_INGREDIENTS[5], quantity: '20g' }, { ingredient: VALID_INGREDIENTS[8], quantity: '500g' }] as any },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000038"), name: "Tajín de Pollo con Limón", steps: "Estofar pollo, aceitunas y limón en un tajín (o cazuela).", tools: [VALID_TOOLS[3]], category: [VALID_CATEGORIES[1], VALID_CATEGORIES[5]], images: ["default/images/PolloLimon.jpg"], tempAuthor: 'MoroccanTagine', ingredients: [{ ingredient: VALID_INGREDIENTS[6], quantity: '50ml' }, { ingredient: VALID_INGREDIENTS[10], quantity: '2 uds' }] as any },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000039"), name: "Umm Ali", steps: "Postre de hojaldre, leche, frutos secos y especias.", tools: [VALID_TOOLS[4]], category: [VALID_CATEGORIES[2]], images: ["default/images/Pastel.jpg"], tempAuthor: 'EgyptianDesserts', ingredients: [{ ingredient: VALID_INGREDIENTS[4], quantity: '400ml' }, { ingredient: VALID_INGREDIENTS[1], quantity: '50g' }] as any },
	{ _id: new mongoose.Types.ObjectId("000000000000000000000040"), name: "Hāngi (Plato Tradicional)", steps: "Carne y verduras cocinadas lentamente en un horno de tierra.", tools: [VALID_TOOLS[0]], category: [VALID_CATEGORIES[1], VALID_CATEGORIES[5]], images: ["default/images/CarneLimon.jpg"], tempAuthor: 'KiwiCook', ingredients: [{ ingredient: VALID_INGREDIENTS[8], quantity: '1kg' }, { ingredient: VALID_INGREDIENTS[11], quantity: '500g' }] as any },
];

/**
 * Función principal para sembrar usuarios y recetas predeterminadas.
 */
export async function seedDefaultRecipes() {
	if (mongoose.connection.readyState !== 1) {
		console.error("Mongoose no está conectado. No se puede sembrar la base de datos.");
		return;
	}

	const userMap = new Map<string, Types.ObjectId>(); 

	try {
		for (const userData of testUsersData) {
			const existingUser = await User.findOne({ email: userData.email });
			
			if (existingUser) {
				userMap.set(userData.username, existingUser._id);
			} else {
				const newUser = await User.create({...userData});
				userMap.set(userData.username, newUser._id);
			}
		}
		
		const firstTestUser = testUsersData[0].username;
		const firstTestUserId = userMap.get(firstTestUser);
		
		if (!firstTestUserId) {
			console.error("Error crítico: No se pudo obtener el ID del usuario de prueba inicial.");
			return;
		}

		const existingRecipe = await Recipe.findOne({ userId: firstTestUserId });
		if (existingRecipe) {
			return;
		}
		const recipesToInsert: Partial<RecipeInterface>[] = []; 
		defaultRecipesData.forEach(recipe => {
		const userId = userMap.get(recipe.tempAuthor); 
			if (userId) {
				recipesToInsert.push({
					_id: recipe._id,
					name: recipe.name,
					steps: recipe.steps,
					ingredients: recipe.ingredients,
					tools: recipe.tools,
					category: recipe.category,
					images: recipe.images,
					userId: userId as unknown as Schema.Types.ObjectId,
					videos: [],
				});
			}
		});
			
		await Recipe.insertMany(recipesToInsert);
		console.log("20 Recetas y usuarios creadas exitosamente.");
	} catch (error) {
		console.error(" Error al sembrar la base de datos:", error);
	}
}