/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
const autoBind = require('auto-bind');

class LikesHandler {
  constructor(likesService, albumsService, usersService) {
    this._likesService = likesService;
    this._albumsService = albumsService;
    this._usersService = usersService;

    autoBind(this);
  }

  async postLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._usersService.verifyUserId(credentialId);
    await this._albumsService.verifyAlbumId(albumId);

    const likeId = await this._likesService.addLike(albumId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'likes berhasil ditambahkan',
    });
    response.code(201);
    return response;
  }

  async deleteLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._usersService.verifyUserId(credentialId);
    await this._albumsService.verifyAlbumId(albumId);

    await this._likesService.deleteLike(albumId, credentialId);

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }

  async getLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const { likes, isFromCache } = await this._likesService.countLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    if (isFromCache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }
}

module.exports = LikesHandler;
