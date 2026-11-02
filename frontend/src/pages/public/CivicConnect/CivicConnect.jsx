import React, { useState, useEffect } from 'react';
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
import api from '../../../services/api';

const CivicConnect = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicIssues = async () => {
      try {
        const response = await api.get('/issues/public-map');
        if (Array.isArray(response.data)) {
          setIssues(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch public map data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicIssues();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <PublicNavbar />
      
      <main className="flex-grow">
        <CivicConnectHero />
        <CivicIssueMap issues={issues} loading={loading} />
        <CommunityOverview issues={issues} loading={loading} />
        <RecentCivicActivity issues={issues} loading={loading} />
        <ResolutionStories issues={issues} loading={loading} />
        <CommunityImpact issues={issues} loading={loading} />
        <CivicTransparency />
        <CivicConnectCTA />
      </main>
      
      <PublicFooter />
    </div>
  );
};

export default CivicConnect;
