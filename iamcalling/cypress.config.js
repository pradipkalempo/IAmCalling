module.exports = {
  e2e: {
    baseUrl: 'http://localhost:1000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    supportFile: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
}