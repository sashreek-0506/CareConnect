const express = require('express');
const router = express.Router();
const {
  listCategories, getCategory, createCategory, updateCategory, deleteCategory,
} = require('../controllers/category.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { categorySchema } = require('../validators/category.validator');

router.get('/', listCategories);
router.get('/:id', getCategory);
router.post('/', protect, requireRole('admin'), validate(categorySchema), createCategory);
router.patch('/:id', protect, requireRole('admin'), updateCategory);
router.delete('/:id', protect, requireRole('admin'), deleteCategory);

module.exports = router;
