const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
app.use(express.json());

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
        res.json({ mensaje: "Bienvenido administrativo", rol: "administrativo" });
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


module.exports = app;
