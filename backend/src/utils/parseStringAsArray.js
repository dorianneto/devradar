module.exports = function parseStringAsArray(value) {
  return value.split(',').map(tech => tech.trim());
};
