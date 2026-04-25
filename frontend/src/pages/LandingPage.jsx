import React from 'react';

// Components — Landing
import FrameScrubber from '../components/landing/FrameScrubber.jsx';
import HeroText from '../components/landing/HeroText.jsx';
import ScrollCards from '../components/landing/ScrollCards.jsx';
import StatCounters from '../components/landing/StatCounters.jsx';
import LandingCTA from '../components/landing/LandingCTA.jsx';

// Components — Shared
import NavBar from '../components/shared/NavBar.jsx';
import DataSourcesModal from '../components/panels/DataSourcesModal.jsx';

export default function LandingPage() {
  const [showDataSources, setShowDataSources] = React.useState(false);

  return (
    <div id="landing-container" className="relative w-full">
      {/* Nav Bar (always visible) */}
      <NavBar
        onInfoClick={() => setShowDataSources(true)}
        onModelCardsClick={() => setShowDataSources(true)}
      />

      {/* ACT 1 & 2: Frame Scrubber & Scroll Cards */}
      <div id="landing-section" className="relative">
        <FrameScrubber />
        <HeroText />
        <ScrollCards />
      </div>

      {/* ACT 3: Stats Section */}
      <StatCounters />

      {/* ACT 4: CTA Section */}
      <LandingCTA />

      {/* Data Sources Modal */}
      {showDataSources && (
        <DataSourcesModal onClose={() => setShowDataSources(false)} />
      )}
    </div>
  );
}
