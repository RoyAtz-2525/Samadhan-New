const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const dirs = [
  'pages/public/Home',
  'pages/public/About',
  'pages/public/HowItWorks',
  'pages/public/CivicConnect',
  'components/public/layout',
  'components/public/home',
  'components/public/about',
  'components/public/how-it-works',
  'components/public/civic-connect',
  'services/public',
  'data/public',
  'hooks/public',
  'utils/public'
];

dirs.forEach(d => {
  const dirPath = path.join(srcDir, d);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Components definition
const components = {
  'home': ['HomeHero', 'ProblemSection', 'WhatIsSamadhan', 'ReportCategories', 'HowSamadhanWorks', 'PlatformFeatures', 'ImpactStats', 'BuiltForEveryone', 'TransparencySection', 'HomeCTA'],
  'about': ['AboutHero', 'WhySamadhan', 'OurSolution', 'MissionVision', 'WhoWeConnect', 'OurPrinciples', 'WhatWeAimToAchieve', 'AboutCTA'],
  'how-it-works': ['WorkflowHero', 'WorkflowOverview', 'WorkflowStep', 'CompleteJourney', 'ExceptionFlow', 'TransparencyWorkflow', 'WhyThisWorkflow', 'WorkflowCTA'],
  'civic-connect': ['CivicConnectHero', 'CivicIssueMap', 'CommunityOverview', 'RecentCivicActivity', 'ResolutionStories', 'CommunityImpact', 'CivicTransparency', 'CivicConnectCTA']
};

for (const [folder, comps] of Object.entries(components)) {
  for (const comp of comps) {
    const p = path.join(srcDir, 'components/public', folder, `${comp}.jsx`);
    fs.writeFileSync(p, `import React from 'react';\n\nconst ${comp} = () => {\n  return (\n    <div>\n      <h2>${comp}</h2>\n      {/* TODO: Implement ${comp} */}\n    </div>\n  );\n};\n\nexport default ${comp};\n`);
  }
}

// Layout components
fs.writeFileSync(path.join(srcDir, 'components/public/layout/PublicNavbar.jsx'), `import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const PublicNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">SAMADHAN</Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium">Home</Link>
              <Link to="/about" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium">About</Link>
              <Link to="/how-it-works" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium">How It Works</Link>
              <Link to="/civic-connect" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium">Civic Connect</Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {!user ? (
              <>
                <Link to="/login" className="text-gray-500 hover:text-gray-700 text-sm font-medium">Login</Link>
                <Link to="/citizen/report" className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">Report an Issue</Link>
              </>
            ) : (
              <>
                <Link to="/notifications" className="text-gray-500 hover:text-gray-700 text-sm font-medium">Notifications</Link>
                <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 text-sm font-medium">Dashboard</Link>
                <Link to="/profile" className="text-gray-500 hover:text-gray-700 text-sm font-medium">Account</Link>
                <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700 text-sm font-medium">Logout</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
`);

fs.writeFileSync(path.join(srcDir, 'components/public/layout/PublicFooter.jsx'), `import React from 'react';
import { Link } from 'react-router-dom';

const PublicFooter = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">SAMADHAN</h3>
            <p className="text-sm text-gray-400">Connecting citizens and civic authorities to quickly resolve infrastructure issues and build better communities.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
              <li><Link to="/civic-connect" className="hover:text-white">Civic Connect</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/login" className="hover:text-white">Login</Link></li>
              <li><Link to="/register" className="hover:text-white">Register</Link></li>
              <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
`);

// Pages
const pages = {
  'Home': ['HomeHero', 'ProblemSection', 'WhatIsSamadhan', 'ReportCategories', 'HowSamadhanWorks', 'PlatformFeatures', 'ImpactStats', 'BuiltForEveryone', 'TransparencySection', 'HomeCTA'],
  'About': ['AboutHero', 'WhySamadhan', 'OurSolution', 'MissionVision', 'WhoWeConnect', 'OurPrinciples', 'WhatWeAimToAchieve', 'AboutCTA'],
  'HowItWorks': ['WorkflowHero', 'WorkflowOverview', 'WorkflowStep', 'CompleteJourney', 'ExceptionFlow', 'TransparencyWorkflow', 'WhyThisWorkflow', 'WorkflowCTA'],
  'CivicConnect': ['CivicConnectHero', 'CivicIssueMap', 'CommunityOverview', 'RecentCivicActivity', 'ResolutionStories', 'CommunityImpact', 'CivicTransparency', 'CivicConnectCTA']
};

for (const [page, comps] of Object.entries(pages)) {
  fs.writeFileSync(path.join(srcDir, \`pages/public/\${page}/\${page}.jsx\`), \`import React from 'react';
import PublicNavbar from '../../components/public/layout/PublicNavbar';
import PublicFooter from '../../components/public/layout/PublicFooter';

const \${page} = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-grow">
        <h1 className="text-3xl font-bold p-8 text-center">\${page}</h1>
        {/* TODO: integrate \${comps.join(', ')} */}
      </main>
      <PublicFooter />
    </div>
  );
};

export default \${page};
\`);
}

// Services placeholders
['publicStatsService.js', 'civicConnectService.js', 'publicIssueService.js'].forEach(f => {
  fs.writeFileSync(path.join(srcDir, 'services/public', f), \`// TODO: Implement \${f}\nexport {};\n\`);
});

// Data placeholders
['reportCategories.js', 'workflowSteps.js', 'publicContent.js'].forEach(f => {
  fs.writeFileSync(path.join(srcDir, 'data/public', f), \`// TODO: Implement \${f}\nexport default {};\n\`);
});

// Hooks placeholders
['usePublicStats.js', 'useCivicConnect.js'].forEach(f => {
  fs.writeFileSync(path.join(srcDir, 'hooks/public', f), \`// TODO: Implement \${f}\nexport {};\n\`);
});

// Utils placeholders
['publicFormatters.js', 'publicHelpers.js'].forEach(f => {
  fs.writeFileSync(path.join(srcDir, 'utils/public', f), \`// TODO: Implement \${f}\nexport {};\n\`);
});

console.log('Structure generated successfully.');
