import mongoose, { Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Recipe, RecipeInterface } from '../items/recipe.js'; 
import { User, UserInterface } from '../items/user.js'; 

const testUsersData = [
	{ username: 'ChefElenaES', email: 'elena.sanchez@test.com', country: 'Spain', bio: 'Especialista en tapas y arroces.' },
	{ username: 'ItalianoCucina', email: 'marco.rossi@test.com', country: 'Italy', bio: 'La verdadera cocina del sur de Italia.' },
	{ username: 'FrenchBakeMaster', email: 'sophie.legrand@test.com', country: 'France', bio: 'Panadería y repostería clásica.' },
	{ username: 'NordicFeast', email: 'johan.andersson@test.com', country: 'Sweden', bio: 'Platos sencillos y frescos del norte.' },
	{ username: 'GermanKitchen', email: 'hanna.schmidt@test.com', country: 'Germany', bio: 'Guías completas para platos abundantes.' },

	{ username: 'TiaMariaMX', email: 'maria.gomez@test.com', country: 'Mexico', bio: 'Auténtico sabor mexicano. ¡Picante!' },
	{ username: 'BrazilGourmet', email: 'rafael.silva@test.com', country: 'Brazil', bio: 'Feijoada, moqueca y más delicias.' },
	{ username: 'NYC_Foodie', email: 'chris.peters@test.com', country: 'USA', bio: 'Comida callejera y comfort food americano.' },
	{ username: 'AndeanCooking', email: 'pilar.lopez@test.com', country: 'Peru', bio: 'Ceviches, papas y ajíes inolvidables.' },
	{ username: 'CanadianPantry', email: 'alex.fortin@test.com', country: 'Canada', bio: 'Jarabe de arce y todo lo que lo acompaña.' },

	{ username: 'TokyoTable', email: 'kenji.tanaka@test.com', country: 'Japan', bio: 'Recetas de sushi y ramen originales.' },
	{ username: 'SpicyIndia', email: 'priya.singh@test.com', country: 'India', bio: 'Secretos del curry y el tandoor.' },
	{ username: 'KoreanEats', email: 'jiwoo.kim@test.com', country: 'South Korea', bio: 'Kimchi casero y barbacoa coreana.' },
	{ username: 'ThaiChefNom', email: 'chompoo.sri@test.com', country: 'Thailand', bio: 'El balance perfecto de dulce, agrio y picante.' },
	{ username: 'VietnamFoodTour', email: 'linh.nguyen@test.com', country: 'Vietnam', bio: 'Pho, rolls y la frescura de Hanoi.' },
	
	{ username: 'AussieGrill', email: 'jack.o_connor@test.com', country: 'Australia', bio: 'Todo lo que puedes hacer en la barbacoa.' },
	{ username: 'CapeTownSpice', email: 'zola.mabuza@test.com', country: 'South Africa', bio: 'Biltong y cocina tradicional africana.' },
	{ username: 'MoroccanTagine', email: 'fatima.elali@test.com', country: 'Morocco', bio: 'Secretos de las especias y el cuscús.' },
	{ username: 'EgyptianDesserts', email: 'ahmed.hassan@test.com', country: 'Egypt', bio: 'Postres dulces y bebidas tradicionales.' },
	{ username: 'KiwiCook', email: 'emma.brown@test.com', country: 'New Zealand', bio: 'Cocina de granja y platos modernos.' },
].map(user => ({...user, password: 'Password123!', followers: [], following: [], recentSearches: [] })); 

const VALID_TOOLS = [ 'cuchillo', 'tabla de cortar', 'sartén', 'olla', 'horno', 'batidora' ];
const VALID_CATEGORIES = [ 'entrante', 'plato principal', 'postre', 'bebida', 'panadería', 'carne', 'vegetariano', 'salsa o aderezo' ];
const VALID_INGREDIENTS = [ 'harina', 'azucar', 'sal', 'huevo', 'leche', 'mantequilla', 'aceite', 'chocolate', 'carne', 'pescado', 'especias' ];

