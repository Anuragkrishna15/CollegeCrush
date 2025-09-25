// Default list of popular cafes for blind dates
// Users can select from these or add their own custom location

export interface CafeOption {
    id: string;
    name: string;
    type: 'cafe' | 'restaurant' | 'park' | 'custom';
    description?: string;
}

export const DEFAULT_CAFES: CafeOption[] = [
    // Popular Cafe Chains
    { id: '1', name: 'Starbucks', type: 'cafe', description: 'Popular coffee chain' },
    { id: '2', name: 'Cafe Coffee Day', type: 'cafe', description: 'Indian coffee chain' },
    { id: '3', name: 'Costa Coffee', type: 'cafe', description: 'British coffee chain' },
    { id: '4', name: 'Barista', type: 'cafe', description: 'Coffee chain' },
    { id: '5', name: 'Tim Hortons', type: 'cafe', description: 'Canadian coffee chain' },
    
    // Restaurant Options
    { id: '6', name: 'McDonald\'s', type: 'restaurant', description: 'Fast food restaurant' },
    { id: '7', name: 'Subway', type: 'restaurant', description: 'Sandwich restaurant' },
    { id: '8', name: 'Pizza Hut', type: 'restaurant', description: 'Pizza restaurant' },
    { id: '9', name: 'Domino\'s', type: 'restaurant', description: 'Pizza delivery' },
    { id: '10', name: 'KFC', type: 'restaurant', description: 'Fried chicken restaurant' },
    
    // Popular Hangout Spots
    { id: '11', name: 'College Canteen', type: 'cafe', description: 'Campus dining' },
    { id: '12', name: 'Local Park', type: 'park', description: 'Outdoor meetup' },
    { id: '13', name: 'Food Court', type: 'restaurant', description: 'Multiple food options' },
    { id: '14', name: 'Tea Post', type: 'cafe', description: 'Tea and snacks' },
    { id: '15', name: 'Chaayos', type: 'cafe', description: 'Indian tea cafe' },
    
    // More Options
    { id: '16', name: 'Blue Tokai', type: 'cafe', description: 'Specialty coffee' },
    { id: '17', name: 'Third Wave Coffee', type: 'cafe', description: 'Artisan coffee' },
    { id: '18', name: 'Theobroma', type: 'cafe', description: 'Bakery and cafe' },
    { id: '19', name: 'Haldiram\'s', type: 'restaurant', description: 'Indian snacks' },
    { id: '20', name: 'Bikanervala', type: 'restaurant', description: 'Indian sweets and snacks' },
];

export const MEAL_TYPES = [
    'Coffee & Snacks',
    'Breakfast', 
    'Lunch',
    'Dinner',
    'Tea Time',
    'Dessert'
] as const;

export type MealType = typeof MEAL_TYPES[number];
