import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { Server } from 'socket.io';
import photoRoutes from './routes/photoRoutes.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Photo from './models/Photo.js'; // Asegurar que este archivo existe

// Configuración de rutas en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/photos', photoRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de Multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads')); // Asegura que las imágenes se guardan en la carpeta correcta
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Ruta para subir fotos
app.post('/api/photos/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });

    const newPhoto = new Photo({ imageUrl: `/uploads/${req.file.filename}` });
    await newPhoto.save();

    io.emit('newPhoto', newPhoto); // Emitir evento con la nueva foto
    res.status(201).json(newPhoto);
  } catch (err) {
    console.error('Error al guardar la foto:', err);
    res.status(500).json({ error: 'Error al guardar la foto' });
  }
});

// WebSocket para enviar fotos en tiempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  socket.on('disconnect', () => console.log('Cliente desconectado:', socket.id));
});

// Servidor en marcha
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Servidor corriendo en el puerto ${PORT}`));

export { app, io, upload };