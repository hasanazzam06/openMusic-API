/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongsHandler(request, h) {
    // const { name, year } = request.payload;
    // console.log('tes routes post');
    this._validator.validateSongPayload(request.payload);
    const songId = await this._service.addSong(request.payload);
    const response = h.response({
      status: 'success',
      message: 'Catatan berhasil ditambahkan',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongHandler(request, h) {
    // console.log(request.query);
    // const { title, performer } = request.query;
    // console.log(title);
    // console.log(performer);
    const songs = await this._service.getSongs(request.query);
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;

    const song = await this._service.getSongById(id);

    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;
    // console.log('sini gak');
    await this._service.editSongById(id, request.payload);
    // console.log('sini gak');
    return {
      status: 'success',
      message: 'Song berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteSongById(id);
    return {
      status: 'success',
      message: 'Song berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
