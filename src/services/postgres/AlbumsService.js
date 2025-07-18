/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const autoBind = require('auto-bind');
const { mapDBToModelAlbum } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const SongsService = require('./SongsService');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
    this._songService = new SongsService();

    autoBind(this);
  }

  async addAlbum({ name, year }) {
    const albumId = `album_${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING album_id',
      values: [albumId, name, year],
    };
    // console.log('tes add album');
    const result = await this._pool.query(query);
    // gak nyampe disini
    // console.log('tes add album');
    // console.log(result);
    if (!result.rows[0].album_id) {
      throw new InvariantError('album gagal ditambahkan');
    }

    return result.rows[0].album_id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE album_id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukkan');
    }
    const songs = await this._songService.getSongsByAlbumId(id);
    return {
      ...result.rows.map(mapDBToModelAlbum)[0],
      songs,
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE album_id = $3 RETURNING album_id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album, id tidak ada');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE album_id = $1 RETURNING album_id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
