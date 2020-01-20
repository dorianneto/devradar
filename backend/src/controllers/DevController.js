const axios = require('axios');
const DevModel = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket.js')

module.exports = {
  async index(request, response) {
    const devs = await DevModel.find();

    return response.json(devs);
  },
  async store(request, response) {
    const { github_username, techs, latitude, longitude } = request.body;

    let dev = await DevModel.findOne({ github_username });

    if (dev) {
      return response.json(dev);
    }

    const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);

    const { name = login, avatar_url, bio } = apiResponse.data;

    const techsArray = parseStringAsArray(techs);

    const location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    dev = await DevModel.create({
      github_username,
      name,
      avatar_url,
      bio,
      techs: techsArray,
      location,
    });

    const sendSocketMessage = findConnections(
      {latitude, longitude},
      techsArray,
    );

    sendMessage(sendSocketMessage, 'new-dev', dev);

    return response.json(dev);
  },
};
