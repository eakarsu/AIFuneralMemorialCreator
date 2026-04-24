import React from 'react'
import { useNavigate } from 'react-router-dom'

const features = [
  {
    title: 'Obituaries',
    icon: '&#x1F4DC;',
    description: 'Craft dignified obituaries that honor a life well lived',
    path: '/obituaries',
    color: '#2c3e50',
    count: 'AI-powered writing assistance',
  },
  {
    title: 'Eulogies',
    icon: '&#x1F399;',
    description: 'Create heartfelt eulogies that capture the essence of your loved one',
    path: '/eulogies',
    color: '#8e7cc3',
    count: 'Personalized tone & style',
  },
  {
    title: 'Memorial Pages',
    icon: '&#x1F56F;',
    description: 'Build beautiful digital memorial pages to celebrate a life',
    path: '/memorial-pages',
    color: '#27ae60',
    count: 'Multiple themes available',
  },
  {
    title: 'Estate Coordination',
    icon: '&#x1F4CB;',
    description: 'Organize and track estate matters with AI-generated checklists',
    path: '/estate-items',
    color: '#2980b9',
    count: 'Task tracking & priorities',
  },
  {
    title: 'Grief Support',
    icon: '&#x1F49C;',
    description: 'Compassionate AI grief counseling and coping strategies',
    path: '/grief-support',
    color: '#c0392b',
    count: 'Empathetic AI responses',
  },
  {
    title: 'Funeral Programs',
    icon: '&#x1F4D6;',
    description: 'Design complete funeral service programs with order of service',
    path: '/funeral-programs',
    color: '#8B4513',
    count: 'Multiple service types',
  },
  {
    title: 'Thank You Cards',
    icon: '&#x1F48C;',
    description: 'Generate sincere thank you notes for those who showed support',
    path: '/thank-you-cards',
    color: '#c9a959',
    count: 'Personalized messages',
  },
  {
    title: 'Condolence Letters',
    icon: '&#x2709;',
    description: 'Write meaningful condolence letters that offer genuine comfort',
    path: '/condolence-letters',
    color: '#5d6d7e',
    count: 'Multiple tone options',
  },
  {
    title: 'Prayers & Readings',
    icon: '&#x1F4D6;',
    description: 'Find appropriate prayers and readings from various traditions',
    path: '/prayers-readings',
    color: '#6c3483',
    count: 'Multi-faith collection',
  },
  {
    title: 'Memorial Donations',
    icon: '&#x1F49D;',
    description: 'Track and acknowledge memorial donations and contributions',
    path: '/memorial-donations',
    color: '#1abc9c',
    count: 'Donation tracking',
  },
  {
    title: 'Photo Gallery',
    icon: '&#x1F4F7;',
    description: 'Upload and organize photos to celebrate cherished memories',
    path: '/photo-gallery',
    color: '#e67e22',
    count: 'Albums & captions',
  },
  {
    title: 'Guest Book',
    icon: '&#x1F4D3;',
    description: 'Collect heartfelt messages from friends and family visitors',
    path: '/guest-book',
    color: '#9b59b6',
    count: 'Visitor messages',
  },
  {
    title: 'Service Checklists',
    icon: '&#x2705;',
    description: 'Stay organized with comprehensive funeral planning checklists',
    path: '/service-checklists',
    color: '#16a085',
    count: 'Task tracking',
  },
  {
    title: 'Contact Management',
    icon: '&#x1F4C7;',
    description: 'Manage family, friends, and service provider contact information',
    path: '/contacts',
    color: '#2980b9',
    count: 'Address book',
  },
  {
    title: 'Memorial Timeline',
    icon: '&#x1F554;',
    description: 'Create a beautiful chronological timeline of life events',
    path: '/timeline-events',
    color: '#8e44ad',
    count: 'Life milestones',
  },
  {
    title: 'Budget Tracker',
    icon: '&#x1F4B0;',
    description: 'Track funeral expenses, estimates, and vendor payments',
    path: '/budget-tracker',
    color: '#27ae60',
    count: 'Expense management',
  },
  {
    title: 'Venue Management',
    icon: '&#x1F3DB;',
    description: 'Coordinate funeral homes, churches, cemeteries, and reception halls',
    path: '/venues',
    color: '#7f8c8d',
    count: 'Location planning',
  },
  {
    title: 'Music Playlist',
    icon: '&#x1F3B5;',
    description: 'Curate the perfect musical selections for the memorial service',
    path: '/music-playlist',
    color: '#e74c3c',
    count: 'Service music',
  },
  {
    title: 'RSVP & Attendance',
    icon: '&#x1F4CB;',
    description: 'Track guest responses, attendance, and dietary requirements',
    path: '/rsvp',
    color: '#f39c12',
    count: 'Guest management',
  },
  {
    title: 'Document Vault',
    icon: '&#x1F4C1;',
    description: 'Securely store and organize important documents and records',
    path: '/document-vault',
    color: '#34495e',
    count: 'Secure storage',
  },
  {
    title: 'Flower & Gift Tracker',
    icon: '&#x1F490;',
    description: 'Record floral arrangements and gifts received from well-wishers',
    path: '/flower-gifts',
    color: '#e91e63',
    count: 'Gift acknowledgment',
  },
  {
    title: 'Announcements',
    icon: '&#x1F4E2;',
    description: 'Create and distribute death notices and service announcements',
    path: '/announcements',
    color: '#ff5722',
    count: 'Notices & updates',
  },
  {
    title: 'Travel & Accommodations',
    icon: '&#x2708;',
    description: 'Coordinate travel and lodging for out-of-town guests',
    path: '/travel-accommodations',
    color: '#00bcd4',
    count: 'Guest logistics',
  },
  {
    title: 'Memorial Video',
    icon: '&#x1F3AC;',
    description: 'Plan memorial slideshows and video tributes for the service',
    path: '/memorial-videos',
    color: '#673ab7',
    count: 'Video planning',
  },
]

