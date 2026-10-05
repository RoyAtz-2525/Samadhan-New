import React from 'react';
import PublicNavbar from '../../../components/public/layout/PublicNavbar';
import PublicFooter from '../../../components/public/layout/PublicFooter';

import WorkflowHero from '../../../components/public/how-it-works/WorkflowHero';
import WorkflowOverview from '../../../components/public/how-it-works/WorkflowOverview';
import CompleteJourney from '../../../components/public/how-it-works/CompleteJourney';
import ExceptionFlow from '../../../components/public/how-it-works/ExceptionFlow';
import TransparencyWorkflow from '../../../components/public/how-it-works/TransparencyWorkflow';
import WhyThisWorkflow from '../../../components/public/how-it-works/WhyThisWorkflow';
import WorkflowCTA from '../../../components/public/how-it-works/WorkflowCTA';

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <PublicNavbar />
      
      <main className="flex-grow">
        <WorkflowHero />
        <WorkflowOverview />
        <CompleteJourney />
        <ExceptionFlow />
        <TransparencyWorkflow />
        <WhyThisWorkflow />
        <WorkflowCTA />
      </main>
      
      <PublicFooter />
    </div>
  );
};

export default HowItWorks;
