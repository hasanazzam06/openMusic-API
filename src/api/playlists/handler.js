/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({ name, id: credentialId });
    // console.log('sini ga--');

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { playlists, isFromCache } = await this._service.getPlaylists(credentialId);

    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });

    if (isFromCache) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId);

    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongsToPlaylistHandler(request, h) {
    this._validator.validatePostSongsToPlaylistPayload(request.payload);
    // console.log(request.payload);
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    await this._service.addSongsToPlaylist(playlistId, songId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistWithSongsHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    const { playlist, isFromCache } = await this._service.getPlaylistWithSongs(playlistId);

    const response = h.response({
      status: 'success',
      data: {
        playlist,
      },
    });

    if (isFromCache) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }

  async deleteSongsFromPlaylistHandler(request, h) {
    this._validator.validateDeleteSongsFromPlaylistPayload(request.payload);
    const { songId } = request.payload;

    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    await this._service.deleteSongFromPlaylist(playlistId, songId, credentialId);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari Playlist',
    };
  }

  async getPlaylistActivitiesHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    const { activities, isFromCache } = await this._service.getPlaylistActivities(playlistId);

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    });

    if (isFromCache) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }
}

module.exports = PlaylistsHandler;
