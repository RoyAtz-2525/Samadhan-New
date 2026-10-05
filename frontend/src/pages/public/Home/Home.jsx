import React from 'react';
import PublicNavbar from '../../../components/public/layout/PublicNavbar';
import PublicFooter from '../../../components/public/layout/PublicFooter';

import HomeHero from '../../../components/public/home/HomeHero';
import ProblemSection from '../../../components/public/home/ProblemSection';
import WhatIsSamadhan from '../../../components/public/home/WhatIsSamadhan';
import ReportCategories from '../../../components/public/home/ReportCategories';
import HowSamadhanWorks from '../../../components/public/home/HowSamadhanWorks';
import PlatformFeatures from '../../../components/public/home/PlatformFeatures';
import ImpactStats from '../../../components/public/home/ImpactStats';
import BuiltForEveryone from '../../../components/public/home/BuiltForEveryone';
import TransparencySection from '../../../components/public/home/TransparencySection';
import HomeCTA from '../../../components/public/home/HomeCTA';


const Home = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <PublicNavbar />
      
      <main className="flex-grow">
        <HomeHero />
        <ProblemSection />
        <WhatIsSamadhan />
        <ReportCategories />
        <HowSamadhanWorks />
        <PlatformFeatures />
        <ImpactStats />
        <BuiltForEveryone />
        <TransparencySection />
        <HomeCTA />
      </main>
      
      <PublicFooter />
    </div>
  );
};

export default Home;
