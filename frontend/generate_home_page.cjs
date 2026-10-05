const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 1. DATA FILES
const categoriesContent = `
import { 
  AlertTriangle, 
  Lightbulb, 
  Trash2, 
  Droplet, 
  Waves, 
  MapPin, 
  ShieldAlert, 
  MoreHorizontal 
} from 'lucide-react';

export const reportCategories = [
  { id: 'ROAD_DAMAGE', title: 'Road Damage', description: 'Potholes, broken footpaths, and damaged roads.', icon: AlertTriangle },
  { id: 'STREET_LIGHT', title: 'Street Light', description: 'Non-functional or damaged street lighting.', icon: Lightbulb },
  { id: 'GARBAGE', title: 'Garbage', description: 'Uncollected waste and overflowing bins.', icon: Trash2 },
  { id: 'DRAINAGE', title: 'Drainage', description: 'Blocked drains and sewage issues.', icon: Waves },
  { id: 'WATER_LEAKAGE', title: 'Water Leakage', description: 'Leaking public pipes and water waste.', icon: Droplet },
  { id: 'PUBLIC_TOILET', title: 'Public Toilet', description: 'Unhygienic or damaged public facilities.', icon: MapPin },
  { id: 'TRAFFIC_SAFETY', title: 'Traffic & Safety', description: 'Damaged signals and unsafe crossings.', icon: ShieldAlert },
  { id: 'OTHER', title: 'Other', description: 'Other civic infrastructure issues.', icon: MoreHorizontal }
];
`;
fs.writeFileSync(path.join(srcDir, 'data/public/reportCategories.js'), categoriesContent.trim() + '\n');

const workflowContent = `
import { FileWarning, ClipboardCheck, UserPlus, HardHat, ShieldCheck, CheckCircle } from 'lucide-react';

export const workflowSteps = [
  { id: 'REPORT', title: 'Report', description: 'Citizen reports an issue with photo evidence.', icon: FileWarning },
  { id: 'REVIEW', title: 'Review', description: 'Administrator reviews and approves the issue.', icon: ClipboardCheck },
  { id: 'ASSIGN', title: 'Assign', description: 'Manager assigns the work to a field worker.', icon: UserPlus },
  { id: 'WORK', title: 'Work', description: 'Worker executes and documents the repair.', icon: HardHat },
  { id: 'VERIFY', title: 'Verify', description: 'Manager verifies the completed work.', icon: ShieldCheck },
  { id: 'RESOLVE', title: 'Resolve', description: 'Issue is marked resolved and citizen is notified.', icon: CheckCircle }
];
`;
fs.writeFileSync(path.join(srcDir, 'data/public/workflowSteps.js'), workflowContent.trim() + '\n');


// 2. COMPONENTS

const homeHero = `
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';

const HomeHero = () => {
  return (
    <section className="bg-blue-50 py-16 sm:py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
              Report. <span className="text-blue-600">Track.</span> Resolve.
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-lg">
              SAMADHAN connects citizens, authorities and field workers through a structured civic issue resolution workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/citizen/report-issue" className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                Report an Issue
                <ArrowRight className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
              </Link>
              <Link to="/how-it-works" className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                See How It Works
              </Link>
            </div>
          </div>
          
          <div className="relative hidden lg:block h-[400px] w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 overflow-hidden">
            <div className="absolute inset-0 bg-blue-50/30 rounded-2xl" />
            <div className="relative h-full w-full flex flex-col justify-between">
               <div className="flex justify-between items-start">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-3 w-64 z-10">
                    <div className="bg-red-100 p-2 rounded-full"><MapPin className="text-red-600 h-5 w-5" /></div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Reported</div>
                      <div className="font-semibold text-gray-900 text-sm">Pothole on Main St</div>
                    </div>
                  </div>
               </div>
               
               <div className="absolute left-1/2 top-16 bottom-16 w-1 bg-gradient-to-b from-red-200 via-blue-200 to-green-200 rounded-full transform -translate-x-1/2"></div>
               
               <div className="flex justify-end items-end relative z-10">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-3 w-64">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 font-medium text-right">Resolved</div>
                      <div className="font-semibold text-gray-900 text-sm text-right">Road Repaired</div>
                    </div>
                    <div className="bg-green-100 p-2 rounded-full"><ArrowRight className="text-green-600 h-5 w-5" /></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
`;
fs.writeFileSync(path.join(srcDir, 'components/public/home/HomeHero.jsx'), homeHero.trim() + '\n');


const problemSection = `
import React from 'react';
import { reportCategories } from '../../../data/public/reportCategories';

const ProblemSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
          The Problem with Civic Issues
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
          Civic problems are easy to notice, but often difficult to track from report to resolution.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          {reportCategories.slice(0, 6).map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="flex flex-col items-center bg-gray-50 px-6 py-4 rounded-lg border border-gray-100 shadow-sm w-40">
                <Icon className="h-8 w-8 text-gray-500 mb-2" />
                <span className="text-sm font-medium text-gray-800 text-center">{cat.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
`;
fs.writeFileSync(path.join(srcDir, 'components/public/home/ProblemSection.jsx'), problemSection.trim() + '\n');


