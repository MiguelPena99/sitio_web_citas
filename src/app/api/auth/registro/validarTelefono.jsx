// pages/api/auth/validarTelefono.js
import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ message: 'Teléfono validado', data: decoded });
  } catch (err) {
    res.status(400).json({ message: 'Token inválido o expirado' });
  }
}
