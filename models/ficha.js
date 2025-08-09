// models/ficha.model.js
const poo = require('../db');

async function insertarFicha(data) {
  const sql = `
    INSERT INTO fichas (
      idfichas, idsucu, idusua, fecha, Hora, tipo, estado, total
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await poo.query(sql, [
    data.idfichas,
    data.idsucu,
    data.idusua,
    data.fecha,
    data.Hora,
    data.tipo,
    data.estado,
    data.total
  ]);
  return result;
}

module.exports = { insertarFicha };
