'use client';

import { useState } from 'react';
import '../../styles/registro.css';
import { useRouter } from 'next/navigation';

export default function HacerCitaPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    fecha: '',
  });
  const [message, setMessage] = useState('');
  const router = useRouter();

  // 🔹 Función para sanitizar inputs
  const sanitizeInput = (value, type) => {
    switch (type) {
      case 'nombre':
      case 'apellido':
        return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim();
      case 'telefono':
        return value.replace(/\D/g, '').slice(0, 10);
      case 'fecha':
        return value.replace(/[^0-9\-]/g, '').trim(); // formato yyyy-mm-dd
      default:
        return value.trim();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: sanitizeInput(value, name) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Enviando cita...');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/citas/crear', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        router.push('/confirmacion-cita');
      }
    } catch (err) {
      setMessage('Error al enviar la cita');
    }
  };

  return (
    <div className="registro-container">
      <h1 className="registro-title">Hacer Cita</h1>
      <form onSubmit={handleSubmit} className="registro-form">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="registro-input"
        />
        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          value={formData.apellido}
          onChange={handleChange}
          required
          className="registro-input"
        />
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono (10 dígitos)"
          value={formData.telefono}
          onChange={handleChange}
          required
          className="registro-input"
        />
        <input
          type="date"
          name="fecha"
          placeholder="Fecha de la cita"
          value={formData.fecha}
          onChange={handleChange}
          required
          className="registro-input"
        />
        <button type="submit" className="registro-button">
          Confirmar Cita
        </button>
      </form>
      {message && <p className="registro-message">{message}</p>}
    </div>
  );
}
