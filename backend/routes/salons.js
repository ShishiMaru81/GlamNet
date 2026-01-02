const express = require('express');
const {
  getSalons,
  getSalon,
  createSalon,
  updateSalon,
  getFeaturedSalons,
  getSalonBarbers
} = require('../controllers/salonController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/featured', getFeaturedSalons);
router.get('/', getSalons);
router.get('/:id/barbers', getSalonBarbers);
router.get('/:id', getSalon);
router.post('/', protect, authorize('admin', 'salon_staff', 'salon'), createSalon);
router.put('/:id', protect, updateSalon);

module.exports = router;


