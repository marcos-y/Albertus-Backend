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

        const [rows] = await pool.query(sql, [tipo_pedido, idusua, idsuc,tipo_pedido, idusua, idsuc]);

        console.log(JSON.stringify(rows))

        res.send(rows)

    } catch (error) {

        console.error('Error en la consulta:', error);
        throw error;

    }
})

router.post('/ficha', async (req, res) => {

    /*const ficha = req.body.ficha;
    const detalle = req.body.detalle;*/

    const idsucu = req.body.idsucu;
    const idusua = req.body.usua;
    const fecha = new Date();
    const Hora = req.body.Hora;
    const tipo = req.body.ipo;
    const estado = req.body.stado;
    const total = req.body.total;

    const idprod = req.body.idprod;
    const cantidad = req.body.cantidad;
    const precio = req.body.precio;
    const subtotal = req.body.subtotal;

    //--> una ficha tiene uno o muchos detalles

    const ficha = {
        //idfichas -> autoincrement,
        idsucu,
        idusua,
        fecha,
        Hora,
        tipo,
        estado,
        total
    }

    const detalle = {
        //idfd, -> id ficha detalle
        //idfic, -> id ficha
        idprod,
        cantidad,
        precio,
        subtotal
    }

    try {
        // Insertar ficha
        const resultFicha = await insertarFicha(ficha);

        // Insertar detalle (puedes pasar resultFicha.insertId como idfic si usas AUTO_INCREMENT)
        await insertarFichaDetalle({
            ...detalle,
            //idfic: ficha.idfichas  o resultFicha.insertId si AUTO_INCREMENT
        });

        res.status(201).json({ message: 'Ficha y detalle insertados correctamente.' });
    } catch (err) {
        console.error('Error al insertar:', err);
        res.status(500).json({ error: 'Error al insertar ficha o detalle.' });
    }
});

module.exports = router;