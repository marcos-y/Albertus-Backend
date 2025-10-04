const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();
require('dotenv').config();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

//--Registro--
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash]);
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//--Login-- (datos USER que vienen desde el FRONTEND)
router.post('/login', async (req, res) => {

  console.log('User logueado:')
  console.log(req.body)

  const { usuario, contra } = req.body;

  /*
  const [rows] = await pool.query('SELECT ' +
    'US.iduser, ' +
    'US.usuario, ' +
    'US.contra, ' +
    'US.borra_usu, ' +
    'US.tipo, ' +
    'US.hacepedido, ' +
    'US.vercc, ' +
    'USU_SUCU.idusu, ' +
    'USU_SUCU.idsuc, ' +
    'SUC.idlistaprecio ' +
    'from ' +
    'usuarios US ' +
    'LEFT JOIN USU_SUCU ON USU_SUCU.idusu = US.iduser ' +
    'LEFT JOIN SUCURSALES SUC ON SUC.idSuc = USU_SUCU.idsuc ' +
  'WHERE US.usuario = ? AND US.contra = ?'
  */

   const [rows] = await pool.query('select ' +
    'us.iduser, ' +
    'us.usuario, ' +
    'us.contra, ' +
    'us.borra_usu, ' +
    'us.tipo, ' +
    'us.hacepedido, ' +
    'us.vercc, ' +
    'usu_sucu.idusu, ' +
    'usu_sucu.idsuc, ' +
    'suc.idlistaprecio ' +
    'from ' +
    'usuarios us ' +
    'left join usu_sucu on usu_sucu.idusu = us.iduser ' +
    'left join sucursales suc on suc.idsuc = usu_sucu.idsuc ' +
  'where us.usuario = ? and us.contra = ?', [usuario,contra]);

  const user = rows;

  if( user.length > 0 ){
    console.log('logueado correctamente')
    res.send(user)
  }else{
    res.status(401).json({ error: 'Credenciales incorrectas' });
  }
});

module.exports = router;