const InvariantError = require('../../exceptions/InvariantError');
const { AlbumsPayloadSchema } = require('./schema');

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validateResult = AlbumsPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
};

module.exports = AlbumsValidator;
