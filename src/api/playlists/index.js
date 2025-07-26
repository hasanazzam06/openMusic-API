const PlaylistHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlist',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const playlistHandler = new PlaylistHandler(service, validator);
    // console.log('tes-index-playlist');
    server.route(routes(playlistHandler));
  },
};
