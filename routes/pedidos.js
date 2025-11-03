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

    //console.log(req.body)

    //const tipo_pedido = req.body.tipoPedido;
    const tipo_lista = req.body.tipo_lista;
    const idListapre = req.body.idListaPre;

    const sql = `
    SELECT articulo, idproducto, DesCorta, precio, '' AS cantidad
    FROM productos P, 
    rlipr L, 
    prod_turno R, 
    turnos T 
    WHERE P.idproducto=L.idproductos 
    AND R.idprodt=P.idproducto 
    AND R.idturp=T.idtur 
    AND T.turno LIKE ?
    AND L.idlistas= ?
    ORDER BY articulo;
    `;

    try {

        const [rows] = await pool.query(sql, [tipo_lista, idListapre]);

        //console.log(JSON.stringify(rows))

        res.send(rows)

    } catch (error) {

        console.error('Error en la consulta:', error);
        throw error;

    }
});


/* INSERT pedido */
router.post('/insertPedido', async (req, res) => {

    //Cabecera
    let idsuc = req.body.idsuc;
    let idusua = req.body.idusua;
    let tipoPedido = req.body.tipoPedido;
    let total = req.body.total;
    let estado = req.body.estado;

    //Detalle
    let registros = [];
    registros = JSON.parse(req.body.products);

    try {

        const now = new Date();

        // Obtener la fecha en formato 'YYYY-MM-DD'
        const fecha = now.toISOString().split('T')[0]; // ejemplo: '2025-10-08'

        // Obtener la hora en formato 'HH:MM:SS'
        const hora = now.toTimeString().split(' ')[0]; // ejemplo: '14:35:00'

        //---- INSERT Cabecera (ficha) ------
        //const valoresCab = `(${idsuc}, ${idusua}, '${fecha}', '${hora}', '${tipoPedido}', '${estado}', ${total})`;

        const valoresCab = `(${idsuc}, ${idusua}, 'CURRENT_DATE()', 'CURRENT_TIME()', '${tipoPedido}', '${estado}', ${total})`;

        const sql = `INSERT INTO fichas (idsucu, idusua, fecha, hora, tipo, estado, total) VALUES ${valoresCab};`;

        await pool.query(sql);
        console.log('Insert Ficha Finalizado')


        //---- OBTENGO ultimo ID cabecera ---
        const last_id = `SELECT idfichas FROM fichas ORDER BY idfichas DESC LIMIT 1`;
        const idfichas = await pool.query(last_id);


        //---- INSERT Detalle (ficha detalle) ----
        const valoresDet = registros.map(r =>
            `(${idfichas[0][0].idfichas}, '${r.idproducto}', ${r.cantidad}, ${r.precio}, ${r.cantidad * r.precio})`
        ).join(", ");

        const sql2 = `INSERT INTO fichadetalle (idfic, idprod, cantidad, precio, subtotal) VALUES ${valoresDet};`;

        await pool.query(sql2);
        console.log('Insert Ficha Detalle Finalizado');
        res.json('Insertado exitosamente')

        //-----------------------------------------

    } catch (error) {

        console.error('Error en la consulta:', error);
        throw error;

    }

});


module.exports = router;