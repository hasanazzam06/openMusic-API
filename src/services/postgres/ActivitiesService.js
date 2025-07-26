/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const autoBind = require('auto-bind');
const InvariantError = require('../../exceptions/InvariantError');

class ActivitiessService {
  constructor() {
    this._pool = new Pool();

    autoBind(this);
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('activities gagal ditambahkan');
    }
  }

  async getActivitiesByPlaylistId(playlistId) {
    const query = {
      text: `SELECT 
        users.username,
        songs.title,
        playlist_song_activities.action,
        playlist_song_activities.time
        FROM playlist_song_activities
        JOIN users ON playlist_song_activities.user_id = users.id
        JOIN songs ON playlist_song_activities.song_id = songs.song_id
        WHERE playlist_song_activities.playlist_id = $1 `,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ActivitiessService;
