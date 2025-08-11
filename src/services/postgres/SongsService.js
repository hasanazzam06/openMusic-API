/* eslint-disable object-curly-newline */
/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapDBToModelSong } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const songId = `song_${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING song_id',
      values: [songId, title, year, genre, performer, duration, albumId],
    };
    // console.log('tes add song');
    const result = await this._pool.query(query);
    if (!result.rows[0].song_id) {
      throw new InvariantError('song gagal ditambahkan');
    }

    return result.rows[0].song_id;
  }

  async getSongs({ title, performer }) {
    let query = 'SELECT song_id, title, performer FROM songs';

    if (title !== undefined && performer !== undefined) {
      query = {
        text: `
          SELECT song_id, title, performer FROM songs 
          WHERE title ILIKE $1 AND performer ILIKE $2
        `,
        values: [`%${title}%`, `%${performer}%`],
      };
    } else if (title !== undefined) {
      query = {
        text: `
          SELECT song_id, title, performer FROM songs 
          WHERE title ILIKE $1
        `,
        values: [`%${title}%`],
      };
    } else if (performer !== undefined) {
      query = {
        text: `
          SELECT song_id, title, performer FROM songs 
          WHERE performer ILIKE $1
        `,
        values: [`%${performer}%`],
      };
    }
    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModelSong);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE song_id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukkan');
    }
    return result.rows.map(mapDBToModelSong)[0];
  }

  async getSongsByAlbumId(id) {
    const query = {
      text: 'SELECT song_id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModelSong);
  }

  async editSongById(id, { title, year, performer, genre, duration, albumId }) {
    // console.log('sini gak1');
    const query = {
      text: `
      UPDATE songs 
      SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6
      WHERE song_id = $7
      RETURNING song_id`,
      values: [title, year, genre, performer, duration, albumId, id],
    };
    const result = await this._pool.query(query);
    // console.log('sini gak---');
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui song, id tidak ada');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE song_id = $1 RETURNING song_id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui song, id tidak ada');
    }
  }

  async verifySongId(id) {
    const query = {
      text: 'SELECT song_id FROM songs WHERE song_id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('lagu tidak ditemukkan');
    }
  }

  async getSongsByPlaylistId(playlistId) {
    try {
      const result = await this._cacheService.get(`songs:${playlistId}`);
      const songs = JSON.parse(result);
      return { songs, isFromCache: true };
    } catch (error) {
      const query = {
        text: `
          SELECT songs.song_id, songs.title, songs.performer
          FROM playlist_songs
          JOIN songs ON songs.song_id = playlist_songs.song_id
          WHERE playlist_songs.playlist_id = $1`,
        values: [playlistId],
      };

      const result = await this._pool.query(query);
      const songs = result.rows.map(mapDBToModelSong);

      await this._cacheService.set(`songs:${playlistId}`, JSON.stringify(songs));
      return { songs, isFromCache: false };
    }
  }
}

module.exports = SongsService;
