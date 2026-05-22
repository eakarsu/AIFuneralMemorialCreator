import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar'
import PublicMemorial from './pages/PublicMemorial'
import ThankYouTrackerPage from './pages/ThankYouTrackerPage'
import ObituariesPage from './pages/ObituariesPage'
import EulogiesPage from './pages/EulogiesPage'
import MemorialPagesPage from './pages/MemorialPagesPage'
import EstateItemsPage from './pages/EstateItemsPage'
import GriefSupportPage from './pages/GriefSupportPage'
import FuneralProgramsPage from './pages/FuneralProgramsPage'
import ThankYouCardsPage from './pages/ThankYouCardsPage'
import CondolenceLettersPage from './pages/CondolenceLettersPage'
import PrayersReadingsPage from './pages/PrayersReadingsPage'
import MemorialDonationsPage from './pages/MemorialDonationsPage'
import PhotoGalleryPage from './pages/PhotoGalleryPage'
import GuestBookPage from './pages/GuestBookPage'
import ServiceChecklistsPage from './pages/ServiceChecklistsPage'
import ContactsPage from './pages/ContactsPage'
import TimelineEventsPage from './pages/TimelineEventsPage'
import BudgetTrackerPage from './pages/BudgetTrackerPage'
import VenuesPage from './pages/VenuesPage'
import MusicPlaylistPage from './pages/MusicPlaylistPage'
import RSVPPage from './pages/RSVPPage'
import DocumentVaultPage from './pages/DocumentVaultPage'
import FlowerGiftTrackerPage from './pages/FlowerGiftTrackerPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import TravelAccommodationsPage from './pages/TravelAccommodationsPage'
import MemorialVideoPage from './pages/MemorialVideoPage'
import AILegacyToolsPage from './pages/AILegacyToolsPage'
import VendorAndProbatePage from './pages/VendorAndProbatePage'
import Toast from './components/Toast'

