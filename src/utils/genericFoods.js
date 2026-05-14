// Generic quick-log foods. Defaults are "medium" portions — we apply a
// scaling factor based on the portion the user picks so they don't have to
// stress about precision. The goal is friction-free logging.

export const PORTIONS = [
  { id: 's', label: 'Small',  factor: 0.7, emoji: '◦' },
  { id: 'm', label: 'Medium', factor: 1.0, emoji: '○' },
  { id: 'l', label: 'Large',  factor: 1.5, emoji: '●' },
];

// Each item: medium-portion macros. Calories should approximately equal
// 4*p + 4*c + 9*f for the medium values.
export const GENERIC_FOODS = [
  // ── Protein ──
  { id: 'chicken-breast',  name: 'Chicken breast',  emoji: '🍗', meal: 'lunch',     calories: 230, protein: 43, carbs: 0,  fats: 5 },
  { id: 'eggs',            name: 'Eggs (2)',        emoji: '🥚', meal: 'breakfast', calories: 155, protein: 13, carbs: 1,  fats: 11 },
  { id: 'salmon',          name: 'Salmon',          emoji: '🐟', meal: 'dinner',    calories: 280, protein: 30, carbs: 0,  fats: 17 },
  { id: 'tuna',            name: 'Tuna',            emoji: '🥫', meal: 'lunch',     calories: 120, protein: 26, carbs: 0,  fats: 2 },
  { id: 'beef',            name: 'Beef / steak',    emoji: '🥩', meal: 'dinner',    calories: 320, protein: 32, carbs: 0,  fats: 22 },
  { id: 'ground-turkey',   name: 'Ground turkey',   emoji: '🦃', meal: 'dinner',    calories: 220, protein: 28, carbs: 0,  fats: 12 },
  { id: 'tofu',            name: 'Tofu',            emoji: '🟫', meal: 'lunch',     calories: 145, protein: 16, carbs: 4,  fats: 8 },
  { id: 'whey',            name: 'Whey shake',      emoji: '🥛', meal: 'snack',     calories: 130, protein: 25, carbs: 3,  fats: 2 },

  // ── Carbs / Grains ──
  { id: 'rice',            name: 'Rice (cooked)',   emoji: '🍚', meal: 'lunch',     calories: 220, protein: 5,  carbs: 47, fats: 1 },
  { id: 'oats',            name: 'Oats',            emoji: '🥣', meal: 'breakfast', calories: 300, protein: 11, carbs: 54, fats: 5 },
  { id: 'pasta',           name: 'Pasta (cooked)',  emoji: '🍝', meal: 'dinner',    calories: 280, protein: 10, carbs: 56, fats: 2 },
  { id: 'bread',           name: 'Bread (2 slices)',emoji: '🍞', meal: 'breakfast', calories: 160, protein: 6,  carbs: 30, fats: 2 },
  { id: 'sweet-potato',    name: 'Sweet potato',    emoji: '🍠', meal: 'lunch',     calories: 180, protein: 4,  carbs: 41, fats: 0 },
  { id: 'cereal',          name: 'Cereal + milk',   emoji: '🥣', meal: 'breakfast', calories: 240, protein: 10, carbs: 42, fats: 5 },

  // ── Dairy / Snacks ──
  { id: 'greek-yogurt',    name: 'Greek yogurt',    emoji: '🥛', meal: 'breakfast', calories: 150, protein: 17, carbs: 8,  fats: 4 },
  { id: 'milk',            name: 'Milk (glass)',    emoji: '🥛', meal: 'breakfast', calories: 150, protein: 8,  carbs: 12, fats: 8 },
  { id: 'cheese',          name: 'Cheese',          emoji: '🧀', meal: 'snack',     calories: 110, protein: 7,  carbs: 1,  fats: 9 },
  { id: 'cottage-cheese',  name: 'Cottage cheese',  emoji: '🥛', meal: 'snack',     calories: 165, protein: 28, carbs: 6,  fats: 2 },

  // ── Fruit / Veg ──
  { id: 'banana',          name: 'Banana',          emoji: '🍌', meal: 'snack',     calories: 105, protein: 1,  carbs: 27, fats: 0 },
  { id: 'apple',           name: 'Apple',           emoji: '🍎', meal: 'snack',     calories: 95,  protein: 0,  carbs: 25, fats: 0 },
  { id: 'berries',         name: 'Berries',         emoji: '🫐', meal: 'snack',     calories: 70,  protein: 1,  carbs: 17, fats: 0 },
  { id: 'salad',           name: 'Mixed salad',     emoji: '🥗', meal: 'lunch',     calories: 150, protein: 4,  carbs: 12, fats: 9 },
  { id: 'veggies',         name: 'Veggies',         emoji: '🥦', meal: 'dinner',    calories: 60,  protein: 3,  carbs: 12, fats: 0 },
  { id: 'avocado',         name: 'Avocado',         emoji: '🥑', meal: 'snack',     calories: 240, protein: 3,  carbs: 12, fats: 22 },

  // ── Fats / Misc ──
  { id: 'peanut-butter',   name: 'Peanut butter',   emoji: '🥜', meal: 'snack',     calories: 190, protein: 7,  carbs: 7,  fats: 16 },
  { id: 'almonds',         name: 'Almonds',         emoji: '🌰', meal: 'snack',     calories: 165, protein: 6,  carbs: 6,  fats: 14 },
  { id: 'olive-oil',       name: 'Olive oil (tbsp)',emoji: '🫒', meal: 'dinner',    calories: 120, protein: 0,  carbs: 0,  fats: 14 },

  // ── Common "real life" entries ──
  { id: 'pizza',           name: 'Pizza (2 slices)',emoji: '🍕', meal: 'dinner',    calories: 580, protein: 24, carbs: 70, fats: 22 },
  { id: 'burger',          name: 'Burger',          emoji: '🍔', meal: 'dinner',    calories: 550, protein: 28, carbs: 42, fats: 28 },
  { id: 'sandwich',        name: 'Sandwich',        emoji: '🥪', meal: 'lunch',     calories: 380, protein: 18, carbs: 42, fats: 14 },
  { id: 'wrap',            name: 'Wrap / burrito',  emoji: '🌯', meal: 'lunch',     calories: 480, protein: 22, carbs: 54, fats: 18 },
  { id: 'sushi',           name: 'Sushi (6 pcs)',   emoji: '🍣', meal: 'dinner',    calories: 320, protein: 12, carbs: 56, fats: 6 },
  { id: 'smoothie',        name: 'Smoothie',        emoji: '🥤', meal: 'breakfast', calories: 280, protein: 18, carbs: 42, fats: 4 },
  { id: 'protein-bar',     name: 'Protein bar',     emoji: '🍫', meal: 'snack',     calories: 220, protein: 20, carbs: 24, fats: 7 },
  { id: 'coffee-creamer',  name: 'Coffee + cream',  emoji: '☕', meal: 'breakfast', calories: 60,  protein: 1,  carbs: 4,  fats: 4 },
  { id: 'beer',            name: 'Beer',            emoji: '🍺', meal: 'snack',     calories: 150, protein: 1,  carbs: 13, fats: 0 },
  { id: 'wine',            name: 'Wine (glass)',    emoji: '🍷', meal: 'snack',     calories: 130, protein: 0,  carbs: 4,  fats: 0 },
];

export function scaleFood(food, factor = 1) {
  const round = (n) => Math.round(n);
  const round1 = (n) => Math.round(n * 10) / 10;
  return {
    food_name: food.name,
    calories: round(food.calories * factor),
    protein: round1(food.protein * factor),
    carbs: round1(food.carbs * factor),
    fats: round1(food.fats * factor),
  };
}