const aiFeatures = features.slice(0, 10)
const planningFeatures = features.slice(10)

function FeatureCard({ feature, navigate }) {
  return (
    <div
      key={feature.path}
      className="card clickable-row"
      onClick={() => navigate(feature.path)}
      style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: feature.color,
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, paddingTop: 8 }}>
        <div style={{
          fontSize: 36,
          width: 56,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
          background: `${feature.color}10`,
          flexShrink: 0,
        }} dangerouslySetInnerHTML={{ __html: feature.icon }} />
        <div>
          <h3 style={{ fontSize: 18, marginBottom: 6, color: feature.color }}>{feature.title}</h3>
          <p style={{ fontSize: 13, color: '#7f8c8d', lineHeight: 1.5, marginBottom: 8 }}>{feature.description}</p>
          <span style={{ fontSize: 11, color: feature.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {feature.count}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 40, paddingTop: 20 }}>
        <h1 style={{ fontSize: 36, color: '#2c3e50', marginBottom: 12 }}>
          AI Funeral & Memorial Creator
        </h1>
        <p style={{ fontSize: 16, color: '#7f8c8d', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
          Compassionate tools to help families honor their loved ones with dignity,
          grace, and personalized care during life's most difficult moments.
        </p>
      </div>

      <h2 style={{ fontSize: 22, color: '#2c3e50', marginBottom: 20, fontFamily: 'Playfair Display, serif', borderBottom: '2px solid #8e7cc3', paddingBottom: 10 }}>
        AI-Powered Content Creation
      </h2>
      <div className="grid-3" style={{ marginBottom: 40 }}>
        {aiFeatures.map((feature) => (
          <FeatureCard key={feature.path} feature={feature} navigate={navigate} />
        ))}
      </div>

      <h2 style={{ fontSize: 22, color: '#2c3e50', marginBottom: 20, fontFamily: 'Playfair Display, serif', borderBottom: '2px solid #27ae60', paddingBottom: 10 }}>
        Planning & Coordination Tools
      </h2>
      <div className="grid-3" style={{ marginBottom: 40 }}>
        {planningFeatures.map((feature) => (
          <FeatureCard key={feature.path} feature={feature} navigate={navigate} />
        ))}
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #2c3e50, #34495e)',
        borderRadius: 16,
        padding: 40,
        color: 'white',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 24, marginBottom: 12, fontFamily: 'Playfair Display, serif' }}>
          Powered by AI, Guided by Compassion
        </h2>
        <p style={{ fontSize: 14, opacity: 0.8, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
          Our AI understands the sensitivity of memorial services and generates content
          with the utmost respect and empathy. Every word is crafted to honor and comfort.
        </p>
      </div>
    </div>
  )
}
