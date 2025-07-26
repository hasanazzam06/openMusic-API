/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('playlist_songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // Mencegah lagu yang sama masuk dua kali ke playlist yang sama
  pgm.addConstraint(
    'playlist_songs',
    'unique_playlist_and_song',
    'UNIQUE(playlist_id, song_id)',
  );

  // FOREIGN KEY ke tabel playlists
  // pgm.addConstraint(
  //   'playlist_songs',
  //   'fk_playlist_songs.playlist_id_playlists.id',
  //   'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE',
  // );

  // // FOREIGN KEY ke tabel songs
  // pgm.addConstraint(
  //   'playlist_songs',
  //   'fk_playlist_songs.song_id_songs.id',
  //   'FOREIGN KEY(song_id) REFERENCES songs(song_id) ON DELETE CASCADE',
  // );
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_songs');
};
