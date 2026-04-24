DROP TABLE IF EXISTS memorial_videos CASCADE;
DROP TABLE IF EXISTS travel_accommodations CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS flower_gifts CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS rsvp_entries CASCADE;
DROP TABLE IF EXISTS music_selections CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS budget_items CASCADE;
DROP TABLE IF EXISTS timeline_events CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS service_checklists CASCADE;
DROP TABLE IF EXISTS guest_book_entries CASCADE;
DROP TABLE IF EXISTS photo_gallery CASCADE;
DROP TABLE IF EXISTS memorial_donations CASCADE;
DROP TABLE IF EXISTS prayers_readings CASCADE;
DROP TABLE IF EXISTS condolence_letters CASCADE;
DROP TABLE IF EXISTS thank_you_cards CASCADE;
DROP TABLE IF EXISTS funeral_programs CASCADE;
DROP TABLE IF EXISTS grief_support CASCADE;
DROP TABLE IF EXISTS estate_items CASCADE;
DROP TABLE IF EXISTS memorial_pages CASCADE;
DROP TABLE IF EXISTS eulogies CASCADE;
DROP TABLE IF EXISTS obituaries CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE photo_gallery (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255),
  album_name VARCHAR(255),
  photo_url VARCHAR(500),
  caption TEXT,
  upload_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE guest_book_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255) NOT NULL,
  visitor_name VARCHAR(255) NOT NULL,
  visitor_email VARCHAR(255),
  message TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE service_checklists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255) NOT NULL,
  task_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  is_completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  assigned_to VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  relationship VARCHAR(100),
  address TEXT,
  city VARCHAR(255),
  state VARCHAR(100),
  zip VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE timeline_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255) NOT NULL,
  event_date DATE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(100),
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE budget_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  vendor VARCHAR(255),
  paid BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE venues (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  contact_person VARCHAR(255),
  venue_type VARCHAR(100),
  capacity INTEGER,
  notes TEXT,
  booked BOOLEAN DEFAULT FALSE,
  event_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE music_selections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255) NOT NULL,
  song_title VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  service_moment VARCHAR(100),
  notes TEXT,
  order_number INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rsvp_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255) NOT NULL,
  service_name VARCHAR(255),
  guest_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  rsvp_status VARCHAR(50) DEFAULT 'pending',
  guests_count INTEGER DEFAULT 1,
  dietary_needs TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  document_type VARCHAR(100),
  file_reference VARCHAR(500),
  description TEXT,
  uploaded_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE flower_gifts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  item_type VARCHAR(100) DEFAULT 'flowers',
  description TEXT,
  received_date DATE DEFAULT CURRENT_DATE,
  thank_you_sent BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  announcement_type VARCHAR(100) DEFAULT 'death_notice',
  publish_date DATE,
  status VARCHAR(50) DEFAULT 'draft',
  recipients TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE travel_accommodations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255),
  guest_name VARCHAR(255) NOT NULL,
  arrival_date DATE,
  departure_date DATE,
  accommodation_name VARCHAR(255),
  accommodation_address TEXT,
  transport_notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE memorial_videos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(500),
  slides_content TEXT,
  duration VARCHAR(50),
  music_track VARCHAR(255),
  status VARCHAR(50) DEFAULT 'planning',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE obituaries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255) NOT NULL,
  birth_date DATE,
  death_date DATE,
  city VARCHAR(255),
  content TEXT,
  ai_generated BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE eulogies (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255) NOT NULL,
  relationship VARCHAR(255),
  tone VARCHAR(100),
  key_memories TEXT,
  content TEXT,
  ai_generated BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE memorial_pages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255) NOT NULL,
  birth_date DATE,
  death_date DATE,
  biography TEXT,
  photo_url VARCHAR(500),
  theme VARCHAR(100) DEFAULT 'classic',
  is_public BOOLEAN DEFAULT TRUE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE estate_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255) NOT NULL,
  item_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  due_date DATE,
  assigned_to VARCHAR(255),
  priority VARCHAR(50) DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE grief_support (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  message TEXT,
  ai_response TEXT,
  mood VARCHAR(100),
  session_type VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE funeral_programs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255) NOT NULL,
  service_date TIMESTAMP,
  service_type VARCHAR(100) DEFAULT 'traditional',
  venue VARCHAR(255),
  officiant VARCHAR(255),
  program_content TEXT,
  music_selections TEXT,
  template VARCHAR(100) DEFAULT 'classic',
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE thank_you_cards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  recipient_name VARCHAR(255) NOT NULL,
  deceased_name VARCHAR(255),
  relationship VARCHAR(255),
  gift_or_gesture TEXT,
  message TEXT,
  ai_generated BOOLEAN DEFAULT FALSE,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE condolence_letters (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  recipient_name VARCHAR(255) NOT NULL,
  deceased_name VARCHAR(255),
  relationship VARCHAR(255),
  tone VARCHAR(100) DEFAULT 'warm',
  content TEXT,
  ai_generated BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE prayers_readings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  tradition VARCHAR(100),
  content TEXT,
  source VARCHAR(255),
  occasion VARCHAR(100),
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE memorial_donations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deceased_name VARCHAR(255) NOT NULL,
  donor_name VARCHAR(255),
  organization VARCHAR(255),
  amount DECIMAL(10,2),
  message TEXT,
  status VARCHAR(50) DEFAULT 'received',
  donation_date DATE DEFAULT CURRENT_DATE,
  thank_you_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