// === Batch 04 Gaps & Frontend Mounts ===
import CfMultiModalMemorialVideoGenerationEu from './pages/CfMultiModalMemorialVideoGenerationEu';
import CfLegacyLetterPlatformWithPosthumousM from './pages/CfLegacyLetterPlatformWithPosthumousM';
import CfGriefSupportChatbotWithGriefStage from './pages/CfGriefSupportChatbotWithGriefStage';
import CfFamilyTreeBiographyAutoCompletionPu from './pages/CfFamilyTreeBiographyAutoCompletionPu';
import CfProbateAssistantAddingStateSpecific from './pages/CfProbateAssistantAddingStateSpecific';
import CfLegacyGivingAdvisorMatchingMemorial from './pages/CfLegacyGivingAdvisorMatchingMemorial';
import GapNoLegacyInterviewGuideEndpointQuest from './pages/GapNoLegacyInterviewGuideEndpointQuest';
import GapNoTimelineNarrativeSynthesisWeaveLi from './pages/GapNoTimelineNarrativeSynthesisWeaveLi';
import GapNoDonationsMatchingCausesByDeceased from './pages/GapNoDonationsMatchingCausesByDeceased';
import GapNoGriefStageClassifierExposedTo from './pages/GapNoGriefStageClassifierExposedTo';
import GapNoWebhookReceiversForOnlineTribute from './pages/GapNoWebhookReceiversForOnlineTribute';
import GapNoRealTimeChatBetweenFamily from './pages/GapNoRealTimeChatBetweenFamily';
import GapNoSmsemailSendInfrastructureNotifica from './pages/GapNoSmsemailSendInfrastructureNotifica';
import GapNoPaymentProcessingForDonationsOr from './pages/GapNoPaymentProcessingForDonationsOr';
import GapNoMultiTenantFuneralHomeOnboarding from './pages/GapNoMultiTenantFuneralHomeOnboarding';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) return <div className="loading">Loading...</div>

  // Public routes accessible without login
  return (
    <Routes>
        <Route path="/insights/timeline" element={<TimelineView />} />
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

      <Route path="/memorial/:slug" element={<PublicMemorial />} />
      <Route path="/*" element={
        !user ? <Login onLogin={handleLogin} showToast={showToast} /> : (
          <div>
            <Navbar user={user} onLogout={handleLogout} />
            <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
              <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/obituaries/*" element={<ObituariesPage showToast={showToast} />} />
          <Route path="/eulogies/*" element={<EulogiesPage showToast={showToast} />} />
          <Route path="/memorial-pages/*" element={<MemorialPagesPage showToast={showToast} />} />
          <Route path="/estate-items/*" element={<EstateItemsPage showToast={showToast} />} />
          <Route path="/grief-support/*" element={<GriefSupportPage showToast={showToast} />} />
          <Route path="/funeral-programs/*" element={<FuneralProgramsPage showToast={showToast} />} />
          <Route path="/thank-you-cards/*" element={<ThankYouCardsPage showToast={showToast} />} />
          <Route path="/condolence-letters/*" element={<CondolenceLettersPage showToast={showToast} />} />
          <Route path="/prayers-readings/*" element={<PrayersReadingsPage showToast={showToast} />} />
          <Route path="/memorial-donations/*" element={<MemorialDonationsPage showToast={showToast} />} />
          <Route path="/photo-gallery/*" element={<PhotoGalleryPage showToast={showToast} />} />
          <Route path="/guest-book/*" element={<GuestBookPage showToast={showToast} />} />
          <Route path="/service-checklists/*" element={<ServiceChecklistsPage showToast={showToast} />} />
          <Route path="/contacts/*" element={<ContactsPage showToast={showToast} />} />
          <Route path="/timeline-events/*" element={<TimelineEventsPage showToast={showToast} />} />
          <Route path="/budget-tracker/*" element={<BudgetTrackerPage showToast={showToast} />} />
          <Route path="/venues/*" element={<VenuesPage showToast={showToast} />} />
          <Route path="/music-playlist/*" element={<MusicPlaylistPage showToast={showToast} />} />
          <Route path="/rsvp/*" element={<RSVPPage showToast={showToast} />} />
          <Route path="/document-vault/*" element={<DocumentVaultPage showToast={showToast} />} />
          <Route path="/flower-gifts/*" element={<FlowerGiftTrackerPage showToast={showToast} />} />
          <Route path="/announcements/*" element={<AnnouncementsPage showToast={showToast} />} />
          <Route path="/travel-accommodations/*" element={<TravelAccommodationsPage showToast={showToast} />} />
          <Route path="/memorial-videos/*" element={<MemorialVideoPage showToast={showToast} />} />
          <Route path="/thank-you-tracker/*" element={<ThankYouTrackerPage showToast={showToast} />} />
          <Route path="/ai-legacy-tools/*" element={<AILegacyToolsPage showToast={showToast} />} />
          <Route path="/vendor-probate/*" element={<VendorAndProbatePage showToast={showToast} />} />
          {/* // === Batch 04 Gaps & Frontend Mounts === */}
          <Route path="/cf-multi-modal-memorial-video-generation-eu" element={<CfMultiModalMemorialVideoGenerationEu />} />
          <Route path="/cf-legacy-letter-platform-with-posthumous-m" element={<CfLegacyLetterPlatformWithPosthumousM />} />
          <Route path="/cf-grief-support-chatbot-with-grief-stage" element={<CfGriefSupportChatbotWithGriefStage />} />
          <Route path="/cf-family-tree-biography-auto-completion-pu" element={<CfFamilyTreeBiographyAutoCompletionPu />} />
          <Route path="/cf-probate-assistant-adding-state-specific-" element={<CfProbateAssistantAddingStateSpecific />} />
          <Route path="/cf-legacy-giving-advisor-matching-memorial-" element={<CfLegacyGivingAdvisorMatchingMemorial />} />
          <Route path="/gap-no-legacy-interview-guide-endpoint-quest" element={<GapNoLegacyInterviewGuideEndpointQuest />} />
          <Route path="/gap-no-timeline-narrative-synthesis-weave-li" element={<GapNoTimelineNarrativeSynthesisWeaveLi />} />
          <Route path="/gap-no-donations-matching-causes-by-deceased" element={<GapNoDonationsMatchingCausesByDeceased />} />
          <Route path="/gap-no-grief-stage-classifier-exposed-to" element={<GapNoGriefStageClassifierExposedTo />} />
          <Route path="/gap-no-webhook-receivers-for-online-tribute" element={<GapNoWebhookReceiversForOnlineTribute />} />
          <Route path="/gap-no-real-time-chat-between-family" element={<GapNoRealTimeChatBetweenFamily />} />
          <Route path="/gap-no-smsemail-send-infrastructure-notifica" element={<GapNoSmsemailSendInfrastructureNotifica />} />
          <Route path="/gap-no-payment-processing-for-donations-or" element={<GapNoPaymentProcessingForDonationsOr />} />
          <Route path="/gap-no-multi-tenant-funeral-home-onboarding" element={<GapNoMultiTenantFuneralHomeOnboarding />} />

          <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} />}
          </div>
        )
      } />
    </Routes>
  )
}
