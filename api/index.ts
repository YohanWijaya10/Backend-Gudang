import app from '../src/app'
import serverless from 'serverless-http'

// Wrap Express app for Vercel serverless functions
export default serverless(app)

