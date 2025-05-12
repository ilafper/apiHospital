const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const middlewares = require('./middlewares');
const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

// Conectar con MongoDB
const uri = "mongodb+srv://ialfper:ialfper21@alumnos.zoinj.mongodb.net/alumnos?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let login;
let citas;
let pacientes;
let especialistas;
async function conectarMongoBBDD() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB Atlas");
    const db = client.db('hospital');
    login = db.collection('usuarios');
    citas = db.collection('mangas');
    pacientes = db.collection('pacientes');
    especialistas = db.collection('especialistas');
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
  }
}

conectarMongoBBDD();

// Endpoint GET para obtener usuarios
app.get('/api/login', async (req, res) => {
  try {
    const lista_login = await login.find().toArray();
    res.json(lista_login);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});


app.get('/api/citas', async (req, res) => {
  try {
    const lista_citas = await citas.find().toArray();
    res.json(lista_citas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los mangas' });
  }
});


app.get('/api/pacientes', async (req, res) => {
  try {
    const lista_pacientes = await pacientes.find().toArray();
    res.json(lista_pacientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los mangas' });
  }
});


app.get('/api/especialistas', async (req, res) => {
  try {
    const lista_especialistas = await especialistas.find().toArray();
    res.json(lista_especialistas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los mangas' });
  }
});




app.use(middlewares.notFound);
app.use(middlewares.errorHandler);
// Exporta la app para usarla en otros archivos
module.exports = app;
