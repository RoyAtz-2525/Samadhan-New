import React from 'react';
import PublicNavbar from '../../../components/public/layout/PublicNavbar';
import PublicFooter from '../../../components/public/layout/PublicFooter';

import AboutHero from '../../../components/public/about/AboutHero';
import WhySamadhan from '../../../components/public/about/WhySamadhan';
import OurSolution from '../../../components/public/about/OurSolution';
import MissionVision from '../../../components/public/about/MissionVision';
import WhoWeConnect from '../../../components/public/about/WhoWeConnect';
import OurPrinciples from '../../../components/public/about/OurPrinciples';
import WhatWeAimToAchieve from '../../../components/public/about/WhatWeAimToAchieve';
import AboutCTA from '../../../components/public/about/AboutCTA';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <PublicNavbar />
      
      <main className="flex-grow">
        <AboutHero />
        <WhySamadhan />
        <OurSolution />
        <MissionVision />
        <WhoWeConnect />
        <OurPrinciples />
        <WhatWeAimToAchieve />
        <AboutCTA />
      </main>
      
      <PublicFooter />
    </div>
  );
};

export default About;
