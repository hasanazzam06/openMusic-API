exports.shorthands = undefined;

exports.up = (pgm) => {
  // membuat table collaborations
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  /*
    Menambahkan constraint UNIQUE, kombinasi dari kolom note_id dan user_id.
    Guna menghindari duplikasi data antara nilai keduanya.
  */
  pgm.addConstraint('user_album_likes', 'unique_album_id_and_user_id', 'UNIQUE(album_id, user_id)');

  // memberikan constraint foreign key pada kolom note_id dan user_id terhadap notes.id dan users.id
  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.album_id_albums.album_id', 'FOREIGN KEY(album_id) REFERENCES albums(album_id) ON DELETE CASCADE');
  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // menghapus tabel collaborations
  pgm.dropTable('user_album_likes');
};
