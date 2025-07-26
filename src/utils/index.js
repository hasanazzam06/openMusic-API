/* eslint-disable camelcase */
const mapDBToModelAlbum = ({
  album_id,
  name,
  year,
}) => ({
  id: album_id,
  name,
  year,
});

const mapDBToModelSong = ({
  song_id, title, year, genre, performer, duration, albumId,
}) => ({
  id: song_id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
});

// const mapDBModelPlaylist = ({

// })

module.exports = { mapDBToModelAlbum, mapDBToModelSong };
