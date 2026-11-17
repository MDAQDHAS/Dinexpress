export const CATEGORIES = [
  { name: 'All' },
  { name: 'Breakfast' },
  { name: 'Lunch' },
  { name: 'Snacks' },
  { name: 'Drinks' },
  { name: 'Cakes' },
  { name: 'Stationery' },
];

export const MOCK_ITEMS = [
  // Breakfast (8)
  { id: 1, name: 'plain dosai', price: 30, category: 'Breakfast', desc: 'Classic golden crispy plain dosa', rating: 4.5 },
  { id: 2, name: 'masala dosai', price: 45, category: 'Breakfast', desc: 'Dosa stuffed with spiced potato masala', rating: 4.8 },
  { id: 3, name: 'Dosa', price: 35, category: 'Breakfast', desc: 'Golden crispy dosa', rating: 4.4 },
  { id: 4, name: 'medhu vadai', price: 10, category: 'Breakfast', desc: 'Traditional medhu vadai with chutney', rating: 4.4 },
  { id: 5, name: 'poori', price: 35, category: 'Breakfast', desc: 'Soft puffed poori with potato masala', rating: 4.7 },
  { id: 6, name: 'upma', price: 20, category: 'Breakfast', desc: 'Delicious semolina upma with veggies', rating: 4.0 },
  { id: 7, name: 'vean pongal', price: 35, category: 'Breakfast', desc: 'Steaming hot ghee pongal with sambar', rating: 4.6 },
  { id: 8, name: 'pakoda', price: 15, category: 'Breakfast', desc: 'Crispy onion pakkoda snack', rating: 4.2 },

  // Lunch (11)
  { id: 11, name: 'chicken briyani', price: 120, category: 'Lunch', desc: 'Aromatic basmati rice with tender chicken', rating: 4.9 },
  { id: 12, name: 'veg briyani', price: 70, category: 'Lunch', desc: 'Spicy vegetable biryani with raitha', rating: 4.5 },
  { id: 13, name: 'mutton briyani', price: 180, category: 'Lunch', desc: 'Rich mutton biryani with spices', rating: 4.8 },
  { id: 14, name: 'chicken rice', price: 90, category: 'Lunch', desc: 'Classic fried rice with chicken bits', rating: 4.6 },
  { id: 15, name: 'egg rice', price: 60, category: 'Lunch', desc: 'Wok tossed rice with scrambled eggs', rating: 4.4 },
  { id: 16, name: 'egg noodles', price: 70, category: 'Lunch', desc: 'Tasty stir fried egg noodles', rating: 4.5 },
  { id: 17, name: 'chicken noodles', price: 95, category: 'Lunch', desc: 'Spicy stir-fried noodles with chicken', rating: 4.7 },
  { id: 18, name: 'meals', price: 60, category: 'Lunch', desc: 'Full South Indian variety thali meal', rating: 4.8 },
  { id: 19, name: 'sambar rice', price: 35, category: 'Lunch', desc: 'Hot sambar rice with ghee', rating: 4.4 },
  { id: 20, name: 'curd rice', price: 30, category: 'Lunch', desc: 'Refreshing cool curd rice with pickle', rating: 4.7 },
  { id: 21, name: 'lemon rice', price: 35, category: 'Lunch', desc: 'Tangy and nutty lemon infused rice', rating: 4.3 },

  // Snacks (12)
  { id: 31, name: 'Bread chilli', price: 30, category: 'Snacks', desc: 'Deep fried bread cubes tossed in sauce', rating: 4.9 },
  { id: 32, name: 'samosa', price: 15, category: 'Snacks', desc: 'Crispy onion/potato samosa', rating: 4.6 },
  { id: 33, name: 'cutlet', price: 15, category: 'Snacks', desc: 'Spicy vegetable deep fried cutlet', rating: 4.4 },
  { id: 34, name: 'egg puffs', price: 15, category: 'Snacks', desc: 'Crispy puff pastry with egg filling', rating: 4.5 },
  { id: 35, name: 'mushroom puffs', price: 20, category: 'Snacks', desc: 'Crispy puff pastry with mushroom filling', rating: 4.6 },
  { id: 36, name: 'veg puffs', price: 15, category: 'Snacks', desc: 'Crispy puff pastry with mixed veg filling', rating: 4.4 },
  { id: 37, name: 'chicken puffs', price: 25, category: 'Snacks', desc: 'Crispy puff pastry with chicken filling', rating: 4.8 },
  { id: 38, name: 'cream bun', price: 15, category: 'Snacks', desc: 'Soft bun with sweet vanilla cream', rating: 4.5 },
  { id: 39, name: 'bun jam', price: 15, category: 'Snacks', desc: 'Soft bun with sweet fruit jam filling', rating: 4.6 },
  { id: 40, name: 'chips packets', price: 10, category: 'Snacks', desc: 'Crispy salted potato chips', rating: 4.3 },
  { id: 41, name: 'biscuits', price: 10, category: 'Snacks', desc: 'Popular biscuits pack', rating: 4.1 },
  { id: 42, name: 'milky bar', price: 20, category: 'Snacks', desc: 'Nestle white chocolate bar', rating: 4.7 },

  // Drinks (11)
  { id: 51, name: 'tea', price: 10, category: 'Drinks', desc: 'Hot ginger tea', rating: 4.5 },
  { id: 52, name: 'coffee', price: 15, category: 'Drinks', desc: 'Filter coffee', rating: 4.8 },
  { id: 53, name: 'Coffee 2', price: 15, category: 'Drinks', desc: 'Special milk coffee', rating: 4.7 },
  { id: 54, name: 'boost', price: 20, category: 'Drinks', desc: 'Energy drink with milk', rating: 4.6 },
  { id: 55, name: 'horlicks', price: 20, category: 'Drinks', desc: 'Malted milk drink', rating: 4.5 },
  { id: 56, name: 'badam milk', price: 25, category: 'Drinks', desc: 'Almond flavored milk drink', rating: 4.8 },
  { id: 57, name: 'lemon juice', price: 30, category: 'Drinks', desc: 'Fresh lemon juice', rating: 4.7 },
  { id: 58, name: 'Mullampalam', price: 35, category: 'Drinks', desc: 'Muskmelon fruit juice', rating: 4.7 },
  { id: 59, name: 'water bottle', price: 20, category: 'Drinks', desc: '1 Litre mineral water', rating: 4.9 },
  { id: 60, name: 'moutain dew', price: 20, category: 'Drinks', desc: 'Neon soda drink', rating: 4.4 },
  { id: 61, name: 'Sprite', price: 20, category: 'Drinks', desc: 'Lemon lime soda', rating: 4.3 },

  // Cakes (5)
  { id: 71, name: 'apple cake', price: 15, category: 'Cakes', desc: 'Fruity sponge cake', rating: 4.6 },
  { id: 72, name: 'Chocolate cake', price: 25, category: 'Cakes', desc: 'Rich cocoa cake slice', rating: 4.8 },
  { id: 73, name: 'Vennila cake', price: 20, category: 'Cakes', desc: 'Vanilla cream cake slice', rating: 4.5 },
  { id: 74, name: 'sponge cake', price: 12, category: 'Cakes', desc: 'Light and airy cake', rating: 4.4 },
  { id: 75, name: 'patry cake', price: 20, category: 'Cakes', desc: 'Creamy layered pastry', rating: 4.7 },

  // Stationery (7)
  { id: 81, name: 'pencil', price: 5, category: 'Stationery', desc: 'Writing pencil', rating: 4.5 },
  { id: 82, name: 'eraser', price: 5, category: 'Stationery', desc: 'Soft rubber eraser', rating: 4.4 },
  { id: 83, name: 'Sharpner', price: 5, category: 'Stationery', desc: 'Precise sharpener', rating: 4.3 },
  { id: 84, name: 'Scale', price: 10, category: 'Stationery', desc: '6 inch ruler', rating: 4.6 },
  { id: 85, name: 'Notes', price: 40, category: 'Stationery', desc: 'Single ruled notebook', rating: 4.7 },
  { id: 86, name: 'a4 sheets', price: 1, category: 'Stationery', desc: 'White copier paper', rating: 4.8 },
  { id: 87, name: 'record note', price: 80, category: 'Stationery', desc: 'College lab record', rating: 4.9 },
];
