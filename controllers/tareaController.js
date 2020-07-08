const Tarea = require('../models/Tarea');
const Proyecto = require('../models/Proyecto');
const {validationResult} = require('express-validator');

//Crea una nueva Tarea
exports.crearTarea = async (req, res) => {
    //Revisar si hay errores
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({errores: errores.array()})
    }
    
    try {
        //Extraer el proyecto y comprobar si existe
        const {proyecto} = req.body

        const proyectoActual = await Proyecto.findById(proyecto);
        if(!proyectoActual) {
            return res.status(404).json({msg: 'Proyecto no encontrado'})
        }
        //Verificar el creador del proyecto
        if(proyectoActual.creador.toString() !== req.usuario.id) {
            return res.status(401).json({msg: 'No autorizado'})
        }
        //Creamos la tarea
        const tarea = new Tarea(req.body);
        await tarea.save();
        res.json({tarea});
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}

//Obtiene las tareas opr proyecto
exports.obtenerTareas = async (req, res) => {
    try {
        //Extraer el proyecto y comprobar si existe
        const {proyecto} = req.query
        
        const proyectoActual = await Proyecto.findById(proyecto);
        if(!proyectoActual) {
            return res.status(404).json({msg: 'Proyecto no encontrado'})
        }
        //Verificar el creador del proyecto
        if(proyectoActual.creador.toString() !== req.usuario.id) {
            return res.status(401).json({msg: 'No autorizado'})
        }
        //Obtener las tareas por proyecto
        const tareas = await Tarea.find({proyecto : proyecto}).sort({creado: -1});
        res.json({tareas})
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error')
    }
}

//Actualizar una tarea
exports.actualizarTarea = async (req, res) => {
    try {
        //Extraer el proyecto y comprobar si existe
        const {proyecto, nombre, estado} = req.body
        
        //Si la tarea existe
        let tareaActual = await Tarea.findById(req.params.id);
        if (!tareaActual) {
            return res.status(404).json({msg: 'No existe esa Tarea'})
        }

        //Extraer proyecto
        const proyectoActual = await Proyecto.findById(proyecto);
        
        //Verificar el creador del proyecto
        if(proyectoActual.creador.toString() === req.usuario.id || req.usuario.admin) {
            
            //Crear un objeto con la nueva informacion
            const nuevaTarea = {};
            nuevaTarea.nombre = nombre;

            if (req.usuario.admin) nuevaTarea.estado = estado;
            else return res.status(401).json({msg: 'No autorizado a cambiar estado'})

            //Guardar la tarea
            tareaActual = await Tarea.findOneAndUpdate({_id: req.params.id}, nuevaTarea, {new: true})
        } else {
            return res.status(401).json({msg: 'No autorizado'})
        }

        res.json({tareaActual})
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error')
    }
}

//Elimina una tarea
exports.eliminarTarea = async (req, res) => {
    try {
        //Extraer el proyecto y comprobar si existe
        const {proyecto} = req.query;
        
        //Si la tarea existe
        let tareaActual = await Tarea.findById(req.params.id);
        
        if (!tareaActual) {
            return res.status(404).json({msg: 'No existe esa Tarea'})
        }

        //Extraer proyecto
        const proyectoActual = await Proyecto.findById(proyecto);
        
        //Verificar el creador del proyecto
        if(proyectoActual.creador.toString() === req.usuario.id || req.usuario.admin) {
            //Eliminar
            await Tarea.findOneAndRemove({_id: req.params.id})
        } else {
            return res.status(401).json({msg: 'No autorizado 22'})
        }
        res.json({msg: 'Tarea Eliminada'})
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error')
    }
}