const whatIsSamadhan = `
import React from 'react';
import { User, Shield, Briefcase, HardHat, ArrowRight } from 'lucide-react';

const WhatIsSamadhan = () => {
  return (
    <section className="py-16 bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold sm:text-4xl mb-6">
          What is SAMADHAN?
        </h2>
        <p className="text-lg text-blue-100 max-w-3xl mx-auto mb-16">
          SAMADHAN provides one structured workflow from reporting to verified resolution, bringing all stakeholders onto a single platform.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-4 lg:space-x-8">
          <div className="flex flex-col items-center w-full md:w-auto">
            <div className="bg-white text-blue-600 p-4 rounded-full mb-4 shadow-lg">
              <User className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Citizen</h3>
            <p className="text-sm text-blue-200 mt-2 max-w-[150px]">Reports issue</p>
          </div>
          
          <ArrowRight className="hidden md:block h-8 w-8 text-blue-300 flex-shrink-0" />
          
          <div className="flex flex-col items-center w-full md:w-auto">
            <div className="bg-white text-blue-600 p-4 rounded-full mb-4 shadow-lg">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Admin</h3>
            <p className="text-sm text-blue-200 mt-2 max-w-[150px]">Reviews & Approves</p>
          </div>

          <ArrowRight className="hidden md:block h-8 w-8 text-blue-300 flex-shrink-0" />

          <div className="flex flex-col items-center w-full md:w-auto">
            <div className="bg-white text-blue-600 p-4 rounded-full mb-4 shadow-lg">
              <Briefcase className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Manager</h3>
            <p className="text-sm text-blue-200 mt-2 max-w-[150px]">Allocates & Verifies</p>
          </div>

          <ArrowRight className="hidden md:block h-8 w-8 text-blue-300 flex-shrink-0" />

          <div className="flex flex-col items-center w-full md:w-auto">
            <div className="bg-white text-blue-600 p-4 rounded-full mb-4 shadow-lg">
              <HardHat className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Worker</h3>
            <p className="text-sm text-blue-200 mt-2 max-w-[150px]">Executes Work</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIsSamadhan;
`;
fs.writeFileSync(path.join(srcDir, 'components/public/home/WhatIsSamadhan.jsx'), whatIsSamadhan.trim() + '\n');


const reportCategoriesComp = `
import React from 'react';
import { reportCategories } from '../../../data/public/reportCategories';

const ReportCategories = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            What You Can Report
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform categorizes issues to ensure they reach the correct authorities quickly.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-50 text-blue-600 mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.title}</h3>
                <p className="text-sm text-gray-500">{cat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ReportCategories;
`;
fs.writeFileSync(path.join(srcDir, 'components/public/home/ReportCategories.jsx'), reportCategoriesComp.trim() + '\n');


const howSamadhanWorks = `
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { workflowSteps } from '../../../data/public/workflowSteps';

const HowSamadhanWorks = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            How SAMADHAN Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A simplified, transparent workflow ensuring accountability at every step.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative bg-gray-50 rounded-xl p-6 border border-gray-100 h-full flex flex-col">
                <div className="absolute -top-4 -left-4 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {index + 1}
                </div>
                <Icon className="h-10 w-10 text-blue-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 flex-grow">{step.description}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link to="/how-it-works" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors">
            Explore the Full Workflow <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowSamadhanWorks;
`;
fs.writeFileSync(path.join(srcDir, 'components/public/home/HowSamadhanWorks.jsx'), howSamadhanWorks.trim() + '\n');


const platformFeatures = `
import React from 'react';
import { Map, Camera, FileCheck, Users, Eye, TrendingUp, CheckSquare, Activity, Bell, ListTree } from 'lucide-react';

const features = [
  { name: 'Location-based reporting', icon: Map },
  { name: 'Photo/video evidence', icon: Camera },
  { name: 'Structured issue review', icon: FileCheck },
  { name: 'Worker allocation', icon: Users },
  { name: 'Before-work verification', icon: Eye },
  { name: 'Work progress tracking', icon: TrendingUp },
  { name: 'After-work verification', icon: CheckSquare },
  { name: 'Status tracking', icon: Activity },
  { name: 'Notifications', icon: Bell },
  { name: 'Transparent workflow', icon: ListTree },
];

const PlatformFeatures = () => {
  return (
    <section className="py-16 bg-gray-50 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Platform Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools designed to manage civic infrastructure efficiently.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <Icon className="h-8 w-8 text-blue-600 mb-3" />
                <span className="text-sm font-medium text-gray-800">{feature.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PlatformFeatures;
`;
fs.writeFileSync(path.join(srcDir, 'components/public/home/PlatformFeatures.jsx'), platformFeatures.trim() + '\n');


