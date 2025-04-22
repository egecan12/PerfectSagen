/**
 * Calculate the Levenshtein distance between two strings
 * This measures how many single character edits are needed
 * to transform one string into the other
 */
export const levenshteinDistance = (a: string, b: string): number => {
  // Create a matrix of dimensions (a.length+1) x (b.length+1)
  const matrix: number[][] = [];
  
  // Initialize the first row
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  
  // Initialize the first column
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill in the rest of the matrix
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[a.length][b.length];
};

/**
 * Normalize German text for comparison
 * - Convert to lowercase
 * - Remove punctuation
 * - Normalize special characters
 * - Trim whitespace
 */
export const normalizeGermanText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Calculate pronunciation accuracy percentage
 * @param spoken The text spoken by the user
 * @param expected The expected correct text
 * @returns A number between 0 and 100 representing accuracy percentage
 */
export const calculateAccuracy = (spoken: string, expected: string): number => {
  const normalizedSpoken = normalizeGermanText(spoken);
  const normalizedExpected = normalizeGermanText(expected);
  
  if (normalizedExpected.length === 0) return 0;
  
  // Get the distance
  const distance = levenshteinDistance(normalizedSpoken, normalizedExpected);
  
  // Calculate similarity as a percentage
  // 100% minus the ratio of distance to expected word length
  const maxLength = Math.max(normalizedSpoken.length, normalizedExpected.length);
  const accuracy = Math.max(0, 100 - (distance / maxLength) * 100);
  
  // Round to the nearest integer
  return Math.round(accuracy);
};

/**
 * Get feedback based on accuracy score
 */
export const getFeedback = (accuracy: number): string => {
  if (accuracy >= 90) return 'Excellent!';
  if (accuracy >= 75) return 'Very good!';
  if (accuracy >= 60) return 'Good effort!';
  if (accuracy >= 40) return 'Keep practicing!';
  return 'Try again!';
}; 