jest.mock('@aws-amplify/analytics', () => ({ record: jest.fn() }));
jest.mock('aws-amplify', () => ({ Analytics: { record: jest.fn() } }));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