const impactStats = `
import React from 'react';

const ImpactStats = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Built for Measurable Civic Impact
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            SAMADHAN tracks the lifecycle of every reported issue, ensuring true accountability.
          </p>
        </div>
        
        {/* Placeholder for future API integration (No fake stats) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-blue-50 rounded-xl p-8 text-center border border-blue-100 h-full flex flex-col justify-center">
            <div className="text-blue-600 text-xl font-bold uppercase tracking-wider mb-2">Reported</div>
            <p className="text-gray-500 text-sm">Issues submitted by the community</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-8 text-center border border-orange-100 h-full flex flex-col justify-center">
            <div className="text-orange-600 text-xl font-bold uppercase tracking-wider mb-2">Under Review</div>
            <p className="text-gray-500 text-sm">Awaiting administrative validation</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-8 text-center border border-purple-100 h-full flex flex-col justify-center">
            <div className="text-purple-600 text-xl font-bold uppercase tracking-wider mb-2">In Progress</div>
            <p className="text-gray-500 text-sm">Currently assigned and being fixed</p>
          </div>
          <div className="bg-green-50 rounded-xl p-8 text-center border border-green-100 h-full flex flex-col justify-center">
            <div className="text-green-600 text-xl font-bold uppercase tracking-wider mb-2">Resolved</div>
            <p className="text-gray-500 text-sm">Verified as completed by authorities</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;
`;
fs.writeFileSync(path.join(srcDir, 'components/public/home/ImpactStats.jsx'), impactStats.trim() + '\n');


const builtForEveryone = `
import React from 'react';
import { Users, Shield, Settings, HardHat } from 'lucide-react';

const BuiltForEveryone = () => {
  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold sm:text-4xl mb-4">
            Built for Everyone
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            A cohesive ecosystem supporting all roles in the civic infrastructure lifecycle.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors h-full">
            <Users className="h-10 w-10 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Citizens</h3>
            <p className="text-gray-400 text-sm">Report and track civic issues directly from your mobile device.</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-orange-500 transition-colors h-full">
            <Shield className="h-10 w-10 text-orange-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Administrators</h3>
            <p className="text-gray-400 text-sm">Review and verify reported issues to prevent duplicates and spam.</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors h-full">
            <Settings className="h-10 w-10 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Managers</h3>
            <p className="text-gray-400 text-sm">Coordinate assignments, oversee workers, and verify resolutions.</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-colors h-full">
            <HardHat className="h-10 w-10 text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Field Workers</h3>
            <p className="text-gray-400 text-sm">Execute and document civic work with transparent proof of progress.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuiltForEveryone;
`;
fs.writeFileSync(path.join(srcDir, 'components/public/home/BuiltForEveryone.jsx'), builtForEveryone.trim() + '\n');


const transparencySection = `
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const TransparencySection = () => {
  const lifecycle = [
    'Reported', 'Under Review', 'Approved', 'Assigned', 'Work Started', 'Verified', 'Resolved'
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
              Total Transparency
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Unlike traditional systems where complaints disappear into a black box, SAMADHAN exposes the entire issue lifecycle visually.
            </p>
            <p className="text-lg text-gray-600">
              Each stage provides structured progress and accountability, ensuring you always know exactly who is responsible for the next step.
            </p>
          </div>
          
          <div className="w-full lg:w-1/2 bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="space-y-4">
              {lifecycle.map((stage, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className={\`h-6 w-6 \${i === lifecycle.length - 1 ? 'text-green-500' : 'text-blue-500'}\`} />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full w-full overflow-hidden">
                       <div className={\`h-full rounded-full \${i === lifecycle.length - 1 ? 'bg-green-500' : 'bg-blue-500'}\`} style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div className="w-32 text-sm font-medium text-gray-700">
                    {stage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransparencySection;
`;
fs.writeFileSync(path.join(srcDir, 'components/public/home/TransparencySection.jsx'), transparencySection.trim() + '\n');


const homeCTA = `
import React from 'react';
import { Link } from 'react-router-dom';

const HomeCTA = () => {
  return (
    <section className="bg-blue-600 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
          See a civic problem? Start the process.
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join your community in making the city better, one resolved issue at a time.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/citizen/report-issue" className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-bold rounded-md text-blue-600 bg-white hover:bg-gray-50 shadow-md transition-colors">
            Report an Issue
          </Link>
          <Link to="/civic-connect" className="inline-flex justify-center items-center px-8 py-4 border border-white text-lg font-bold rounded-md text-white bg-transparent hover:bg-blue-700 transition-colors">
            Explore Civic Connect
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeCTA;
`;
fs.writeFileSync(path.join(srcDir, 'components/public/home/HomeCTA.jsx'), homeCTA.trim() + '\n');


const homeIndex = `
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
`;
fs.writeFileSync(path.join(srcDir, 'pages/public/Home/Home.jsx'), homeIndex.trim() + '\n');

console.log('Home page generated successfully.');
