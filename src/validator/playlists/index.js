const InvariantError = require('../../exceptions/InvariantError');
const {
  postPlaylistsPayloadSchema,
  postSongsToPlaylistPayloadSchema,
  deleteSongsFromPlaylistPayloadSchema,
} = require('./schema');

const PlaylistsValidator = {
  validatePostPlaylistPayload: (payload) => {
    const validateResult = postPlaylistsPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
  validatePostSongsToPlaylistPayload: (payload) => {
    const validateResult = postSongsToPlaylistPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },

  validateDeleteSongsFromPlaylistPayload: (payload) => {
    const validateResult = deleteSongsFromPlaylistPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;
