// models/fichaDetalle.model.js
const poo = require('../db');

async function insertarFichaDetalle(data) {
  const sql = `
    INSERT INTO ficha_detalle (
      idfd, idfic, idprod, cantidad, precio, subtotal
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await poo.query(sql, [
    data.idfd,
    data.idfic,
    data.idprod,
    data.cantidad,
    data.precio,
    data.subtotal
  ]);
  return result;
}

module.exports = { insertarFichaDetalle };
