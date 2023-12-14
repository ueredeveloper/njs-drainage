/**
* Conversão do polígono para o formato de busca no banco postgres. Não esqueça de adicionar o SRID.
  * @param polygon {object[]}
  * @returns {string} Exemplo de retorno: ''SRID=4674;POLYGON((0 0, 8 0, 4 4, 0 0))'
  */
exports.convertionPolygonToPostgis = function(polygon) {

  let _polygon = JSON.stringify(polygon);
  _polygon = _polygon.replaceAll('[[', '');
  _polygon = _polygon.replaceAll(',', ' ');
  _polygon = _polygon.replaceAll('] [', ',');
  _polygon = _polygon.replaceAll(']]', '');

  _polygon = 'SRID=4674;POLYGON((' + _polygon + '))';

  return _polygon;
}

exports.insertPolygonIntoSupabase = function(polygonCoordinates) {
  const polygonText = polygonCoordinates.map(coords => coords.join(' ')).join(', ');
  const polygonWKT = `SRID=4674;POLYGON((${polygonText}))`;

  return polygonWKT;
}