import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const App = () => {
  const [luzEncendida, setLuzEncendida] = useState(false);
  const [brilloActual, setBrilloActual] = useState(0);
  const [colorActual, setColorActual] = useState('');

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
    });

    client.on('message', (topic, message) => {
      console.log('Mensaje recibido en el topic', topic, ':', message.toString());

      if (topic === 'domotica/luz/on-off') {
        const estadoLuz = message.toString();
        setLuzEncendida(estadoLuz === 'encendido');
        console.log('La luz se encuentra:', estadoLuz);
      }

      if (topic === 'domotica/luz/brillo') {
        const nuevoBrillo = parseInt(message.toString());
        if (isNaN(nuevoBrillo)) {
          console.error('Valor de brillo inválido:', message.toString());
          return;
        }
        setBrilloActual(nuevoBrillo);
        console.log('El brillo actual es:', brilloActual);
      }

      if (topic === 'domotica/luz/color') {
        const nuevoColor = message.toString();
        console.log('El color actual es:', nuevoColor);
        setColorActual(nuevoColor);
      }
    });

    // Limpieza al desmontar el componente
    return () => {
      client.end();
    };
  }, []);

  const encenderLuz = () => {
    if (luzEncendida) {
      console.log('La luz ya está encendida');
      return;
    }

    console.log('Encendiendo la luz');
    // Lógica para publicar mensaje MQTT para encender la luz
  };

  const apagarLuz = () => {
    if (!luzEncendida) {
      console.log('La luz ya está apagada');
      return;
    }

    console.log('Apagando la luz');
    // Lógica para publicar mensaje MQTT para apagar la luz
  };

  const cambiarBrillo = (valor) => {
    if (!luzEncendida) {
      console.log('La luz está apagada. No se puede cambiar el brillo.');
      return;
    }

    const nuevoBrillo = parseInt(valor);
    console.log('Cambiando el brillo:', nuevoBrillo);
    setBrilloActual(nuevoBrillo);
    // Lógica para publicar mensaje MQTT con el nuevo brillo
  };

  return (
    <div>
      <h2>Simulador de Foco</h2>
      <p>Nombre: Sala</p>
      <p>Estado: {luzEncendida ? 'Encendido' : 'Apagado'}</p>
      <p>Brillo: {brilloActual}</p>
      <p>Color: {colorActual}</p>
      <button onClick={encenderLuz}>Encender</button>
      <button onClick={apagarLuz}>Apagar</button>
      <input
        type="range"
        min="0"
        max="100"
        value={brilloActual}
        onChange={(e) => cambiarBrillo(e.target.value)}
      />
    </div>
  );
};

export default App;