const defaultRecipesData: (Partial<RecipeInterface> & { tempAuthor: string })[] = [
	{ name: "Gazpacho Andaluz", steps: "Triturar tomates, pepino, pimiento, pan, aceite y vinagre. Servir frío.", tools: [VALID_TOOLS[0], VALID_TOOLS[5]], category: [VALID_CATEGORIES[0], VALID_CATEGORIES[7], VALID_CATEGORIES[3]], images: ["https://www.cocinista.es/download/bancorecursos/recetas/gazpacho.jpg"], tempAuthor: 'ChefElenaES', ingredients: [{ ingredient: VALID_INGREDIENTS[6], quantity: '100ml' }, { ingredient: VALID_INGREDIENTS[2], quantity: '1 pizca' }] as any },
	{ name: "Pasta Cacio e Pepe", steps: "Hervir pasta. Mezclar queso Pecorino y pimienta con agua de cocción para crear salsa.", tools: [VALID_TOOLS[3]], category: [VALID_CATEGORIES[1], 'pasta'], images: ["https://i.blogs.es/5079bf/pasta_caccio_e_pepe/450_1000.jpeg"], tempAuthor: 'ItalianoCucina', ingredients: [{ ingredient: VALID_INGREDIENTS[6], quantity: '50ml' }, { ingredient: VALID_INGREDIENTS[2], quantity: '1 pizca' }] as any },
	{ name: "Croissant Casero", steps: "Preparar masa de hojaldre, doblar con mantequilla y hornear.", tools: [VALID_TOOLS[4]], category: [VALID_CATEGORIES[2], VALID_CATEGORIES[4]], images: ["https://www.paulinacocina.net/wp-content/uploads/2023/12/croissant-de-mantequilla-paulina-cocina-recetas-800x450.jpg"], tempAuthor: 'FrenchBakeMaster', ingredients: [{ ingredient: VALID_INGREDIENTS[0], quantity: '500g' }, { ingredient: VALID_INGREDIENTS[5], quantity: '250g' }] as any },
	{ name: "Salmón con Eneldo", steps: "Marinar el salmón en eneldo y limón. Asar a la parrilla o al horno.", tools: [VALID_TOOLS[4]], category: [VALID_CATEGORIES[1], 'pescado'], images: ["https://images.cookforyourlife.org/wp-content/uploads/2015/08/shutterstock_124385689-salmon-with-yogurt-dill-sauce.jpg"], tempAuthor: 'NordicFeast', ingredients: [{ ingredient: VALID_INGREDIENTS[9], quantity: '200g' }, { ingredient: VALID_INGREDIENTS[2], quantity: '1 pizca' }] as any },
	{ name: "Sauerbraten (Estofado)", steps: "Marinar la carne por varios días, luego estofar lentamente.", tools: [VALID_TOOLS[3]], category: [VALID_CATEGORIES[1], VALID_CATEGORIES[5]], images: ["https://www.expogourmetmagazine.com/uploads/fotos_noticias/2025/08/w1200px_30056-241546-recetas-del-mundo-alemania-sauerbraten.jpg"], tempAuthor: 'GermanKitchen', ingredients: [{ ingredient: VALID_INGREDIENTS[8], quantity: '1kg' }, { ingredient: VALID_INGREDIENTS[6], quantity: '30ml' }] as any },
	
	{ name: "Mole Poblano", steps: "Hacer una pasta de chiles y especias. Cocinar el pollo en la salsa.", tools: [VALID_TOOLS[5], VALID_TOOLS[3]], category: [VALID_CATEGORIES[1], VALID_CATEGORIES[5]], images: ["https://media.elgourmet.com/recetas/cover/mole-_9IMJjkql3RCWT1eg6AHUD8PKyZLh7o.png"], tempAuthor: 'TiaMariaMX', ingredients: [{ ingredient: VALID_INGREDIENTS[9], quantity: '500g' }, { ingredient: VALID_INGREDIENTS[8], quantity: '50g' }] as any },
	{ name: "Pão de Queijo", steps: "Mezclar almidón de yuca, huevos y queso. Hornear pequeñas bolitas.", tools: [VALID_TOOLS[4]], category: [VALID_CATEGORIES[0], VALID_CATEGORIES[4]], images: ["https://essareceitafunciona.com.br/wp-content/uploads/2022/07/Pao-de-queijo-Essa-Receita-Funciona-9.jpg"], tempAuthor: 'BrazilGourmet', ingredients: [{ ingredient: VALID_INGREDIENTS[3], quantity: '2 uds' }, { ingredient: VALID_INGREDIENTS[4], quantity: '100ml' }] as any },
	{ name: "New York Cheesecake", steps: "Base de galleta, relleno de queso crema y cocción lenta al horno.", tools: [VALID_TOOLS[4]], category: [VALID_CATEGORIES[2]], images: ["https://www.marthastewart.com/thmb/m6R1D2iuHvVxM8u7RJz7c-Us8Rg=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/MSL-865202-new-york-cheesecake-hero-horiz-0723-84e3c796119d408581d1ef4d02d801cd.jpg"], tempAuthor: 'NYC_Foodie', ingredients: [{ ingredient: VALID_INGREDIENTS[1], quantity: '200g' }, { ingredient: VALID_INGREDIENTS[3], quantity: '3 uds' }] as any },
	{ name: "Aji de Gallina", steps: "Deshilachar pollo, cocinar en salsa cremosa de ají amarillo y pan.", tools: [VALID_TOOLS[3], VALID_TOOLS[5]], category: [VALID_CATEGORIES[1], VALID_CATEGORIES[5]], images: ["https://gourmet.iprospect.cl/wp-content/uploads/2016/09/Aji-gallina.jpg"], tempAuthor: 'AndeanCooking', ingredients: [{ ingredient: VALID_INGREDIENTS[4], quantity: '250ml' }, { ingredient: VALID_INGREDIENTS[5], quantity: '50g' }] as any },
	{ name: "Poutine Clásico", steps: "Papas fritas, queso en grano y salsa gravy caliente.", tools: [VALID_TOOLS[2]], category: [VALID_CATEGORIES[1]], images: ["https://images.squarespace-cdn.com/content/v1/5ddc443433045549210a7d72/1592873776132-Z8SHJFBMXYHJIJVFIGZ7/FB_IMG_1592873004182.jpg"], tempAuthor: 'CanadianPantry', ingredients: [{ ingredient: VALID_INGREDIENTS[6], quantity: '150ml' }, { ingredient: VALID_INGREDIENTS[2], quantity: '1 pizca' }] as any },
	
	{ name: "Tonkotsu Ramen", steps: "Preparar un caldo de huesos de cerdo por horas. Añadir fideos y toppings.", tools: [VALID_TOOLS[3]], category: [VALID_CATEGORIES[1]], images: ["https://www.mizkanchef.com/wp-content/uploads/2020/09/ramen-tonkotsu-scaled.jpg"], tempAuthor: 'TokyoTable', ingredients: [{ ingredient: VALID_INGREDIENTS[4], quantity: '50ml' }, { ingredient: VALID_INGREDIENTS[2], quantity: '1 pizca' }] as any },
	{ name: "Pollo Tandoori", steps: "Marinar el pollo en yogur y especias. Hornear o asar a alta temperatura.", tools: [VALID_TOOLS[4]], category: [VALID_CATEGORIES[1], VALID_CATEGORIES[5]], images: ["https://www.hola.com/horizon/landscape/502fd41afbe1-portada-tandoori-adobe-t.jpg"], tempAuthor: 'SpicyIndia', ingredients: [{ ingredient: VALID_INGREDIENTS[10], quantity: '20g' }, { ingredient: VALID_INGREDIENTS[8], quantity: '400g' }] as any },
	{ name: "Kimchi Jjigae", steps: "Estofado de kimchi, tofu y carne de cerdo en caldo picante.", tools: [VALID_TOOLS[3]], category: [VALID_CATEGORIES[1], VALID_CATEGORIES[5]], images: ["https://www.maangchi.com/wp-content/uploads/2007/11/kimchijjigae.jpg"], tempAuthor: 'KoreanEats', ingredients: [{ ingredient: VALID_INGREDIENTS[11], quantity: '200g' }, { ingredient: VALID_INGREDIENTS[6], quantity: '30ml' }] as any },
	{ name: "Pad Thai", steps: "Saltear fideos de arroz con camarones, tofu y salsa de tamarindo.", tools: [VALID_TOOLS[2]], category: [VALID_CATEGORIES[1]], images: ["https://www.seriouseats.com/thmb/gLZ3ZlKXVTGpgspZvvS8Afnw2TA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/20250214-SEA-PadThai-AmandaSuarez-hero-4251c730d61a40ba935f2d43153d6862.jpg"], tempAuthor: 'ThaiChefNom', ingredients: [{ ingredient: VALID_INGREDIENTS[9], quantity: '150g' }, { ingredient: VALID_INGREDIENTS[6], quantity: '30ml' }] as any },
	{ name: "Rollitos de Primavera", steps: "Rellenar papel de arroz con verduras y camarones. Servir con salsa.", tools: [VALID_TOOLS[0]], category: [VALID_CATEGORIES[0]], images: ["https://content-cocina.lecturas.com/medio/2022/03/03/rollitos-de-primavera-con-carne-y-salsa-de-soja_00000000_240402112349_1200x1200.jpg"], tempAuthor: 'VietnamFoodTour', ingredients: [{ ingredient: VALID_INGREDIENTS[9], quantity: '100g' }, { ingredient: VALID_INGREDIENTS[11], quantity: '200g' }] as any },

	{ name: "Lamingtons", steps: "Bizcocho bañado en salsa de chocolate y cubierto con coco rallado.", tools: [VALID_TOOLS[4]], category: [VALID_CATEGORIES[2]], images: ["https://thescranline.com/wp-content/uploads/2024/03/LAMINGTONS-S-02.jpg"], tempAuthor: 'AussieGrill', ingredients: [{ ingredient: VALID_INGREDIENTS[8], quantity: '100g' }, { ingredient: VALID_INGREDIENTS[1], quantity: '150g' }] as any },
	{ name: "Biltong Casero", steps: "Carne curada y sazonada (proceso de secado).", tools: [VALID_TOOLS[0]], category: [VALID_CATEGORIES[0], VALID_CATEGORIES[5]], images: ["https://comerbeber.com/archivos/imagen/2023/11/biltong-cv_1200.jpg"], tempAuthor: 'CapeTownSpice', ingredients: [{ ingredient: VALID_INGREDIENTS[5], quantity: '20g' }, { ingredient: VALID_INGREDIENTS[8], quantity: '500g' }] as any },
	{ name: "Tajín de Pollo con Limón", steps: "Estofar pollo, aceitunas y limón en un tajín (o cazuela).", tools: [VALID_TOOLS[3]], category: [VALID_CATEGORIES[1], VALID_CATEGORIES[5]], images: ["https://i.ytimg.com/vi/gSVzjMj8KQM/maxresdefault.jpg"], tempAuthor: 'MoroccanTagine', ingredients: [{ ingredient: VALID_INGREDIENTS[6], quantity: '50ml' }, { ingredient: VALID_INGREDIENTS[10], quantity: '2 uds' }] as any },
	{ name: "Umm Ali", steps: "Postre de hojaldre, leche, frutos secos y especias.", tools: [VALID_TOOLS[4]], category: [VALID_CATEGORIES[2]], images: ["https://aboalirestaurants.com/wp-content/uploads/2024/02/1-Umm-Ali-45-AED.jpg"], tempAuthor: 'EgyptianDesserts', ingredients: [{ ingredient: VALID_INGREDIENTS[4], quantity: '400ml' }, { ingredient: VALID_INGREDIENTS[1], quantity: '50g' }] as any },
	{ name: "Hāngi (Plato Tradicional)", steps: "Carne y verduras cocinadas lentamente en un horno de tierra.", tools: [VALID_TOOLS[0]], category: [VALID_CATEGORIES[1], VALID_CATEGORIES[5]], images: ["https://supervalue.imgix.net/assets/recipes/iStock-516816688.jpg"], tempAuthor: 'KiwiCook', ingredients: [{ ingredient: VALID_INGREDIENTS[8], quantity: '1kg' }, { ingredient: VALID_INGREDIENTS[11], quantity: '500g' }] as any },
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
				const hashedPassword = await bcrypt.hash(userData.password, 8);
				const newUser = await User.create({...userData, password: hashedPassword});
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