exports.up = (pgm) => {
  // songs.album_id → albums.album_id
  pgm.addConstraint(
    'songs',
    'fk_songs_album_id_albums',
    'FOREIGN KEY(album_id) REFERENCES albums(album_id) ON DELETE CASCADE',
  );

  // playlists.owner → users.id
  pgm.addConstraint(
    'playlists',
    'fk_playlists_owner_users',
    'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE',
  );

  // playlist_songs.playlist_id → playlists.id
  pgm.addConstraint(
    'playlist_songs',
    'fk_playlist_songs_playlist_id_playlists',
    'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE',
  );

  // playlist_songs.song_id → songs.song_id
  pgm.addConstraint(
    'playlist_songs',
    'fk_playlist_songs_song_id_songs',
    'FOREIGN KEY(song_id) REFERENCES songs(song_id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs_album_id_albums');
  pgm.dropConstraint('playlists', 'fk_playlists_owner_users');
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs_playlist_id_playlists');
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs_song_id_songs');
};
