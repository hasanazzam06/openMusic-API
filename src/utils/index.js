/* eslint-disable camelcase */
const mapDBToModelAlbum = ({
  album_id,
  name,
  year,
  cover_url,
}) => ({
  id: album_id,
  name,
  year,
  coverUrl: cover_url,
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
