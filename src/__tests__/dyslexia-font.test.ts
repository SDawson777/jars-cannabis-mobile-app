import { DYSLEXIA_FONT_FAMILY } from '../theme/dyslexia-font';

describe('DYSLEXIA_FONT_FAMILY', () => {
  it('should be defined', () => {
    expect(DYSLEXIA_FONT_FAMILY).toBeDefined();
  });

  it('should be a string or undefined', () => {
    expect(['string', 'undefined']).toContain(typeof DYSLEXIA_FONT_FAMILY);
  });
});
