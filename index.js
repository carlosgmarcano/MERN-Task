const express = require('express');
const conectarDB = require('./config/db');
const cors = require('cors');

//Crear el Servidor
const app = express();

//Conectar a la Base de Datos
conectarDB();

//Habilitar Cors
app.use(cors())

//Habilitar Express.JSON
app.use(express.json({ extended : true }));

//Puerto de la app
const port = process.env.port || 4000;

//Importar Rutas
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/proyectos', require('./routes/proyectos'));
app.use('/api/tareas', require('./routes/tareas'));

//arrancar la app
app.listen(port, '0.0.0.0', () => {
    console.log(`El servidor esta funcionando en el puerto ${port}`);
});