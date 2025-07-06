const nextJest = require('next/jest')
 
// Proporcionar la ruta a tu aplicación Next.js para cargar next.config.js y los archivos .env en tu entorno de prueba
const createJestConfig = nextJest({
  dir: './',
})
 
// Añade cualquier configuración personalizada que se pasará a Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest',
  moduleNameMapper: {
    // Manejar alias de módulos (esto es para que coincida con tsconfig.json)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
 
// createJestConfig se exporta de esta manera para asegurar que next/jest pueda cargar la configuración de Next.js que es asíncrona
module.exports = createJestConfig(customJestConfig)
