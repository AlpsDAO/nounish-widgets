import express from 'express'
import nounsController from '../controllers/nouns'
import lilNounsController from '../controllers/lilnouns'
import alpsController from '../controllers/alps'

const router = express.Router()

router.get('/nouns', nounsController.getNounsData)
router.get('/lil-nouns', lilNounsController.getLilNounsData)
router.get('/alps', alpsController.getAlpsData)

export = router
