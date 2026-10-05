const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components', 'public', 'about');
const pagesDir = path.join(__dirname, 'src', 'pages', 'public', 'About');

// Ensure directories exist
[componentsDir, pagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const aboutHero = `
import React from 'react';

const AboutHero = () => {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Building a More <span className="text-blue-600">Connected</span> Civic Experience
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            SAMADHAN brings citizens, administrators, managers, and field workers into one structured platform for reporting, coordinating, and resolving civic issues.
          </p>
        </div>
      </div>
      
      {/* Subtle civic visual background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-40 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute top-48 -right-24 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      </div>
    </section>
  );
};

export default AboutHero;
`;

const whySamadhan = `
import React from 'react';
import { Search, FileText, CheckCircle, MapPin, Wrench } from 'lucide-react';

const WhySamadhan = () => {
  return (
    <section className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Why SAMADHAN?
          </h2>
          <p className="text-xl text-gray-600">
            Identifying a civic problem is only the beginning. The real challenge is taking it from report to verified resolution.
          </p>
        </div>

        <div className="relative">
          {/* Journey Path */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-100 via-blue-300 to-green-300 transform -translate-y-1/2"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
            {[
              { icon: MapPin, title: "Issue Appears", desc: "A civic issue surfaces in the community." },
              { icon: Search, title: "Citizen Notices", desc: "A citizen observes and reports the issue." },
              { icon: FileText, title: "Review", desc: "Authorities validate the reported problem." },
              { icon: Wrench, title: "Execution", desc: "Field workers execute the coordinated fix." },
              { icon: CheckCircle, title: "Resolution", desc: "The result is verified and marked complete." }
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="bg-white border-4 border-blue-50 h-16 w-16 rounded-full flex items-center justify-center shadow-md mb-4 relative z-10 text-blue-600">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySamadhan;
`;

const ourSolution = `
import React from 'react';
import { Layers, Workflow, Camera, Eye } from 'lucide-react';

const OurSolution = () => {
  const pillars = [
    {
      title: "One Platform",
      description: "Connect civic stakeholders in one system.",
      icon: Layers,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Structured Workflow",
      description: "Move issues through clearly defined stages.",
      icon: Workflow,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Evidence-Based Progress",
      description: "Use photos, videos, location, and verification.",
      icon: Camera,
      color: "text-teal-600",
      bg: "bg-teal-50"
    },
    {
      title: "Transparent Resolution",
      description: "Make progress easier to understand and track.",
      icon: Eye,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Our Solution
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            SAMADHAN approaches civic issue resolution through a structured methodology designed to foster accountability and coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className={\`\${pillar.bg} \${pillar.color} h-12 w-12 rounded-xl flex items-center justify-center mb-6\`}>
                <pillar.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{pillar.title}</h3>
              <p className="text-gray-600">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurSolution;
`;

const missionVision = `
import React from 'react';
import { Target, Lightbulb } from 'lucide-react';

const MissionVision = () => {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          <div className="relative p-8 rounded-2xl bg-blue-600 text-white overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 text-blue-500 opacity-20">
              <Target className="h-64 w-64" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="h-8 w-8 text-blue-200" />
                <h2 className="text-3xl font-extrabold tracking-tight">Mission</h2>
              </div>
              <p className="text-xl leading-relaxed text-blue-50 font-medium">
                Make civic issue reporting and resolution more structured, transparent, and accessible.
              </p>
            </div>
          </div>

          <div className="relative p-8 rounded-2xl bg-gray-900 text-white overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 text-gray-800 opacity-50">
              <Lightbulb className="h-64 w-64" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <Lightbulb className="h-8 w-8 text-gray-400" />
                <h2 className="text-3xl font-extrabold tracking-tight">Vision</h2>
              </div>
              <p className="text-xl leading-relaxed text-gray-300 font-medium">
                Build a connected civic ecosystem where communities and civic teams can work together with greater visibility and accountability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
`;

const whoWeConnect = `
import React from 'react';
import { Users, Shield, Briefcase, HardHat, ArrowRight } from 'lucide-react';

const WhoWeConnect = () => {
  const roles = [
    {
      title: 'CITIZENS',
      description: 'Report civic issues and follow their progress.',
      icon: Users,
      color: 'bg-indigo-100 text-indigo-700',
    },
    {
      title: 'ADMINISTRATORS',
      description: 'Review and verify reported issues.',
      icon: Shield,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'MANAGERS',
      description: 'Coordinate approved work and field assignments.',
      icon: Briefcase,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      title: 'FIELD WORKERS',
      description: 'Execute assigned work and provide progress evidence.',
      icon: HardHat,
      color: 'bg-orange-100 text-orange-700',
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Who SAMADHAN Connects
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A structured civic platform relies on clear roles and responsibilities.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4">
          {roles.map((role, index) => (
            <React.Fragment key={index}>
              <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full lg:w-auto hover:shadow-md transition-shadow">
                <div className={\`inline-flex p-3 rounded-lg \${role.color} mb-4\`}>
                  <role.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
              {index < roles.length - 1 && (
                <div className="hidden lg:flex items-center text-gray-300">
                  <ArrowRight className="h-8 w-8" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoWeConnect;
`;

const ourPrinciples = `
import React from 'react';
import { Eye, ShieldCheck, Accessibility, Camera, Users } from 'lucide-react';

const OurPrinciples = () => {
  const principles = [
    {
      title: 'Transparency',
      description: 'Clear visibility into the status of civic reports at every stage.',
      icon: Eye
    },
    {
      title: 'Accountability',
      description: 'Ensuring responsible parties are assigned and tracked.',
      icon: ShieldCheck
    },
    {
      title: 'Accessibility',
      description: 'Making the reporting process straightforward for everyone.',
      icon: Accessibility
    },
    {
      title: 'Evidence',
      description: 'Relying on media and location data to verify claims and fixes.',
      icon: Camera
    },
    {
      title: 'Community',
      description: 'Fostering collaboration between citizens and local authorities.',
      icon: Users
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 border-l-4 border-blue-600 pl-6">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Our Principles
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            The core values guiding the design and operation of the SAMADHAN platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {principles.map((principle, index) => (
            <div key={index} className="flex space-x-4 p-6 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <principle.icon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{principle.title}</h3>
                <p className="text-gray-600 text-sm">{principle.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurPrinciples;
`;

const whatWeAimToAchieve = `
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const WhatWeAimToAchieve = () => {
  const goals = [
    "Better visibility into civic issues",
    "Clearer coordination between teams",
    "Structured field operations",
    "Evidence-based verification",
    "Transparent issue progress",
    "Greater citizen participation"
  ];

  return (
    <section className="py-16 sm:py-24 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-extrabold sm:text-4xl mb-6">
              What We Aim to Achieve
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Our platform is designed to systematically improve how civic environments are managed. We are building toward a future characterized by:
            </p>
          </div>
          
          <div>
            <ul className="space-y-6">
              {goals.map((goal, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="ml-4 text-lg text-gray-200 font-medium">
                    {goal}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeAimToAchieve;
`;

const aboutCTA = `
import React from 'react';
import { Link } from 'react-router-dom';

const AboutCTA = () => {
  return (
    <section className="bg-blue-600 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
          Have a civic issue to report?
        </h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link to="/citizen/report-issue" className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-bold rounded-md text-blue-600 bg-white hover:bg-gray-50 shadow-md transition-colors">
            Report an Issue
          </Link>
          <Link to="/how-it-works" className="inline-flex justify-center items-center px-8 py-4 border border-white text-lg font-bold rounded-md text-white bg-transparent hover:bg-blue-700 transition-colors">
            See How It Works
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutCTA;
`;

const aboutIndex = `
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
`;

const files = {
  [path.join(componentsDir, 'AboutHero.jsx')]: aboutHero,
  [path.join(componentsDir, 'WhySamadhan.jsx')]: whySamadhan,
  [path.join(componentsDir, 'OurSolution.jsx')]: ourSolution,
  [path.join(componentsDir, 'MissionVision.jsx')]: missionVision,
  [path.join(componentsDir, 'WhoWeConnect.jsx')]: whoWeConnect,
  [path.join(componentsDir, 'OurPrinciples.jsx')]: ourPrinciples,
  [path.join(componentsDir, 'WhatWeAimToAchieve.jsx')]: whatWeAimToAchieve,
  [path.join(componentsDir, 'AboutCTA.jsx')]: aboutCTA,
  [path.join(pagesDir, 'About.jsx')]: aboutIndex,
};

Object.entries(files).forEach(([filePath, content]) => {
  fs.writeFileSync(filePath, content.trim() + '\n');
});

console.log('About page generated successfully.');
