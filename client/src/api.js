const API = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const auth = {
  login: (email, password) =>
    fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }).then(handleResponse),
  register: (email, password, name) =>
    fetch(`${API}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) }).then(handleResponse),
  me: () => fetch(`${API}/auth/me`, { headers: getHeaders() }).then(handleResponse),
};

const crud = (resource) => ({
  getAll: () => fetch(`${API}/${resource}`, { headers: getHeaders() }).then(handleResponse),
  getOne: (id) => fetch(`${API}/${resource}/${id}`, { headers: getHeaders() }).then(handleResponse),
  create: (data) => fetch(`${API}/${resource}`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  update: (id, data) => fetch(`${API}/${resource}/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  delete: (id) => fetch(`${API}/${resource}/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
});

export const obituaries = crud('obituaries');
export const eulogies = crud('eulogies');
export const memorialPages = crud('memorial-pages');
export const estateItems = crud('estate-items');
export const griefSupport = crud('grief-support');
export const funeralPrograms = crud('funeral-programs');
export const thankYouCards = crud('thank-you-cards');
export const condolenceLetters = crud('condolence-letters');
export const prayersReadings = crud('prayers-readings');
export const memorialDonations = crud('memorial-donations');

// Non-AI features
export const photoGallery = crud('photo-gallery');
export const guestBook = crud('guest-book');
export const serviceChecklists = crud('service-checklists');
export const contacts = crud('contacts');
export const timelineEvents = crud('timeline-events');
export const budgetItems = crud('budget-items');
export const venues = crud('venues');
export const musicSelections = crud('music-selections');
export const rsvpEntries = crud('rsvp-entries');
export const documents = crud('documents');
export const flowerGifts = crud('flower-gifts');
export const announcements = crud('announcements');
export const travelAccommodations = crud('travel-accommodations');
export const memorialVideos = crud('memorial-videos');

export const ai = {
  generateObituary: (data) => fetch(`${API}/ai/generate-obituary`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  generateEulogy: (data) => fetch(`${API}/ai/generate-eulogy`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  generateMemorialBio: (data) => fetch(`${API}/ai/generate-memorial-bio`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  generateEstateChecklist: (data) => fetch(`${API}/ai/generate-estate-checklist`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  generateGriefSupport: (data) => fetch(`${API}/ai/generate-grief-support`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  generateFuneralProgram: (data) => fetch(`${API}/ai/generate-funeral-program`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  generateThankYou: (data) => fetch(`${API}/ai/generate-thank-you`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  generateCondolence: (data) => fetch(`${API}/ai/generate-condolence`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  generatePrayer: (data) => fetch(`${API}/ai/generate-prayer`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  generateDonationThanks: (data) => fetch(`${API}/ai/generate-donation-thanks`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
};
