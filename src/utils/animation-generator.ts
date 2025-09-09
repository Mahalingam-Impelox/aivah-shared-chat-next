/**
 * Available talking and expression animations
 */
const ANIMATIONS = [
  'M_Talking_Variations_001',
  'M_Talking_Variations_002',
  'M_Talking_Variations_003',
  'M_Talking_Variations_007',
  'M_Talking_Variations_009',
  'F_Talking_Variations_002',
  'M_Standing_Expressions_004',
  'M_Standing_Expressions_002',
  'M_Standing_Expressions_001',
  'M_Standing_Expressions_012',
  'M_Standing_Expressions_010',
  'M_Talking_Variations_005',
  'M_Talking_Variations_006'
];

/**
 * Available facial expressions (only those that are implemented in constants)
 */
const FACIAL_EXPRESSIONS = [
  'Neutral',
  'Smile',
  'Happy',
  'Confused',
  'Surprised',
  'Thoughtful',
  'Skeptical',
  'Relieved',
  'Intrigued',
  'Excited',
  'Shy',
  'Focused'
];

/**
 * Randomly generates animation and facial expression without LLM
 * @returns Object containing random animation and facial expression
 */
export function generateRandomAnimationAndExpression(): {
  animation: string;
  facialExpression: string;
} {
  return {
    animation: ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)],
    facialExpression: FACIAL_EXPRESSIONS[Math.floor(Math.random() * FACIAL_EXPRESSIONS.length)]
  };
}

/**
 * Generates only a random animation
 * @returns Random animation name
 */
export function generateRandomAnimation(): string {
  return ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)];
}

/**
 * Generates only a random facial expression
 * @returns Random facial expression name
 */
export function generateRandomFacialExpression(): string {
  return FACIAL_EXPRESSIONS[Math.floor(Math.random() * FACIAL_EXPRESSIONS.length)];
}

/**
 * Gets all available animations
 * @returns Array of all available animation names
 */
export function getAvailableAnimations(): string[] {
  return [...ANIMATIONS];
}

/**
 * Gets all available facial expressions
 * @returns Array of all available facial expression names
 */
export function getAvailableFacialExpressions(): string[] {
  return [...FACIAL_EXPRESSIONS];
}
