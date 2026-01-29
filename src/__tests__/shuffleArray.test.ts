import { shuffleArray } from '../services/quizService';

describe('quizService utils', () => {
  describe('shuffleArray', () => {
    it('returns a new array with same length', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);

      expect(shuffled).toHaveLength(original.length);
      expect(shuffled).not.toBe(original); // New array reference
    });

    it('contains all original elements', () => {
      const original = ['a', 'b', 'c', 'd'];
      const shuffled = shuffleArray(original);

      expect(shuffled.sort()).toEqual(original.sort());
    });

    it('does not modify the original array', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];

      shuffleArray(original);

      expect(original).toEqual(originalCopy);
    });

    it('handles empty array', () => {
      const result = shuffleArray([]);
      expect(result).toEqual([]);
    });

    it('handles single element array', () => {
      const result = shuffleArray([42]);
      expect(result).toEqual([42]);
    });

    it('produces different orders on multiple calls (probabilistic)', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results = new Set<string>();

      // Run shuffle 10 times - should produce at least 2 different orders
      for (let i = 0; i < 10; i++) {
        const shuffled = shuffleArray(original);
        results.add(JSON.stringify(shuffled));
      }

      // With 10 elements, getting the same order multiple times is extremely unlikely
      expect(results.size).toBeGreaterThan(1);
    });

    it('works with different data types', () => {
      const numbers = shuffleArray([1, 2, 3]);
      const strings = shuffleArray(['one', 'two', 'three']);
      const objects = shuffleArray([{ id: 1 }, { id: 2 }]);

      expect(numbers).toHaveLength(3);
      expect(strings).toHaveLength(3);
      expect(objects).toHaveLength(2);
      expect(objects.map(o => o.id).sort()).toEqual([1, 2]);
    });
  });
});
