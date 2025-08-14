const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();
require('dotenv').config();
const { insertarFicha } = require('../models/ficha');
const { insertarFichaDetalle } = require('../models/fichaDetalle');


/* GET pedidos */
router.post('/verpedidos', async (req, res) => {

    /*console.log(req.body.tipo_pedido)
    console.log(req.body.idusua)
    console.log(req.body.idsuc)*/

    const tipo_pedido = req.body.tipo_pedido;
    const idusua = JSON.parse(req.body.idusua);
    const idsuc = JSON.parse(req.body.idsuc);

    const sql = `
     SELECT f.idfichas, 'CABECERA' AS idfd, f.idsucu, f.idusua, us.usuario, f.fecha, f.hora, f.tipo, f.estado, f.total,
            '' AS idprod, '' AS cantidad, '' AS precio, '' AS subtotal, '' AS art, '' AS artDes
     FROM fichas f
     LEFT JOIN usuarios us ON f.idusua = us.iduser 
     WHERE f.tipo = ? AND f.idusua = ? AND f.idsucu = ?

     UNION

     SELECT f.idfichas, f_det.idfd, f.idsucu, f.idusua, us.usuario, f.fecha, f.hora, f.tipo, f.estado, f.total,
            f_det.idprod, f_det.cantidad, f_det.precio, f_det.subtotal, pr.articulo AS art, pr.DesCorta AS artDes
     FROM fichas f
     LEFT JOIN fichadetalle f_det ON f.idfichas = f_det.idfic
     LEFT JOIN usuarios us ON f.idusua = us.iduser 
     LEFT JOIN productos pr ON f_det.idprod = pr.idproducto
     WHERE f.tipo = ? AND f.idusua = ? AND f.idsucu = ?;
    `;

    try {

        const [rows] = await pool.query(sql, [tipo_pedido, idusua, idsuc, tipo_pedido, idusua, idsuc]);

        console.log(JSON.stringify(rows))

        res.send(rows)

    } catch (error) {

        console.error('Error en la consulta:', error);
        throw error;

    }
});


/* GET products list*/
router.post('/products', async (req, res) => {

    //const tipo_pedido = req.body.tipoPedido;
    const tipo_lista = req.body.tipo_lista;
    const idlistaprecio = req.body.idsuc;

    const sql = `
    SELECT articulo, DesCorta, precio, 0 AS cant
    FROM web.productos P, 
    web.rlipr L, 
    web.prod_turno R, 
    web.turnos T 
    WHERE P.idproducto=L.idproductos 
    AND R.idprodt=P.idproducto 
    AND R.idturp=T.idtur 
    AND T.turno LIKE ?
    AND L.idlistas= ?;
    `;

    try {

        const [rows] = await pool.query(sql, [tipo_lista , idlistaprecio]);

        res.send(rows)

    } catch (error) {

        console.error('Error en la consulta:', error);
        throw error;

    }
});

module.exports = router;