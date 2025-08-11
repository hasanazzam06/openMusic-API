/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class LikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addLike(albumId, userId) {
    const checkQuery = {
      text: 'SELECT id FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const checkResult = await this._pool.query(checkQuery);

    if (checkResult.rows.length > 0) {
      throw new InvariantError('Anda sudah menyukai album ini');
    }

    const id = `like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Like gagal ditambahkan');
    }

    await this._cacheService.delete(`likes:${albumId}`);

    return result.rows[0].id;
  }

  async deleteLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    await this._cacheService.delete(`likes:${albumId}`);

    if (!result.rows.length) {
      throw new InvariantError('Like gagal dihapus');
    }
  }

  async countLikes(albumId) {
    try {
      // mendapatkan catatan dari cache
      const result = await this._cacheService.get(`likes:${albumId}`);
      const { likes } = JSON.parse(result);
      return { likes, isFromCache: true };
    } catch (error) {
      const query = {
        text: 'SELECT id FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likes = result.rows.length;

      // catatan akan disimpan pada cache sebelum fungsi getNotes dikembalikan
      await this._cacheService.set(`likes:${albumId}`, JSON.stringify({ likes }));
      return { likes, isFromCache: false };
    }
  }
}

module.exports = LikesService;
