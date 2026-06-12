// Détecte l'environnement et retourne la bonne URL d'API
const getApiUrl = (): string => {
  const hostname = window.location.hostname;
  
  // Si on est sur localhost (PC en dev)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // Si on est sur un réseau local (téléphone connecté au PC)
  if (hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
    return `http://${hostname}:3001`;
  }
  
  // Sinon, on est en production (Vercel)
  return 'https://strongify-api.onrender.com';
};

export const API_URL = getApiUrl();