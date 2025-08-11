const CoversHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'covers',
  version: '1.0.0',
  register: async (server, { storageService, albumsService, validator }) => {
    const coversHandler = new CoversHandler(storageService, albumsService, validator);
    server.route(routes(coversHandler));
  },
};
