import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt-browser';

const App = () => {
  const [luzEncendida, setLuzEncendida] = useState(false);
  const [brilloActual, setBrilloActual] = useState(0);
  const [colorActual, setColorActual] = useState('');
  const [id, setId] = useState('');
  const [nombre, setNombre] = useState('');
  const [puertaAbierta, setPuertaAbierta] = useState(false);

  useEffect(() => {
    const client = mqtt.connect('ws://localhost:8083/mqtt');

    client.on('connect', () => {
      console.log('Conectado al broker');

      client.subscribe('domotica/luz/on-off', (err) => {
        if (err) {
          console.error('Error al suscribirse al topic de encendido/apagado:', err);
        } else {
          console.log('Suscripción exitosa al topic de encendido/apagado');
        }
      });

      client.subscribe('domotica/luz/brillo', (err) => {
        if (err) {
          console.error('Error al suscribirse al topic de brillo:', err);
        } else {
          console.log('Suscripción exitosa al topic de brillo');
        }
      });

      client.subscribe('domotica/luz/color', (err) => {
        if (err) {
          console.error('Error al suscribirse al topic de color:', err);
        } else {
          console.log('Suscripción exitosa al topic de color');
        }
      });

      client.subscribe('domotica/puertas/open-close', (err) => {
        if (err) {
          console.error('Error al suscribirse al topic de apertura/cierre de puertas:', err);
        } else {
          console.log('Suscripción exitosa al topic de apertura/cierre de puertas');
        }
      });
    });

    client.on('message', (topic, message) => {
      console.log('Mensaje recibido en el topic', topic, ':', message.toString());

      if (topic === 'domotica/luz/on-off') {
        const estadoLuz = message.toString() === 'true';
        setLuzEncendida(estadoLuz);
        console.log('El estado de la luz es:', estadoLuz);
      }

      if (topic === 'domotica/luz/brillo') {
        const nuevoBrillo = parseInt(message.toString());
        if (isNaN(nuevoBrillo)) {
          console.error('Valor de brillo inválido:', message.toString());
          return;
        }
        setBrilloActual(nuevoBrillo);
        console.log('El brillo actual es:', nuevoBrillo);
      }

      if (topic === 'domotica/luz/color') {
        const nuevoColor = message.toString();
        console.log('El color actual es:', nuevoColor);
        setColorActual(nuevoColor);
      }

      if (topic === 'domotica/puertas/open-close') {
        const estadoPuerta = message.toString() === true;
        setPuertaAbierta(estadoPuerta);
        console.log('El estado de la puerta es:', estadoPuerta);
      }

      // Parsear los valores JSON recibidos
      try {
        const data = JSON.parse(message.toString());
        console.log('Valores recibidos desde el broker:', data);
        setId(data.id);
        setNombre(data.nombre);
      } catch (error) {
        console.error('Error al parsear los valores JSON:', error);
      }
    });

    // Limpieza al desmontar el componente
    return () => {
      client.end();
    };
  }, []);

  return (
    <div>
      <h2>Simulador de Foco</h2>
      <p>ID: {id}</p>
      <p>Nombre: {nombre}</p>
      <p>Estado de la luz: {luzEncendida ? 'Encendido' : 'Apagado'}</p>
      <p>Brillo: {brilloActual}</p>
      <p>Color: {colorActual}</p>

      <h2>Simulador de Puerta</h2>
      <p>ID: {id}</p>
      <p>Nombre: {nombre}</p>
      <p>Estado de la puerta: {puertaAbierta ? 'Abierta' : 'Cerrada'}</p>
    </div>
  );
};

export default App;
