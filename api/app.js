const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
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
    especialistas = db.collection('especialista');
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
  }
}

conectarMongoBBDD();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');  // Dominio del frontend
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');  // Métodos permitidos
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');  // Cabeceras permitidas
  next();
});

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




module.exports = app;