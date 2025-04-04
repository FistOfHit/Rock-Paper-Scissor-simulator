module.exports = {
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js"],
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  transform: {},
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"]
};
