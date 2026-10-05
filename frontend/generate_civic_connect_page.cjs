const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components', 'public', 'civic-connect');
const pagesDir = path.join(__dirname, 'src', 'pages', 'public', 'CivicConnect');

// Ensure directories exist
[componentsDir, pagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const civicConnectHero = `
import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Users, ArrowRight } from 'lucide-react';

const CivicConnectHero = () => {
  return (
    <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 text-white py-16 sm:py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6 space-x-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <Map className="h-8 w-8 text-blue-300" />
            </div>
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <Users className="h-8 w-8 text-indigo-300" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            See Your Community.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              Follow the Change.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto mb-10">
            Explore public civic activity, understand issue progress and see how reported problems move toward resolution.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/citizen/report-issue" className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-white transition-colors shadow-lg">
              Report an Issue
            </Link>
            <Link to="/how-it-works" className="inline-flex justify-center items-center px-6 py-3 border border-white/30 text-base font-medium rounded-md text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-white transition-colors">
              How It Works
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
    </section>
  );
};

export default CivicConnectHero;
`;

const civicIssueMap = `
import React, { useState } from 'react';
import { MapPin, Filter, Layers } from 'lucide-react';

const CivicIssueMap = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Road', 'Garbage', 'Water', 'Street Light', 'Drainage', 'Safety'];

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="text-blue-600 h-6 w-6" />
              Public Issue Map
            </h2>
            <p className="text-gray-600 mt-1">Explore civic activity in your area.</p>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200 text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-gray-700">Open</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-gray-700">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-700">Resolved</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-2 text-gray-500 mr-2 shrink-0">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={\`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors \${
                activeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }\`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Map Container (Placeholder for future Mapbox integration) */}
        <div className="w-full h-[500px] bg-gray-200 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative overflow-hidden">
          <Layers className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Interactive Map Area</h3>
          <p className="text-gray-500 max-w-md text-center">
            Mapbox integration pending. Public-safe civic information markers will appear here in future updates.
          </p>
          
          {/* Simulated aesthetic map elements for the placeholder */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_0_4px_rgba(239,68,68,0.2)] animate-pulse"></div>
          <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_0_4px_rgba(245,158,11,0.2)]"></div>
          <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_0_4px_rgba(34,197,94,0.2)]"></div>
        </div>
      </div>
    </section>
  );
};

export default CivicIssueMap;
`;

const communityOverview = `
import React from 'react';
import { AlertCircle, Search, HardHat, CheckCircle2 } from 'lucide-react';

const CommunityOverview = () => {
  const metrics = [
    {
      title: 'Reported',
      icon: AlertCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      title: 'Under Review',
      icon: Search,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100'
    },
    {
      title: 'In Progress',
      icon: HardHat,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100'
    },
    {
      title: 'Resolved',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100'
    }
  ];

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Community Overview
          </h2>
          <p className="text-gray-600">
            A snapshot of civic issues across all categories in the system.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className={\`rounded-2xl border \${metric.borderColor} p-6 \${metric.bgColor} flex flex-col items-center justify-center text-center\`}>
              <div className={\`\${metric.color} mb-4\`}>
                <metric.icon className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                {metric.title}
              </h3>
              {/* API-ready placeholder state */}
              <div className="text-2xl font-bold text-gray-900 opacity-50 flex items-center justify-center h-10">
                —
              </div>
              <p className="text-xs text-gray-500 mt-2">Data will appear here</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityOverview;
`;

const recentCivicActivity = `
import React from 'react';
import { Activity } from 'lucide-react';

const RecentCivicActivity = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 mb-8">
          <Activity className="h-7 w-7 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Recent Civic Activity
          </h2>
        </div>

        {/* Empty state container for future API data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Activity Feed Pending
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Recent civic activity (such as Issue Reported, Work Started, Issue Resolved) will appear here once the system is connected to real-time public-safe backend activity.
          </p>
          
          <div className="mt-8 pt-8 border-t border-gray-100 flex justify-center gap-4 text-xs font-medium text-gray-400">
            <span>Expected Fields:</span>
            <span className="bg-gray-100 px-2 py-1 rounded">Activity Type</span>
            <span className="bg-gray-100 px-2 py-1 rounded">Category</span>
            <span className="bg-gray-100 px-2 py-1 rounded">General Area</span>
            <span className="bg-gray-100 px-2 py-1 rounded">Timestamp</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentCivicActivity;
`;

const resolutionStories = `
import React from 'react';
import { Image as ImageIcon, Camera } from 'lucide-react';

const ResolutionStories = () => {
  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Resolution Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See examples of civic issues moving from problem to verified resolution.
          </p>
        </div>

        {/* Empty state container for future API data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-[400px]">
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-100 p-6 border-b border-gray-200">
                <ImageIcon className="h-12 w-12 mb-3 opacity-50" />
                <span className="text-sm font-medium">Public-safe media will appear here</span>
              </div>
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center text-xs font-medium text-gray-500">
                    <Camera className="h-4 w-4 mr-1" />
                    Before & After
                  </div>
                  <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">
                    RESOLVED
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-500 italic">
            Verified resolution stories will appear here when available.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ResolutionStories;
`;

const communityImpact = `
import React from 'react';
import { BarChart3 } from 'lucide-react';

const CommunityImpact = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Community Impact
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Visualizing the progress and categories of civic improvement.
          </p>
        </div>

        {/* Empty state container for future chart integration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
            <BarChart3 className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-gray-900 font-semibold mb-2">Resolution Activity by Category</h3>
            <p className="text-gray-500 text-sm text-center">Community impact data will appear here.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
            <BarChart3 className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-gray-900 font-semibold mb-2">Monthly Resolution Trends</h3>
            <p className="text-gray-500 text-sm text-center">Community impact data will appear here.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityImpact;
`;

const civicTransparency = `
import React from 'react';
import { ArrowDown } from 'lucide-react';

const CivicTransparency = () => {
  const lifecycle = [
    { name: "REPORTED", color: "bg-gray-100 text-gray-600" },
    { name: "REVIEWED", color: "bg-indigo-100 text-indigo-700" },
    { name: "APPROVED", color: "bg-blue-100 text-blue-700" },
    { name: "ASSIGNED", color: "bg-purple-100 text-purple-700" },
    { name: "IN PROGRESS", color: "bg-amber-100 text-amber-700" },
    { name: "VERIFIED", color: "bg-teal-100 text-teal-700" },
    { name: "RESOLVED", color: "bg-green-100 text-green-700" }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
          Civic Transparency
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          Civic Connect is intended to make civic progress easier for communities to understand. Issues follow a strict lifecycle, and public statuses reflect real-world progression without exposing private data or internal audit logs.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4">
          {lifecycle.map((stage, idx) => (
            <React.Fragment key={idx}>
              <div className={\`px-4 py-2 rounded-lg text-sm font-bold tracking-wider whitespace-nowrap \${stage.color}\`}>
                {stage.name}
              </div>
              {idx < lifecycle.length - 1 && (
                <div className="text-gray-300">
                  <ArrowDown className="h-5 w-5 sm:-rotate-90" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CivicTransparency;
`;

const civicConnectCTA = `
import React from 'react';
import { Link } from 'react-router-dom';

const CivicConnectCTA = () => {
  return (
    <section className="bg-blue-600 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-8">
          Have a civic issue to report?
        </h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/citizen/report-issue" className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-bold rounded-md text-blue-600 bg-white hover:bg-gray-50 shadow-md transition-colors">
            Report an Issue
          </Link>
          <Link to="/how-it-works" className="inline-flex justify-center items-center px-8 py-4 border border-white/30 text-lg font-bold rounded-md text-white bg-blue-700 hover:bg-blue-800 transition-colors">
            Learn How SAMADHAN Works
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CivicConnectCTA;
`;

const civicConnectIndex = `
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
`;

const files = {
  [path.join(componentsDir, 'CivicConnectHero.jsx')]: civicConnectHero,
  [path.join(componentsDir, 'CivicIssueMap.jsx')]: civicIssueMap,
  [path.join(componentsDir, 'CommunityOverview.jsx')]: communityOverview,
  [path.join(componentsDir, 'RecentCivicActivity.jsx')]: recentCivicActivity,
  [path.join(componentsDir, 'ResolutionStories.jsx')]: resolutionStories,
  [path.join(componentsDir, 'CommunityImpact.jsx')]: communityImpact,
  [path.join(componentsDir, 'CivicTransparency.jsx')]: civicTransparency,
  [path.join(componentsDir, 'CivicConnectCTA.jsx')]: civicConnectCTA,
  [path.join(pagesDir, 'CivicConnect.jsx')]: civicConnectIndex,
};

Object.entries(files).forEach(([filePath, content]) => {
  fs.writeFileSync(filePath, content.trim() + '\n');
});

console.log('Civic Connect page generated successfully.');
