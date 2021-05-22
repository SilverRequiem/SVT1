const express = require('express');
const router = express.Router();
const aws = require('aws-sdk');
const pool = require('../database');


const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');


router.get('/upload', isLoggedIn, (req, res) => {
    res.render('files/upload');

});


router.get('/uploads/:ext', isLoggedIn,  async(req,res) => {
  console.log(req.params.ext);
  aws.config.update({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-2',
    signatureVersion: 'v4',

  })
      const s3 = new aws.S3();
      const post = await s3.createPresignedPost({
        Bucket: 'revision-tesis-bucket',
        Fields: {
          key: Date.now() + "."+ req.params.ext,
        },
        ACL : 'public-read-write',
        Expires: 60, // seconds
        Conditions: [
          ['content-length-range', 0, 1048576], // up to 1 MB
        ],
      });
      const newDoc = {
        NombreDoc: post.fields.key,
        url: post.url + "/" +  post.fields.key,
        id_alumno: req.user.ID


    };
      await pool.query('INSERT INTO documentos set ?', [newDoc] );
      res.json(post);

});

router.get('/files/list', isLoggedIn, async (req,res) =>{
  const documentos = await pool.query ('SELECT * FROM documentos WHERE id_alumno = ?', [req.user.ID]); 
  res.render('files/list', {documentos});
});

router.get('/files/delete/:id', isLoggedIn, async (req,res) => {
  const {id} = req.params;
  await pool.query('DELETE FROM documentos WHERE DocID = ?', [id]);
  req.flash('success', 'Documento eliminado correctamente');
  res.redirect('/files/list');
});

module.exports = router;
