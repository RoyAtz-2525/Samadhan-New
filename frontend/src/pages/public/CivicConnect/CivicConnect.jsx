import React from 'react';
import PublicNavbar from '../../../components/public/layout/PublicNavbar';
import PublicFooter from '../../../components/public/layout/PublicFooter';

import CivicConnectHero from '../../../components/public/civic-connect/CivicConnectHero';
import CivicIssueMap from '../../../components/public/civic-connect/CivicIssueMap';
import CommunityOverview from '../../../components/public/civic-connect/CommunityOverview';
import RecentCivicActivity from '../../../components/public/civic-connect/RecentCivicActivity';
import ResolutionStories from '../../../components/public/civic-connect/ResolutionStories';
import CommunityImpact from '../../../components/public/civic-connect/CommunityImpact';
import CivicTransparency from '../../../components/public/civic-connect/CivicTransparency';
import CivicConnectCTA from '../../../components/public/civic-connect/CivicConnectCTA';

const CivicConnect = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <PublicNavbar />
      
      <main className="flex-grow">
        <CivicConnectHero />
        <CivicIssueMap />
        <CommunityOverview />
        <RecentCivicActivity />
        <ResolutionStories />
        <CommunityImpact />
        <CivicTransparency />
        <CivicConnectCTA />
      </main>
      
      <PublicFooter />
    </div>
  );
};

export default CivicConnect;
