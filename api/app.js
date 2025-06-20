const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
app.use(express.json());
const { ObjectId } = require('mongodb'); 

// Configura la conexión a MongoDB
const uri = "mongodb+srv://ialfper:ialfper21@alumnos.zoinj.mongodb.net/alumnos?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Función para conectar a la base de datos y obtener las colecciones
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB Atlas");
    const db = client.db('hospital');
    return {
      login: db.collection('usuarios'),
      citas: db.collection('citas'),
      pacientes: db.collection('pacientes'),
      especialistas: db.collection('especialista')
    };
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    throw new Error('Error al conectar a la base de datos');
  }
}

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Endpoint GET para obtener usuarios
app.get('/api/users', async (req, res) => {
  try {
    const { login } = await connectToMongoDB();
    const lista_login = await login.find().toArray();
    console.log("Usuarios obtenidos:", lista_login);
    res.json(lista_login);
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// Endpoint GET para obtener citas
app.get('/api/citas', async (req, res) => {
  try {
    const { citas } = await connectToMongoDB();
    const lista_citas = await citas.find().toArray();
    res.json(lista_citas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las citas' });
  }
});

// Endpoint GET para obtener pacientes
app.get('/api/pacientes', async (req, res) => {
  try {
    const { pacientes } = await connectToMongoDB();
    const lista_pacientes = await pacientes.find().toArray();
    res.json(lista_pacientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los pacientes' });
  }
});




// Endpoint GET para obtener especialistas
app.get('/api/especialistas', async (req, res) => {
  try {
    const { especialistas } = await connectToMongoDB();
    const lista_especialistas = await especialistas.find().toArray();
    res.json(lista_especialistas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los especialistas' });
  }
});

// parte para encontrar al usuario del login
app.post('/api/checkLogin', async (req, res) => {
  try {
    const { nombre, password } = req.body;

    // Conectar a la base de datos y acceder a la colección
    const { login } = await connectToMongoDB();

    // Buscar al usuario por nombre y contraseña
    const usuarioEncontrado = await login.findOne({ usuario: nombre, contra: password });

    if (usuarioEncontrado) {
      const rol = usuarioEncontrado.rol;
      if (rol === "admin") {
        res.json({ mensaje: "Bienvenido administrador", rol: "admin" });
      } else if (rol === "administrativo") {
        res.json({ mensaje: "Bienvenido administrativo", rol: "administrativo"});
      } else {
        res.status(400).json({ mensaje: "Rol no reconocido" });
      }
    } else {
      res.status(401).json({ mensaje: "Nombre o contraseña incorrecta" });
    }

  } catch (error) {
    console.error("Error en checkLogin:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }

});


// Endpoint POST para crear un nuevo especialista
app.post('/api/crearEspecialistas', async (req, res) => {
  try {
    const { username, apellido, direccion, especialidad } = req.body;

    // Validación básica
    if (!username || !apellido || !direccion || !especialidad) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    // Conectar a la base de datos y acceder a la colección
    const { especialistas } = await connectToMongoDB();

    // Crear el nuevo especialista
    const nuevoEspecialista = {
      username,
      apellido,
      direccion,
      especialidad
    };

    await especialistas.insertOne(nuevoEspecialista);

    res.status(201).json({ mensaje: "Especialista creado correctamente" });
  } catch (error) {
    console.error("Error al crear el especialista:", error);
    res.status(500).json({ mensaje: "Error al crear el especialista" });
  }
});

app.post('/api/crearPaciente', async (req, res) => {
  try {
    const { usernamePaciente, apellidoPaciente, direccionPaciente, telefonoPaciente } = req.body;

    // Validación básica
    if (!usernamePaciente || !apellidoPaciente || !direccionPaciente || !telefonoPaciente) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    // Conectar a la base de datos y acceder a la colección
    const { pacientes } = await connectToMongoDB();

    // Crear el nuevo especialista
    const nuevoPaciente = {
      nombre: usernamePaciente,
      apellido: apellidoPaciente,
      direccion: direccionPaciente,
      telefono: telefonoPaciente
    };

    await pacientes.insertOne(nuevoPaciente);

    res.status(201).json({ mensaje: "Especialista creado correctamente" });
  } catch (error) {
    console.error("Error al crear el especialista:", error);
    res.status(500).json({ mensaje: "Error al crear el especialista" });
  }
});

/*ASIGNAR CITA LA PACIENTE */

app.post('/api/asignarCita', async (req, res) => {
  try {
    const citaPaciente = req.body;


    const { citas } = await connectToMongoDB();

    const junto = citaPaciente.nombre + " " + citaPaciente.apellido;
    const nuevaCita = {
      codigoPaciente: citaPaciente.codigoPaciente,
      Paciente: junto,
      fecha: citaPaciente.fecha,
      asistio: "pendiente"
    };

    await citas.insertOne(nuevaCita);

    res.status(201).json({ mensaje: 'Cita asignada correctamente', cita: nuevaCita });

  } catch (error) {
    console.error("Error al asignar la cita:", error);
    res.status(500).json({ mensaje: 'Error al asignar la cita' });
  }
});

/*api para ver las citas del paciente */
app.post('/api/vercitaspaciente', async (req, res) => {
  try {
    const { id } = req.body;
    const { citas } = await connectToMongoDB();
    /*buscar las citas por el id del codigo paciente*/
    const citasPaciente = await citas.find({ codigoPaciente: id }).toArray();

    res.status(200).json(citasPaciente); 
  } catch (error) {
    console.error("Error al obtener las citas:", error);
    res.status(500).json({ mensaje: 'Error al obtener las citas del paciente' });
  }
});

// Asegúrate de importar ObjectId si usas MongoDB




app.put('/api/citas/:id', async (req, res) => {
    try {
        const { id } = req.params; // Obtiene el ID de la URL
        const { asistio } = req.body; // Obtiene el nuevo estado de 'asistio' del cuerpo

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ mensaje: 'ID de cita inválido.' });
        }

        const { citas } = await connectToMongoDB(); // Tu función para conectar a la DB

        const resultado = await citas.updateOne(
            { _id: new ObjectId(id) }, // Busca la cita por su ID
            { $set: { asistio: asistio } } 
        );

        res.status(200).json({ mensaje: 'Cita actualizada correctamente.', idActualizado: id });

    } catch (error) {
        console.error("Error al actualizar la cita:", error);
        res.status(500).json({ mensaje: 'Error interno del servidor al actualizar la cita.' });
    }
});




module.exports = app;
