const ServiceCategory = require('../models/ServiceCategory');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { logAction } = require('../services/auditLogger');

const listCategories = asyncHandler(async (req, res) => {
  const filter = req.query.includeInactive === 'true' ? {} : { isActive: true };
  const categories = await ServiceCategory.find(filter).sort({ name: 1 });
  sendResponse(res, 200, { categories }, 'Categories fetched.');
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found.');
  sendResponse(res, 200, { category }, 'Category fetched.');
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.create(req.body);
  await logAction(req.user._id, 'create_category', 'ServiceCategory', category._id, req.body);
  sendResponse(res, 201, { category }, 'Category created.');
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new ApiError(404, 'Category not found.');
  await logAction(req.user._id, 'update_category', 'ServiceCategory', category._id, req.body);
  sendResponse(res, 200, { category }, 'Category updated.');
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) throw new ApiError(404, 'Category not found.');
  await logAction(req.user._id, 'deactivate_category', 'ServiceCategory', category._id);
  sendResponse(res, 200, { category }, 'Category deactivated.');
});

module.exports = { listCategories, getCategory, createCategory, updateCategory, deleteCategory };
