const Usuario = require('../models/Usuario');
const bcryptjs = require('bcryptjs');
const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');

exports.crearUsuario = async (req, res) => {

    //Revisar si hay errores
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({error: error.array()})
    }

    //extraer email y password
    const {email, password} = req.body;
    
    try {
        //Revisar que el usuario registrado sea unico
        let usuario = await Usuario.findOne({email});

        if(usuario) {
            return res.status(400).json({msg: 'El usuario ya existe'});
        }

        //crear el nuevo usuario
        usuario = new Usuario(req.body);

        //Hashear el password
        const salt = await bcryptjs.genSalt(10);
        usuario.password = await bcryptjs.hash(password, salt)

        //guardar usuario
        await usuario.save();

        //Crear y firmar el JWT
        const payload = {
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                admin : usuario.admin
            }
        };

        //Firmar el JWT
        jwt.sign(payload, process.env.SECRETA, {
            expiresIn: 3600 //Expira en 1 hora
        }, (error, token) => {
            if (error) throw error;
            //Mensaje de confirmacion
            res.json({token : token});
        })

    } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
    }
} 