// Verified foods — curated, USDA-accurate macros for the items people log
// most. Each entry is a single sensible serving so users can tap once without
// doing math. These rank ABOVE Open Food Facts results in the search UI.
//
// Source notes: macros pulled from USDA FoodData Central (SR Legacy /
// Foundation Foods) and rounded to user-friendly increments. We optimize for
// "close enough" so people actually log instead of agonizing.
//
// Shape:
//   id (kebab-case, stable)
//   name (canonical display)
//   aliases [] for fuzzy matching ("oj" -> orange juice)
//   category for badges
//   serving { label, grams? }
//   calories, protein, carbs, fats (per the listed serving)
//   meal (best-guess default meal type)

export const VERIFIED_FOODS = [
  // ─────────────────────────────────────────────────────────
  // PROTEIN — animal
  // ─────────────────────────────────────────────────────────
  { id: 'chicken-breast',     name: 'Chicken breast, grilled',  aliases: ['chicken', 'breast'],        category: 'Protein',  serving: { label: '4 oz (113 g)', grams: 113 }, calories: 187, protein: 35, carbs: 0,  fats: 4,  meal: 'dinner' },
  { id: 'chicken-thigh',      name: 'Chicken thigh, grilled',   aliases: ['thigh', 'dark meat'],       category: 'Protein',  serving: { label: '4 oz (113 g)', grams: 113 }, calories: 235, protein: 28, carbs: 0,  fats: 13, meal: 'dinner' },
  { id: 'chicken-wing',       name: 'Chicken wings (4 pcs)',    aliases: ['wings'],                    category: 'Protein',  serving: { label: '4 wings (120 g)', grams: 120 }, calories: 308, protein: 28, carbs: 0,  fats: 21, meal: 'dinner' },
  { id: 'ground-chicken',     name: 'Ground chicken, lean',     aliases: ['minced chicken'],           category: 'Protein',  serving: { label: '4 oz (113 g)', grams: 113 }, calories: 175, protein: 25, carbs: 0,  fats: 8,  meal: 'dinner' },
  { id: 'beef-sirloin',       name: 'Sirloin steak',            aliases: ['steak', 'beef', 'sirloin'], category: 'Protein',  serving: { label: '5 oz (140 g)', grams: 140 }, calories: 271, protein: 39, carbs: 0,  fats: 12, meal: 'dinner' },
  { id: 'beef-ribeye',        name: 'Ribeye steak',             aliases: ['ribeye'],                   category: 'Protein',  serving: { label: '5 oz (140 g)', grams: 140 }, calories: 411, protein: 36, carbs: 0,  fats: 29, meal: 'dinner' },
  { id: 'ground-beef-85',     name: 'Ground beef 85/15',        aliases: ['minced beef', 'hamburger'], category: 'Protein',  serving: { label: '4 oz (113 g)', grams: 113 }, calories: 240, protein: 23, carbs: 0,  fats: 17, meal: 'dinner' },
  { id: 'ground-beef-93',     name: 'Ground beef 93/7 (lean)',  aliases: ['lean beef'],                category: 'Protein',  serving: { label: '4 oz (113 g)', grams: 113 }, calories: 170, protein: 24, carbs: 0,  fats: 8,  meal: 'dinner' },
  { id: 'bacon',              name: 'Bacon (3 strips)',         aliases: [],                           category: 'Protein',  serving: { label: '3 strips (24 g)', grams: 24 }, calories: 130, protein: 9,  carbs: 0,  fats: 10, meal: 'breakfast' },
  { id: 'pork-chop',          name: 'Pork chop',                aliases: [],                           category: 'Protein',  serving: { label: '4 oz (113 g)', grams: 113 }, calories: 218, protein: 31, carbs: 0,  fats: 9,  meal: 'dinner' },
  { id: 'pork-tenderloin',    name: 'Pork tenderloin',          aliases: ['pork loin'],                category: 'Protein',  serving: { label: '4 oz (113 g)', grams: 113 }, calories: 158, protein: 27, carbs: 0,  fats: 5,  meal: 'dinner' },
  { id: 'sausage',            name: 'Pork sausage (1 link)',    aliases: [],                           category: 'Protein',  serving: { label: '1 link (50 g)', grams: 50 }, calories: 170, protein: 9,  carbs: 1,  fats: 15, meal: 'breakfast' },
  { id: 'ham',                name: 'Ham, deli sliced',         aliases: ['deli ham'],                 category: 'Protein',  serving: { label: '3 oz (85 g)', grams: 85 }, calories: 105, protein: 16, carbs: 1,  fats: 4,  meal: 'lunch' },
  { id: 'turkey-breast',      name: 'Turkey breast',            aliases: ['turkey'],                   category: 'Protein',  serving: { label: '4 oz (113 g)', grams: 113 }, calories: 153, protein: 33, carbs: 0,  fats: 1,  meal: 'dinner' },
  { id: 'ground-turkey',      name: 'Ground turkey, lean',      aliases: ['minced turkey'],            category: 'Protein',  serving: { label: '4 oz (113 g)', grams: 113 }, calories: 169, protein: 22, carbs: 0,  fats: 9,  meal: 'dinner' },
  { id: 'turkey-deli',        name: 'Turkey, deli sliced',      aliases: ['deli turkey'],              category: 'Protein',  serving: { label: '3 oz (85 g)', grams: 85 }, calories: 90,  protein: 17, carbs: 2,  fats: 2,  meal: 'lunch' },
  { id: 'lamb-chop',          name: 'Lamb chop',                aliases: [],                           category: 'Protein',  serving: { label: '4 oz (113 g)', grams: 113 }, calories: 296, protein: 27, carbs: 0,  fats: 20, meal: 'dinner' },
  { id: 'salmon',             name: 'Salmon, baked',            aliases: ['fish'],                     category: 'Protein',  serving: { label: '4 oz (113 g)', grams: 113 }, calories: 233, protein: 25, carbs: 0,  fats: 14, meal: 'dinner' },
  { id: 'tuna-can',           name: 'Tuna, canned in water',    aliases: ['tuna fish'],                category: 'Protein',  serving: { label: '1 can (5 oz / 142 g)', grams: 142 }, calories: 130, protein: 30, carbs: 0,  fats: 1,  meal: 'lunch' },
  { id: 'tuna-steak',         name: 'Ahi tuna steak',           aliases: [],                           category: 'Protein',  serving: { label: '5 oz (140 g)', grams: 140 }, calories: 184, protein: 40, carbs: 0,  fats: 2,  meal: 'dinner' },
  { id: 'tilapia',            name: 'Tilapia, baked',           aliases: [],                           category: 'Protein',  serving: { label: '4 oz (113 g)', grams: 113 }, calories: 145, protein: 30, carbs: 0,  fats: 3,  meal: 'dinner' },
  { id: 'cod',                name: 'Cod, baked',               aliases: [],                           category: 'Protein',  serving: { label: '4 oz (113 g)', grams: 113 }, calories: 117, protein: 26, carbs: 0,  fats: 1,  meal: 'dinner' },
  { id: 'shrimp',             name: 'Shrimp, cooked',           aliases: ['prawns'],                   category: 'Protein',  serving: { label: '4 oz (113 g)', grams: 113 }, calories: 112, protein: 24, carbs: 0,  fats: 1,  meal: 'dinner' },
  { id: 'egg',                name: 'Egg, large (1)',           aliases: ['eggs'],                     category: 'Protein',  serving: { label: '1 large (50 g)', grams: 50 }, calories: 72,  protein: 6,  carbs: 0,  fats: 5,  meal: 'breakfast' },
  { id: 'egg-2',              name: 'Eggs (2 large)',           aliases: [],                           category: 'Protein',  serving: { label: '2 large (100 g)', grams: 100 }, calories: 143, protein: 12, carbs: 1,  fats: 10, meal: 'breakfast' },
  { id: 'egg-white',          name: 'Egg whites (3)',           aliases: ['whites'],                   category: 'Protein',  serving: { label: '3 whites (100 g)', grams: 100 }, calories: 52,  protein: 11, carbs: 1,  fats: 0,  meal: 'breakfast' },

  // ─────────────────────────────────────────────────────────
  // PROTEIN — plant
  // ─────────────────────────────────────────────────────────
  { id: 'tofu-firm',          name: 'Tofu, firm',               aliases: [],                           category: 'Plant protein', serving: { label: '½ cup (124 g)', grams: 124 }, calories: 88,  protein: 10, carbs: 2,  fats: 5,  meal: 'lunch' },
  { id: 'tempeh',             name: 'Tempeh',                   aliases: [],                           category: 'Plant protein', serving: { label: '½ cup (84 g)', grams: 84 }, calories: 160, protein: 17, carbs: 8,  fats: 9,  meal: 'lunch' },
  { id: 'seitan',             name: 'Seitan',                   aliases: ['wheat meat'],               category: 'Plant protein', serving: { label: '3 oz (85 g)', grams: 85 }, calories: 120, protein: 21, carbs: 4,  fats: 2,  meal: 'lunch' },
  { id: 'edamame',            name: 'Edamame, shelled',         aliases: [],                           category: 'Plant protein', serving: { label: '½ cup (75 g)', grams: 75 }, calories: 95,  protein: 8,  carbs: 7,  fats: 4,  meal: 'snack' },

  // ─────────────────────────────────────────────────────────
  // DAIRY
  // ─────────────────────────────────────────────────────────
  { id: 'milk-whole',         name: 'Whole milk',               aliases: ['milk'],                     category: 'Dairy',    serving: { label: '1 cup (240 ml)', grams: 244 }, calories: 149, protein: 8,  carbs: 12, fats: 8,  meal: 'breakfast' },
  { id: 'milk-2',             name: '2% milk',                  aliases: [],                           category: 'Dairy',    serving: { label: '1 cup (240 ml)', grams: 244 }, calories: 122, protein: 8,  carbs: 12, fats: 5,  meal: 'breakfast' },
  { id: 'milk-skim',          name: 'Skim milk',                aliases: ['fat-free milk'],            category: 'Dairy',    serving: { label: '1 cup (240 ml)', grams: 245 }, calories: 83,  protein: 8,  carbs: 12, fats: 0,  meal: 'breakfast' },
  { id: 'almond-milk',        name: 'Almond milk, unsweetened', aliases: [],                           category: 'Dairy',    serving: { label: '1 cup (240 ml)', grams: 240 }, calories: 30,  protein: 1,  carbs: 1,  fats: 3,  meal: 'breakfast' },
  { id: 'oat-milk',           name: 'Oat milk',                 aliases: [],                           category: 'Dairy',    serving: { label: '1 cup (240 ml)', grams: 240 }, calories: 120, protein: 3,  carbs: 16, fats: 5,  meal: 'breakfast' },
  { id: 'soy-milk',           name: 'Soy milk',                 aliases: [],                           category: 'Dairy',    serving: { label: '1 cup (240 ml)', grams: 240 }, calories: 80,  protein: 7,  carbs: 4,  fats: 4,  meal: 'breakfast' },
  { id: 'greek-yogurt',       name: 'Greek yogurt, plain nonfat', aliases: ['yogurt'],                 category: 'Dairy',    serving: { label: '1 cup (227 g)', grams: 227 }, calories: 130, protein: 23, carbs: 9,  fats: 1,  meal: 'breakfast' },
  { id: 'yogurt-flavored',    name: 'Yogurt, flavored (5%)',    aliases: [],                           category: 'Dairy',    serving: { label: '1 cup (227 g)', grams: 227 }, calories: 230, protein: 9,  carbs: 33, fats: 6,  meal: 'breakfast' },
  { id: 'cottage-cheese',     name: 'Cottage cheese, low-fat',  aliases: [],                           category: 'Dairy',    serving: { label: '1 cup (226 g)', grams: 226 }, calories: 163, protein: 28, carbs: 6,  fats: 2,  meal: 'snack' },
  { id: 'cheddar',            name: 'Cheddar cheese',           aliases: ['cheese'],                   category: 'Dairy',    serving: { label: '1 slice (28 g)', grams: 28 }, calories: 113, protein: 7,  carbs: 0,  fats: 9,  meal: 'snack' },
  { id: 'mozzarella',         name: 'Mozzarella cheese',        aliases: [],                           category: 'Dairy',    serving: { label: '1 slice (28 g)', grams: 28 }, calories: 78,  protein: 7,  carbs: 1,  fats: 6,  meal: 'snack' },
  { id: 'parmesan',           name: 'Parmesan, grated',         aliases: [],                           category: 'Dairy',    serving: { label: '2 tbsp (10 g)', grams: 10 }, calories: 43,  protein: 4,  carbs: 0,  fats: 3,  meal: 'dinner' },
  { id: 'feta',               name: 'Feta cheese',              aliases: [],                           category: 'Dairy',    serving: { label: '¼ cup (38 g)', grams: 38 }, calories: 100, protein: 5,  carbs: 1,  fats: 8,  meal: 'lunch' },
  { id: 'cream-cheese',       name: 'Cream cheese',             aliases: [],                           category: 'Dairy',    serving: { label: '2 tbsp (28 g)', grams: 28 }, calories: 99,  protein: 2,  carbs: 1,  fats: 10, meal: 'breakfast' },
  { id: 'butter',             name: 'Butter',                   aliases: [],                           category: 'Dairy',    serving: { label: '1 tbsp (14 g)', grams: 14 }, calories: 102, protein: 0,  carbs: 0,  fats: 12, meal: 'breakfast' },
  { id: 'sour-cream',         name: 'Sour cream',               aliases: [],                           category: 'Dairy',    serving: { label: '2 tbsp (28 g)', grams: 28 }, calories: 56,  protein: 1,  carbs: 1,  fats: 5,  meal: 'dinner' },
  { id: 'heavy-cream',        name: 'Heavy cream',              aliases: [],                           category: 'Dairy',    serving: { label: '1 tbsp (15 g)', grams: 15 }, calories: 51,  protein: 0,  carbs: 0,  fats: 5,  meal: 'breakfast' },

  // ─────────────────────────────────────────────────────────
  // GRAINS / CARBS
  // ─────────────────────────────────────────────────────────
  { id: 'rice-white',         name: 'White rice, cooked',       aliases: ['rice', 'jasmine'],          category: 'Grain',    serving: { label: '1 cup (158 g)', grams: 158 }, calories: 205, protein: 4,  carbs: 45, fats: 0,  meal: 'lunch' },
  { id: 'rice-brown',         name: 'Brown rice, cooked',       aliases: [],                           category: 'Grain',    serving: { label: '1 cup (195 g)', grams: 195 }, calories: 216, protein: 5,  carbs: 45, fats: 2,  meal: 'lunch' },
  { id: 'oats',               name: 'Oats, rolled (dry)',       aliases: ['oatmeal'],                  category: 'Grain',    serving: { label: '½ cup (40 g)', grams: 40 }, calories: 150, protein: 5,  carbs: 27, fats: 3,  meal: 'breakfast' },
  { id: 'quinoa',             name: 'Quinoa, cooked',           aliases: [],                           category: 'Grain',    serving: { label: '1 cup (185 g)', grams: 185 }, calories: 222, protein: 8,  carbs: 39, fats: 4,  meal: 'lunch' },
  { id: 'pasta-cooked',       name: 'Pasta, cooked',            aliases: ['spaghetti', 'penne'],       category: 'Grain',    serving: { label: '1 cup (140 g)', grams: 140 }, calories: 220, protein: 8,  carbs: 43, fats: 1,  meal: 'dinner' },
  { id: 'pasta-wheat',        name: 'Whole-wheat pasta, cooked',aliases: [],                           category: 'Grain',    serving: { label: '1 cup (140 g)', grams: 140 }, calories: 174, protein: 7,  carbs: 37, fats: 1,  meal: 'dinner' },
  { id: 'bread-white',        name: 'White bread (2 slices)',   aliases: ['bread'],                    category: 'Grain',    serving: { label: '2 slices (52 g)', grams: 52 }, calories: 152, protein: 5,  carbs: 28, fats: 2,  meal: 'breakfast' },
  { id: 'bread-wheat',        name: 'Whole-wheat bread (2 slices)', aliases: [],                       category: 'Grain',    serving: { label: '2 slices (56 g)', grams: 56 }, calories: 138, protein: 8,  carbs: 24, fats: 2,  meal: 'breakfast' },
  { id: 'sourdough',          name: 'Sourdough bread (1 slice)',aliases: [],                           category: 'Grain',    serving: { label: '1 slice (50 g)', grams: 50 }, calories: 130, protein: 5,  carbs: 26, fats: 1,  meal: 'breakfast' },
  { id: 'bagel',              name: 'Bagel, plain',             aliases: [],                           category: 'Grain',    serving: { label: '1 medium (105 g)', grams: 105 }, calories: 290, protein: 11, carbs: 56, fats: 2,  meal: 'breakfast' },
  { id: 'english-muffin',     name: 'English muffin',           aliases: [],                           category: 'Grain',    serving: { label: '1 (57 g)', grams: 57 }, calories: 132, protein: 4,  carbs: 25, fats: 1,  meal: 'breakfast' },
  { id: 'tortilla-flour',     name: 'Flour tortilla',           aliases: ['tortilla', 'wrap'],         category: 'Grain',    serving: { label: '1 (8 in, 49 g)', grams: 49 }, calories: 144, protein: 4,  carbs: 24, fats: 4,  meal: 'lunch' },
  { id: 'tortilla-corn',      name: 'Corn tortilla',            aliases: [],                           category: 'Grain',    serving: { label: '1 (6 in, 26 g)', grams: 26 }, calories: 52,  protein: 1,  carbs: 11, fats: 1,  meal: 'lunch' },
  { id: 'pita',               name: 'Pita bread',               aliases: [],                           category: 'Grain',    serving: { label: '1 (6 in, 60 g)', grams: 60 }, calories: 165, protein: 5,  carbs: 33, fats: 1,  meal: 'lunch' },
  { id: 'cereal-cheerios',    name: 'Cheerios',                 aliases: ['cereal'],                   category: 'Grain',    serving: { label: '1 cup (28 g)', grams: 28 }, calories: 100, protein: 3,  carbs: 20, fats: 2,  meal: 'breakfast' },
  { id: 'granola',            name: 'Granola',                  aliases: [],                           category: 'Grain',    serving: { label: '½ cup (60 g)', grams: 60 }, calories: 280, protein: 8,  carbs: 36, fats: 12, meal: 'breakfast' },
  { id: 'crackers',           name: 'Saltine crackers',         aliases: [],                           category: 'Grain',    serving: { label: '5 crackers (15 g)', grams: 15 }, calories: 65,  protein: 1,  carbs: 11, fats: 2,  meal: 'snack' },

  // ─────────────────────────────────────────────────────────
  // LEGUMES
  // ─────────────────────────────────────────────────────────
  { id: 'black-beans',        name: 'Black beans, canned',      aliases: ['beans'],                    category: 'Legume',   serving: { label: '½ cup (130 g)', grams: 130 }, calories: 109, protein: 7,  carbs: 20, fats: 0,  meal: 'lunch' },
  { id: 'kidney-beans',       name: 'Kidney beans, canned',     aliases: [],                           category: 'Legume',   serving: { label: '½ cup (128 g)', grams: 128 }, calories: 108, protein: 7,  carbs: 20, fats: 0,  meal: 'lunch' },
  { id: 'pinto-beans',        name: 'Pinto beans, canned',      aliases: [],                           category: 'Legume',   serving: { label: '½ cup (130 g)', grams: 130 }, calories: 117, protein: 7,  carbs: 22, fats: 1,  meal: 'lunch' },
  { id: 'chickpeas',          name: 'Chickpeas, canned',        aliases: ['garbanzo'],                 category: 'Legume',   serving: { label: '½ cup (123 g)', grams: 123 }, calories: 134, protein: 7,  carbs: 22, fats: 2,  meal: 'lunch' },
  { id: 'lentils',            name: 'Lentils, cooked',          aliases: [],                           category: 'Legume',   serving: { label: '½ cup (99 g)', grams: 99 }, calories: 115, protein: 9,  carbs: 20, fats: 0,  meal: 'dinner' },
  { id: 'peas',               name: 'Green peas',               aliases: [],                           category: 'Legume',   serving: { label: '½ cup (80 g)', grams: 80 }, calories: 62,  protein: 4,  carbs: 11, fats: 0,  meal: 'dinner' },

  // ─────────────────────────────────────────────────────────
  // VEGETABLES
  // ─────────────────────────────────────────────────────────
  { id: 'broccoli',           name: 'Broccoli, cooked',         aliases: [],                           category: 'Vegetable',serving: { label: '1 cup (156 g)', grams: 156 }, calories: 55,  protein: 4,  carbs: 11, fats: 1,  meal: 'dinner' },
  { id: 'spinach',            name: 'Spinach, raw',             aliases: [],                           category: 'Vegetable',serving: { label: '2 cups (60 g)', grams: 60 }, calories: 14,  protein: 2,  carbs: 2,  fats: 0,  meal: 'lunch' },
  { id: 'kale',               name: 'Kale, raw',                aliases: [],                           category: 'Vegetable',serving: { label: '1 cup (67 g)', grams: 67 }, calories: 33,  protein: 3,  carbs: 7,  fats: 1,  meal: 'lunch' },
  { id: 'lettuce-romaine',    name: 'Romaine lettuce',          aliases: ['lettuce', 'salad'],         category: 'Vegetable',serving: { label: '2 cups (94 g)', grams: 94 }, calories: 16,  protein: 1,  carbs: 3,  fats: 0,  meal: 'lunch' },
  { id: 'tomato',             name: 'Tomato',                   aliases: [],                           category: 'Vegetable',serving: { label: '1 medium (123 g)', grams: 123 }, calories: 22,  protein: 1,  carbs: 5,  fats: 0,  meal: 'lunch' },
  { id: 'cherry-tomato',      name: 'Cherry tomatoes',          aliases: [],                           category: 'Vegetable',serving: { label: '1 cup (149 g)', grams: 149 }, calories: 27,  protein: 1,  carbs: 6,  fats: 0,  meal: 'lunch' },
  { id: 'cucumber',           name: 'Cucumber',                 aliases: [],                           category: 'Vegetable',serving: { label: '1 cup (104 g)', grams: 104 }, calories: 16,  protein: 1,  carbs: 4,  fats: 0,  meal: 'lunch' },
  { id: 'carrot',             name: 'Carrot',                   aliases: [],                           category: 'Vegetable',serving: { label: '1 medium (61 g)', grams: 61 }, calories: 25,  protein: 1,  carbs: 6,  fats: 0,  meal: 'snack' },
  { id: 'bell-pepper',        name: 'Bell pepper, red',         aliases: ['pepper', 'capsicum'],       category: 'Vegetable',serving: { label: '1 medium (119 g)', grams: 119 }, calories: 37,  protein: 1,  carbs: 7,  fats: 0,  meal: 'lunch' },
  { id: 'onion',              name: 'Onion',                    aliases: [],                           category: 'Vegetable',serving: { label: '½ cup chopped (80 g)', grams: 80 }, calories: 32,  protein: 1,  carbs: 7,  fats: 0,  meal: 'dinner' },
  { id: 'mushrooms',          name: 'Mushrooms, white',         aliases: [],                           category: 'Vegetable',serving: { label: '1 cup (96 g)', grams: 96 }, calories: 21,  protein: 3,  carbs: 3,  fats: 0,  meal: 'dinner' },
  { id: 'zucchini',           name: 'Zucchini',                 aliases: ['courgette'],                category: 'Vegetable',serving: { label: '1 medium (196 g)', grams: 196 }, calories: 33,  protein: 2,  carbs: 6,  fats: 0,  meal: 'dinner' },
  { id: 'asparagus',          name: 'Asparagus',                aliases: [],                           category: 'Vegetable',serving: { label: '1 cup (134 g)', grams: 134 }, calories: 27,  protein: 3,  carbs: 5,  fats: 0,  meal: 'dinner' },
  { id: 'green-beans',        name: 'Green beans',              aliases: [],                           category: 'Vegetable',serving: { label: '1 cup (110 g)', grams: 110 }, calories: 34,  protein: 2,  carbs: 8,  fats: 0,  meal: 'dinner' },
  { id: 'cauliflower',        name: 'Cauliflower',              aliases: [],                           category: 'Vegetable',serving: { label: '1 cup (107 g)', grams: 107 }, calories: 27,  protein: 2,  carbs: 5,  fats: 0,  meal: 'dinner' },
  { id: 'brussels-sprouts',   name: 'Brussels sprouts',         aliases: [],                           category: 'Vegetable',serving: { label: '1 cup (88 g)', grams: 88 }, calories: 38,  protein: 3,  carbs: 8,  fats: 0,  meal: 'dinner' },
  { id: 'sweet-potato',       name: 'Sweet potato, baked',      aliases: [],                           category: 'Vegetable',serving: { label: '1 medium (114 g)', grams: 114 }, calories: 103, protein: 2,  carbs: 24, fats: 0,  meal: 'dinner' },
  { id: 'potato-baked',       name: 'Potato, baked',            aliases: [],                           category: 'Vegetable',serving: { label: '1 medium (173 g)', grams: 173 }, calories: 161, protein: 4,  carbs: 37, fats: 0,  meal: 'dinner' },
  { id: 'fries',              name: 'French fries',             aliases: ['chips', 'fries'],           category: 'Vegetable',serving: { label: 'medium (117 g)', grams: 117 }, calories: 365, protein: 4,  carbs: 48, fats: 17, meal: 'dinner' },
  { id: 'corn',               name: 'Corn',                     aliases: [],                           category: 'Vegetable',serving: { label: '1 cup (164 g)', grams: 164 }, calories: 143, protein: 5,  carbs: 31, fats: 2,  meal: 'dinner' },

  // ─────────────────────────────────────────────────────────
  // FRUITS
  // ─────────────────────────────────────────────────────────
  { id: 'apple',              name: 'Apple',                    aliases: [],                           category: 'Fruit',    serving: { label: '1 medium (182 g)', grams: 182 }, calories: 95,  protein: 0,  carbs: 25, fats: 0,  meal: 'snack' },
  { id: 'banana',             name: 'Banana',                   aliases: [],                           category: 'Fruit',    serving: { label: '1 medium (118 g)', grams: 118 }, calories: 105, protein: 1,  carbs: 27, fats: 0,  meal: 'snack' },
  { id: 'orange',             name: 'Orange',                   aliases: [],                           category: 'Fruit',    serving: { label: '1 medium (131 g)', grams: 131 }, calories: 62,  protein: 1,  carbs: 15, fats: 0,  meal: 'snack' },
  { id: 'strawberries',       name: 'Strawberries',             aliases: ['berries'],                  category: 'Fruit',    serving: { label: '1 cup (152 g)', grams: 152 }, calories: 49,  protein: 1,  carbs: 12, fats: 0,  meal: 'snack' },
  { id: 'blueberries',        name: 'Blueberries',              aliases: [],                           category: 'Fruit',    serving: { label: '1 cup (148 g)', grams: 148 }, calories: 84,  protein: 1,  carbs: 21, fats: 0,  meal: 'snack' },
  { id: 'raspberries',        name: 'Raspberries',              aliases: [],                           category: 'Fruit',    serving: { label: '1 cup (123 g)', grams: 123 }, calories: 64,  protein: 1,  carbs: 15, fats: 1,  meal: 'snack' },
  { id: 'grapes',             name: 'Grapes',                   aliases: [],                           category: 'Fruit',    serving: { label: '1 cup (151 g)', grams: 151 }, calories: 104, protein: 1,  carbs: 27, fats: 0,  meal: 'snack' },
  { id: 'watermelon',         name: 'Watermelon',               aliases: [],                           category: 'Fruit',    serving: { label: '1 cup (152 g)', grams: 152 }, calories: 46,  protein: 1,  carbs: 11, fats: 0,  meal: 'snack' },
  { id: 'pineapple',          name: 'Pineapple',                aliases: [],                           category: 'Fruit',    serving: { label: '1 cup (165 g)', grams: 165 }, calories: 82,  protein: 1,  carbs: 22, fats: 0,  meal: 'snack' },
  { id: 'mango',              name: 'Mango',                    aliases: [],                           category: 'Fruit',    serving: { label: '1 cup sliced (165 g)', grams: 165 }, calories: 99,  protein: 1,  carbs: 25, fats: 1,  meal: 'snack' },
  { id: 'pear',               name: 'Pear',                     aliases: [],                           category: 'Fruit',    serving: { label: '1 medium (178 g)', grams: 178 }, calories: 101, protein: 1,  carbs: 27, fats: 0,  meal: 'snack' },
  { id: 'peach',              name: 'Peach',                    aliases: [],                           category: 'Fruit',    serving: { label: '1 medium (150 g)', grams: 150 }, calories: 58,  protein: 1,  carbs: 14, fats: 0,  meal: 'snack' },
  { id: 'avocado',            name: 'Avocado',                  aliases: [],                           category: 'Fruit',    serving: { label: '½ medium (100 g)', grams: 100 }, calories: 160, protein: 2,  carbs: 9,  fats: 15, meal: 'lunch' },
  { id: 'kiwi',               name: 'Kiwi',                     aliases: [],                           category: 'Fruit',    serving: { label: '1 medium (76 g)', grams: 76 }, calories: 46,  protein: 1,  carbs: 11, fats: 0,  meal: 'snack' },
  { id: 'cherries',           name: 'Cherries',                 aliases: [],                           category: 'Fruit',    serving: { label: '1 cup (138 g)', grams: 138 }, calories: 87,  protein: 1,  carbs: 22, fats: 0,  meal: 'snack' },
  { id: 'grapefruit',         name: 'Grapefruit',               aliases: [],                           category: 'Fruit',    serving: { label: '½ medium (123 g)', grams: 123 }, calories: 52,  protein: 1,  carbs: 13, fats: 0,  meal: 'breakfast' },
  { id: 'lemon',              name: 'Lemon',                    aliases: [],                           category: 'Fruit',    serving: { label: '1 medium (58 g)', grams: 58 }, calories: 17,  protein: 1,  carbs: 5,  fats: 0,  meal: 'snack' },

  // ─────────────────────────────────────────────────────────
  // NUTS / SEEDS / FATS
  // ─────────────────────────────────────────────────────────
  { id: 'almonds',            name: 'Almonds',                  aliases: ['nuts'],                     category: 'Nuts',     serving: { label: '1 oz (28 g, ~23 nuts)', grams: 28 }, calories: 164, protein: 6,  carbs: 6,  fats: 14, meal: 'snack' },
  { id: 'peanuts',            name: 'Peanuts',                  aliases: [],                           category: 'Nuts',     serving: { label: '1 oz (28 g)', grams: 28 }, calories: 161, protein: 7,  carbs: 5,  fats: 14, meal: 'snack' },
  { id: 'walnuts',            name: 'Walnuts',                  aliases: [],                           category: 'Nuts',     serving: { label: '1 oz (28 g)', grams: 28 }, calories: 185, protein: 4,  carbs: 4,  fats: 19, meal: 'snack' },
  { id: 'cashews',            name: 'Cashews',                  aliases: [],                           category: 'Nuts',     serving: { label: '1 oz (28 g)', grams: 28 }, calories: 157, protein: 5,  carbs: 9,  fats: 12, meal: 'snack' },
  { id: 'pistachios',         name: 'Pistachios',               aliases: [],                           category: 'Nuts',     serving: { label: '1 oz (28 g)', grams: 28 }, calories: 159, protein: 6,  carbs: 8,  fats: 13, meal: 'snack' },
  { id: 'peanut-butter',      name: 'Peanut butter',            aliases: ['pb'],                       category: 'Nuts',     serving: { label: '2 tbsp (32 g)', grams: 32 }, calories: 190, protein: 7,  carbs: 7,  fats: 16, meal: 'snack' },
  { id: 'almond-butter',      name: 'Almond butter',            aliases: [],                           category: 'Nuts',     serving: { label: '2 tbsp (32 g)', grams: 32 }, calories: 196, protein: 7,  carbs: 7,  fats: 18, meal: 'snack' },
  { id: 'chia-seeds',         name: 'Chia seeds',               aliases: [],                           category: 'Seeds',    serving: { label: '1 tbsp (12 g)', grams: 12 }, calories: 60,  protein: 2,  carbs: 5,  fats: 4,  meal: 'breakfast' },
  { id: 'flax-seeds',         name: 'Flax seeds, ground',       aliases: [],                           category: 'Seeds',    serving: { label: '1 tbsp (7 g)', grams: 7 }, calories: 37,  protein: 1,  carbs: 2,  fats: 3,  meal: 'breakfast' },
  { id: 'olive-oil',          name: 'Olive oil',                aliases: ['oil', 'evoo'],              category: 'Fat',      serving: { label: '1 tbsp (14 g)', grams: 14 }, calories: 119, protein: 0,  carbs: 0,  fats: 14, meal: 'dinner' },
  { id: 'coconut-oil',        name: 'Coconut oil',              aliases: [],                           category: 'Fat',      serving: { label: '1 tbsp (14 g)', grams: 14 }, calories: 121, protein: 0,  carbs: 0,  fats: 13, meal: 'dinner' },
  { id: 'ghee',               name: 'Ghee',                     aliases: ['clarified butter'],         category: 'Fat',      serving: { label: '1 tbsp (13 g)', grams: 13 }, calories: 112, protein: 0,  carbs: 0,  fats: 13, meal: 'dinner' },

  // ─────────────────────────────────────────────────────────
  // BEVERAGES
  // ─────────────────────────────────────────────────────────
  { id: 'coffee-black',       name: 'Coffee, black',            aliases: ['coffee'],                   category: 'Beverage', serving: { label: '12 oz (355 ml)', grams: 355 }, calories: 2,   protein: 0,  carbs: 0,  fats: 0,  meal: 'breakfast' },
  { id: 'coffee-cream-sugar', name: 'Coffee with cream & sugar',aliases: [],                           category: 'Beverage', serving: { label: '12 oz (355 ml)', grams: 355 }, calories: 75,  protein: 1,  carbs: 11, fats: 3,  meal: 'breakfast' },
  { id: 'latte',              name: 'Latte (whole milk)',       aliases: [],                           category: 'Beverage', serving: { label: '12 oz (355 ml)', grams: 355 }, calories: 180, protein: 10, carbs: 17, fats: 9,  meal: 'breakfast' },
  { id: 'tea',                name: 'Tea, unsweetened',         aliases: [],                           category: 'Beverage', serving: { label: '8 oz (240 ml)', grams: 240 }, calories: 2,   protein: 0,  carbs: 1,  fats: 0,  meal: 'breakfast' },
  { id: 'orange-juice',       name: 'Orange juice',             aliases: ['oj'],                       category: 'Beverage', serving: { label: '1 cup (248 g)', grams: 248 }, calories: 112, protein: 2,  carbs: 26, fats: 0,  meal: 'breakfast' },
  { id: 'apple-juice',        name: 'Apple juice',              aliases: [],                           category: 'Beverage', serving: { label: '1 cup (248 g)', grams: 248 }, calories: 114, protein: 0,  carbs: 28, fats: 0,  meal: 'breakfast' },
  { id: 'soda',               name: 'Soda, cola',               aliases: ['coke', 'pepsi'],            category: 'Beverage', serving: { label: '1 can (355 ml)', grams: 372 }, calories: 140, protein: 0,  carbs: 39, fats: 0,  meal: 'snack' },
  { id: 'diet-soda',          name: 'Diet soda',                aliases: ['diet coke'],                category: 'Beverage', serving: { label: '1 can (355 ml)', grams: 355 }, calories: 0,   protein: 0,  carbs: 0,  fats: 0,  meal: 'snack' },
  { id: 'beer',               name: 'Beer, regular',            aliases: [],                           category: 'Beverage', serving: { label: '12 oz (355 ml)', grams: 355 }, calories: 153, protein: 2,  carbs: 13, fats: 0,  meal: 'snack' },
  { id: 'beer-light',         name: 'Beer, light',              aliases: [],                           category: 'Beverage', serving: { label: '12 oz (355 ml)', grams: 355 }, calories: 103, protein: 1,  carbs: 6,  fats: 0,  meal: 'snack' },
  { id: 'wine-red',           name: 'Red wine',                 aliases: ['wine'],                     category: 'Beverage', serving: { label: '5 oz (147 ml)', grams: 147 }, calories: 125, protein: 0,  carbs: 4,  fats: 0,  meal: 'dinner' },
  { id: 'wine-white',         name: 'White wine',               aliases: [],                           category: 'Beverage', serving: { label: '5 oz (147 ml)', grams: 147 }, calories: 121, protein: 0,  carbs: 4,  fats: 0,  meal: 'dinner' },
  { id: 'whiskey',            name: 'Whiskey',                  aliases: ['bourbon', 'scotch'],        category: 'Beverage', serving: { label: '1.5 oz shot', grams: 42 }, calories: 97,  protein: 0,  carbs: 0,  fats: 0,  meal: 'snack' },
  { id: 'vodka',              name: 'Vodka',                    aliases: [],                           category: 'Beverage', serving: { label: '1.5 oz shot', grams: 42 }, calories: 97,  protein: 0,  carbs: 0,  fats: 0,  meal: 'snack' },
  { id: 'gatorade',           name: 'Gatorade',                 aliases: ['sports drink'],             category: 'Beverage', serving: { label: '20 oz (591 ml)', grams: 591 }, calories: 140, protein: 0,  carbs: 36, fats: 0,  meal: 'snack' },

  // ─────────────────────────────────────────────────────────
  // SAUCES / CONDIMENTS
  // ─────────────────────────────────────────────────────────
  { id: 'ketchup',            name: 'Ketchup',                  aliases: [],                           category: 'Sauce',    serving: { label: '1 tbsp (15 g)', grams: 15 }, calories: 17,  protein: 0,  carbs: 4,  fats: 0,  meal: 'dinner' },
  { id: 'mustard',            name: 'Mustard',                  aliases: [],                           category: 'Sauce',    serving: { label: '1 tsp (5 g)', grams: 5 }, calories: 3,   protein: 0,  carbs: 0,  fats: 0,  meal: 'dinner' },
  { id: 'mayo',               name: 'Mayonnaise',               aliases: ['mayonnaise'],               category: 'Sauce',    serving: { label: '1 tbsp (14 g)', grams: 14 }, calories: 94,  protein: 0,  carbs: 0,  fats: 10, meal: 'dinner' },
  { id: 'ranch',              name: 'Ranch dressing',           aliases: [],                           category: 'Sauce',    serving: { label: '2 tbsp (30 g)', grams: 30 }, calories: 145, protein: 1,  carbs: 2,  fats: 15, meal: 'dinner' },
  { id: 'soy-sauce',          name: 'Soy sauce',                aliases: [],                           category: 'Sauce',    serving: { label: '1 tbsp (16 g)', grams: 16 }, calories: 8,   protein: 1,  carbs: 1,  fats: 0,  meal: 'dinner' },
  { id: 'hot-sauce',          name: 'Hot sauce',                aliases: ['sriracha', 'tabasco'],      category: 'Sauce',    serving: { label: '1 tsp (5 g)', grams: 5 }, calories: 1,   protein: 0,  carbs: 0,  fats: 0,  meal: 'dinner' },
  { id: 'salsa',              name: 'Salsa',                    aliases: [],                           category: 'Sauce',    serving: { label: '¼ cup (60 g)', grams: 60 }, calories: 20,  protein: 1,  carbs: 4,  fats: 0,  meal: 'lunch' },
  { id: 'pasta-sauce',        name: 'Pasta sauce, marinara',    aliases: ['marinara'],                 category: 'Sauce',    serving: { label: '½ cup (125 g)', grams: 125 }, calories: 70,  protein: 2,  carbs: 11, fats: 2,  meal: 'dinner' },

  // ─────────────────────────────────────────────────────────
  // COMMON MEALS / FAST FOOD
  // ─────────────────────────────────────────────────────────
  { id: 'pizza-slice',        name: 'Pizza, cheese (1 slice)',  aliases: ['pizza'],                    category: 'Meal',     serving: { label: '1 slice (107 g)', grams: 107 }, calories: 285, protein: 12, carbs: 36, fats: 10, meal: 'dinner' },
  { id: 'pizza-pepperoni',    name: 'Pizza, pepperoni (1 slice)',aliases: [],                          category: 'Meal',     serving: { label: '1 slice (113 g)', grams: 113 }, calories: 313, protein: 13, carbs: 36, fats: 12, meal: 'dinner' },
  { id: 'burger',             name: 'Cheeseburger',             aliases: [],                           category: 'Meal',     serving: { label: '1 (199 g)', grams: 199 }, calories: 535, protein: 30, carbs: 39, fats: 28, meal: 'dinner' },
  { id: 'big-mac',             name: 'Big Mac',                 aliases: [],                           category: 'Meal',     serving: { label: '1 (219 g)', grams: 219 }, calories: 563, protein: 26, carbs: 45, fats: 33, meal: 'dinner' },
  { id: 'sandwich-turkey',    name: 'Turkey sandwich',          aliases: ['sandwich'],                 category: 'Meal',     serving: { label: '1', grams: 250 }, calories: 380, protein: 26, carbs: 42, fats: 12, meal: 'lunch' },
  { id: 'sandwich-pbj',       name: 'PB&J sandwich',            aliases: ['pbj'],                      category: 'Meal',     serving: { label: '1', grams: 130 }, calories: 380, protein: 12, carbs: 50, fats: 16, meal: 'lunch' },
  { id: 'burrito',            name: 'Burrito, chicken',         aliases: ['wrap'],                     category: 'Meal',     serving: { label: '1 (300 g)', grams: 300 }, calories: 560, protein: 32, carbs: 65, fats: 19, meal: 'lunch' },
  { id: 'tacos-2',            name: 'Tacos (2)',                aliases: ['taco'],                     category: 'Meal',     serving: { label: '2 (200 g)', grams: 200 }, calories: 380, protein: 18, carbs: 36, fats: 18, meal: 'lunch' },
  { id: 'sushi-roll',         name: 'Sushi roll (6 pcs)',       aliases: ['sushi'],                    category: 'Meal',     serving: { label: '6 pcs (200 g)', grams: 200 }, calories: 320, protein: 12, carbs: 56, fats: 6,  meal: 'dinner' },
  { id: 'chicken-salad',      name: 'Chicken salad',            aliases: ['salad'],                    category: 'Meal',     serving: { label: '1 large bowl', grams: 400 }, calories: 380, protein: 32, carbs: 18, fats: 22, meal: 'lunch' },
  { id: 'caesar-salad',       name: 'Caesar salad (no chicken)',aliases: [],                           category: 'Meal',     serving: { label: '1 bowl', grams: 250 }, calories: 290, protein: 8,  carbs: 14, fats: 22, meal: 'lunch' },
  { id: 'smoothie',           name: 'Fruit smoothie',           aliases: [],                           category: 'Meal',     serving: { label: '16 oz (450 ml)', grams: 450 }, calories: 280, protein: 6,  carbs: 56, fats: 3,  meal: 'breakfast' },
  { id: 'whey-shake',         name: 'Whey protein shake',       aliases: ['protein shake'],            category: 'Meal',     serving: { label: '1 scoop + water', grams: 250 }, calories: 130, protein: 25, carbs: 3,  fats: 2,  meal: 'snack' },
  { id: 'protein-bar',        name: 'Protein bar',              aliases: [],                           category: 'Meal',     serving: { label: '1 bar (60 g)', grams: 60 }, calories: 220, protein: 20, carbs: 23, fats: 7,  meal: 'snack' },
  { id: 'granola-bar',        name: 'Granola bar',              aliases: [],                           category: 'Meal',     serving: { label: '1 bar (28 g)', grams: 28 }, calories: 120, protein: 2,  carbs: 22, fats: 4,  meal: 'snack' },
  { id: 'pancakes',           name: 'Pancakes (2)',             aliases: [],                           category: 'Meal',     serving: { label: '2 (5 in, 76 g)', grams: 76 }, calories: 173, protein: 5,  carbs: 22, fats: 7,  meal: 'breakfast' },
  { id: 'waffles',            name: 'Waffles (2)',              aliases: [],                           category: 'Meal',     serving: { label: '2 (4 in, 70 g)', grams: 70 }, calories: 218, protein: 5,  carbs: 25, fats: 11, meal: 'breakfast' },

  // ─────────────────────────────────────────────────────────
  // SWEETS / SNACKS
  // ─────────────────────────────────────────────────────────
  { id: 'chocolate-dark',     name: 'Dark chocolate',           aliases: ['chocolate'],                category: 'Sweet',    serving: { label: '1 oz (28 g)', grams: 28 }, calories: 170, protein: 2,  carbs: 13, fats: 12, meal: 'snack' },
  { id: 'chocolate-milk',     name: 'Milk chocolate',           aliases: [],                           category: 'Sweet',    serving: { label: '1 oz (28 g)', grams: 28 }, calories: 152, protein: 2,  carbs: 17, fats: 9,  meal: 'snack' },
  { id: 'cookie',             name: 'Chocolate chip cookie',    aliases: ['cookies'],                  category: 'Sweet',    serving: { label: '1 medium (16 g)', grams: 16 }, calories: 78,  protein: 1,  carbs: 9,  fats: 4,  meal: 'snack' },
  { id: 'ice-cream',          name: 'Ice cream, vanilla',       aliases: [],                           category: 'Sweet',    serving: { label: '½ cup (66 g)', grams: 66 }, calories: 137, protein: 2,  carbs: 16, fats: 7,  meal: 'snack' },
  { id: 'donut',              name: 'Donut, glazed',            aliases: [],                           category: 'Sweet',    serving: { label: '1 (60 g)', grams: 60 }, calories: 269, protein: 4,  carbs: 31, fats: 15, meal: 'breakfast' },
  { id: 'muffin',             name: 'Muffin, blueberry',        aliases: [],                           category: 'Sweet',    serving: { label: '1 medium (113 g)', grams: 113 }, calories: 385, protein: 5,  carbs: 56, fats: 16, meal: 'breakfast' },
  { id: 'brownie',            name: 'Brownie',                  aliases: [],                           category: 'Sweet',    serving: { label: '1 piece (56 g)', grams: 56 }, calories: 243, protein: 3,  carbs: 32, fats: 13, meal: 'snack' },
  { id: 'chips-potato',       name: 'Potato chips',             aliases: ['chips', 'crisps'],          category: 'Snack',    serving: { label: '1 oz (28 g)', grams: 28 }, calories: 152, protein: 2,  carbs: 15, fats: 10, meal: 'snack' },
  { id: 'chips-tortilla',     name: 'Tortilla chips',           aliases: [],                           category: 'Snack',    serving: { label: '1 oz (28 g, ~10 chips)', grams: 28 }, calories: 138, protein: 2,  carbs: 19, fats: 7,  meal: 'snack' },
  { id: 'pretzels',           name: 'Pretzels',                 aliases: [],                           category: 'Snack',    serving: { label: '1 oz (28 g)', grams: 28 }, calories: 108, protein: 3,  carbs: 22, fats: 1,  meal: 'snack' },
  { id: 'popcorn',            name: 'Popcorn, air-popped',      aliases: [],                           category: 'Snack',    serving: { label: '3 cups (24 g)', grams: 24 }, calories: 92,  protein: 3,  carbs: 19, fats: 1,  meal: 'snack' },
  { id: 'hummus',             name: 'Hummus',                   aliases: [],                           category: 'Snack',    serving: { label: '2 tbsp (30 g)', grams: 30 }, calories: 78,  protein: 2,  carbs: 6,  fats: 5,  meal: 'snack' },
];

// ─────────────────────────────────────────────────────────
// Fuzzy match against verified foods. Higher score = better match.
// ─────────────────────────────────────────────────────────
export function searchVerified(query, max = 12) {
  const q = String(query || '').trim().toLowerCase();
  if (q.length < 2) return [];

  const scored = [];
  for (const f of VERIFIED_FOODS) {
    const name = f.name.toLowerCase();
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(' ' + q) || name.includes(q + ' ')) score = 60;
    else if (name.includes(q)) score = 50;
    else {
      // Try aliases
      for (const a of (f.aliases || [])) {
        const al = a.toLowerCase();
        if (al === q) { score = Math.max(score, 70); }
        else if (al.startsWith(q)) { score = Math.max(score, 55); }
        else if (al.includes(q)) { score = Math.max(score, 40); }
      }
    }
    if (score > 0) scored.push({ food: f, score });
  }
  scored.sort((a, b) => b.score - a.score || a.food.name.length - b.food.name.length);
  return scored.slice(0, max).map((s) => s.food);
}
