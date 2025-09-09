// Minimal mock that mirrors the API used by jest's react-native mock
module.exports = {
  __esModule: true,
  default: {
    // jest.mock replacement that accepts module refs or strings
    mock: (moduleName, factory) => {
      if (typeof moduleName === 'string') {
        return jest.mock(moduleName, factory);
      }
      // moduleName sometimes comes as moduleRef like 'm#ModuleName'
      const name = String(moduleName).replace(/^m#/, '');
      return jest.mock(name, factory);
    }
  }
};
