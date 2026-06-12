// Détecte l'environnement et retourne la bonne URL d'API
const getApiUrl = (): string => {
  const hostname = window.location.hostname;
  
  // Si on est sur localhost (PC en dev), on utilise localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // Sinon (téléphone ou autre appareil sur le réseau), on utilise la même IP que le frontend
  return `http://${hostname}:3001`;
};

export const API_URL = getApiUrl();