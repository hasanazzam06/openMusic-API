const InvariantError = require('../../exceptions/InvariantError');
const { CoversHeadersSchema } = require('./schema');

const CoversValidator = {
  validateCoversHeaders: (headers) => {
    const validationResult = CoversHeadersSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CoversValidator;
