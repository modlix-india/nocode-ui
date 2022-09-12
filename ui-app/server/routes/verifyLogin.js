import express from 'express';
import { auth } from '../middleware/auth.js';

const router = express.Router()

// middleware that is specific to this router
router.use(auth)
// define the home page route
router.get('/', (req, res) => {
  res.send({isAuthenticated: true})
})

export default router;