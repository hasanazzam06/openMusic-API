/* eslint-disable function-paren-newline */
const LikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likes',
  version: '1.0.0',
  register: async (server, {
    likesService, albumsService, usersService,
  }) => {
    const likesHandler = new LikesHandler(
      likesService, albumsService, usersService,
    );
    server.route(routes(likesHandler));
  },
};
