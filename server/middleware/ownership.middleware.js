const ApiError = require('../utils/ApiError');

// Generic ownership check: fetches a document, confirms req.user is one of the
// "owner" fields on it (or has an override role), and stashes it on req.resource
// so the controller doesn't have to re-fetch it.
//
// getModel: () => MongooseModel
// ownerFields: array of field names on the document that count as "owner" (compared to req.user._id)
// overrideRoles: roles that bypass the ownership check entirely (e.g. admin, ops)
function requireOwnership(getModel, ownerFields, overrideRoles = ['admin']) {
  return async (req, res, next) => {
    if (overrideRoles.includes(req.user.role)) return next();

    const Model = getModel();
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      throw new ApiError(404, 'Resource not found.');
    }

    const isOwner = ownerFields.some((field) => {
      const value = doc[field];
      if (!value) return false;
      return value.toString() === req.user._id.toString();
    });

    if (!isOwner) {
      throw new ApiError(403, 'You do not have access to this resource.');
    }

    req.resource = doc;
    next();
  };
}

module.exports = { requireOwnership };
