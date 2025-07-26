const Joi = require('joi');

const postPlaylistsPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const postSongsToPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const deleteSongsFromPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  postPlaylistsPayloadSchema,
  postSongsToPlaylistPayloadSchema,
  deleteSongsFromPlaylistPayloadSchema,
};
