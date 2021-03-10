const express = require('express');
const { rawListeners } = require('../database');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', isLoggedIn, (req, res) =>{
    res.render('links/add')
});

router.post('/add', isLoggedIn, async (req,res) =>{
    const { titulo, descripcion } = req.body;
    const newChange = {
        titulo,
        descripcion,
        id_alumno: req.user.ID

    };
    await pool.query('INSERT INTO cambios set ?', [newChange]);
    req.flash('success', 'Se ha guardado correctamente');
    res.redirect('/links')
});

router.get('/', isLoggedIn, async (req,res) =>{
    const cambios = await pool.query ('SELECT * FROM cambios WHERE id_alumno = ?', [req.user.ID]); 
    res.render('links/list', {cambios});
});

router.get('/delete/:id', isLoggedIn, async (req,res) => {
    const {id} = req.params;
    await pool.query('DELETE FROM cambios WHERE id = ?', [id]);
    req.flash('success', 'Nota removida correctamente');
    res.redirect('/links');
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const {id} = req.params;
    const cambios = await pool.query('SELECT * FROM cambios WHERE id = ?', [id]);
    res.render('links/edit', {cambios: cambios[0]});
    
});

router.post('/edit/:id',isLoggedIn, async (req, res) => {
    const {id} = req.params;
    const {titulo, descripcion} = req.body;
    const newCambio = {
        titulo,
        descripcion
    };
    await pool.query('UPDATE cambios set ? where id = ?', [newCambio, id]);
    req.flash('success', 'Se ha editado correctamente');
    res.redirect('/links');
});
module.exports = router;