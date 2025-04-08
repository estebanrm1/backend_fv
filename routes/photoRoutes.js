import { Router } from 'express';
import Photo from '../models/Photo.js'; // ✅ Asegurar la extensión .js

const router = Router();

// Obtener todas las fotos
router.get('/', async (req, res) => {
  try {
    const photos = await Photo.find().sort({ createdAt: -1 }); // ✅ Llamar a find() desde el modelo
    res.json(photos);
  } catch (err) {
    console.error('Error al obtener las fotos:', err);
    res.status(500).json({ error: 'Error al obtener las fotos' });
  }
});

router.get('/slideshow', async (req, res) => {
  try {
    const photos = await Photo.find().sort({ createdAt: 1 }); // Orden ascendente
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las fotos' });
  }
});

// Ruta para agregar una nueva foto
router.post('/', async (req, res) => {
  try {
    if (!req.body.imageUrl) {
      return res.status(400).json({ error: 'Falta el campo imageUrl' });
    }

    const newPhoto = new Photo({ imageUrl: req.body.imageUrl });
    await newPhoto.save();

    res.status(201).json(newPhoto);
  } catch (err) {
    console.error('Error al guardar la foto:', err);
    res.status(500).json({ error: 'Error al guardar la foto' });
  }
});

export default router;