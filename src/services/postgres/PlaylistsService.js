/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const autoBind = require('auto-bind');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(songsService, collaborationsService, activitiesService, cacheService) {
    this._pool = new Pool();
    this._songsService = songsService;
    this._collaborationsService = collaborationsService;
    this._activitiesService = activitiesService;
    this._cacheService = cacheService;

    autoBind(this);
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    // console.log(playlistId);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];
    // console.log(playlist);

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addPlaylist({ name, id }) {
    const playlistId = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [playlistId, name, id],
    };
    const result = await this._pool.query(query);
    // console.log('sini ga--ad');

    if (!result.rows[0].id) {
      throw new InvariantError('playlist gagal ditambahkan');
    }

    await this._cacheService.delete(`playlist:${id}`);

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    try {
      const result = await this._cacheService.get(`playlist:${owner}`);
      const playlists = JSON.parse(result);
      return { playlists, isFromCache: true };
    } catch (error) {
      const query = {
        text: `
        SELECT playlists.id, playlists.name, users.username
        FROM playlists
        LEFT JOIN users ON users.id = playlists.owner
        LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
        WHERE playlists.owner = $1 OR collaborations.user_id = $1
        GROUP BY playlists.id, users.username`,
        values: [owner],
      };

      const result = await this._pool.query(query);
      const playlists = result.rows;

      await this._cacheService.set(`playlist:${owner}`, JSON.stringify(playlists));
      return { playlists, isFromCache: false };
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING owner',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }

    const { owner } = result.rows[0];
    await this._cacheService.delete(`playlist:${owner}`);
  }

  async addSongsToPlaylist(playlistId, songId, userId) {
    await this._songsService.verifySongId(songId);

    const id = `playlist_songs-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('lagu gagal ditambahkan ke playlist');
    }

    const action = 'add';
    await this._activitiesService.addActivity(playlistId, songId, userId, action);
    await this._cacheService.delete(`songs:${playlistId}`);
  }

  async getPlaylistWithSongs(playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username 
      FROM playlists LEFT JOIN users ON users.id = playlists.owner 
      WHERE playlists.id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    // console.log('sini ga--ad');

    if (!result.rows.length) {
      throw new NotFoundError('playlist tidak ditemukkan');
    }

    const { songs, isFromCache } = await this._songsService.getSongsByPlaylistId(playlistId);

    const playlist = {
      ...result.rows[0],
      songs,
    };

    return {
      playlist,
      isFromCache,
    };
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    await this._songsService.verifySongId(songId);
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('lagu gagal dihapus dari playlist');
    }

    const action = 'delete';
    await this._activitiesService.addActivity(playlistId, songId, userId, action);
    await this._cacheService.delete(`songs:${playlistId}`);
  }

  async getPlaylistActivities(playlistId) {
    return this._activitiesService.getActivitiesByPlaylistId(playlistId);
  }
}

module.exports = PlaylistsService;
