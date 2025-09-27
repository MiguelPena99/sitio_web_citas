import jwt from 'jsonwebtoken';

// Simulación de base de datos de usuarios
const users = [
  { telefono: '5512345678', contrasena: '123456', admin: false },
  { telefono: '5598765432', contrasena: 'admin123', admin: true },
];

// Guardar intentos fallidos en memoria (temporal)
const failedAttempts = {}; // { telefono: { count: 0, banUntil: Date } }

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const { telefono, contrasena } = req.body;
  const now = new Date();

  // Revisar si el teléfono está baneado
  if (failedAttempts[telefono]?.banUntil && now < failedAttempts[telefono].banUntil) {
    const minutesLeft = Math.ceil((failedAttempts[telefono].banUntil - now) / 60000);
    return res.status(403).json({ message: `Usuario bloqueado. Intenta de nuevo en ${minutesLeft} min` });
  }

  const user = users.find(u => u.telefono === telefono && u.contrasena === contrasena);

  if (!user) {
    // Aumentar contador de intentos fallidos
    if (!failedAttempts[telefono]) failedAttempts[telefono] = { count: 0 };
    failedAttempts[telefono].count++;

    // Baneo temporal después de 3 intentos fallidos
    if (failedAttempts[telefono].count >= 3) {
      failedAttempts[telefono].banUntil = new Date(now.getTime() + 5 * 60000); // bloquea 5 min
      failedAttempts[telefono].count = 0; // reinicia contador
      return res.status(403).json({ message: 'Usuario bloqueado por 5 minutos' });
    }

    return res.status(401).json({ message: 'Teléfono o contraseña incorrectos' });
  }

  // Login exitoso → resetear contador de intentos
  if (failedAttempts[telefono]) delete failedAttempts[telefono];

  const token = jwt.sign({ telefono: user.telefono, admin: user.admin }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return res.status(200).json({ message: 'Login exitoso', token });
}
