/* eslint-disable no-underscore-dangle */
const autoBind = require('auto-bind');

class CoversHandler {
  constructor(storageService, albumsService, validator) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;

    autoBind(this);
  }

  async postCoversHandler(request, h) {
    // console.log('lalala');
    const { cover } = request.payload;
    // console.log(cover);
    const { id: playlistsId } = request.params;
    this._validator.validateCoversHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);

    await this._albumsService.addCoverUrl(playlistsId, filename);

    // const fileLocation = await this._albumsService.addCoverUrl(playlistsId, filename);
    // console.log(fileLocation);

    const response = h.response({
      status: 'success',
      message: 'cover berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = CoversHandler;
