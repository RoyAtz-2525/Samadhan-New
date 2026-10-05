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
  'utils/public',
  'routes'
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
    const p = path.join(srcDir, 'components/public', folder, comp + '.jsx');
    fs.writeFileSync(p, "import React from 'react';\n\nconst " + comp + " = () => {\n  return (\n    <div>\n      <h2>" + comp + "</h2>\n      {/* TODO: Implement " + comp + " */}\n    </div>\n  );\n};\n\nexport default " + comp + ";\n");
  }
}

// Layout components
fs.writeFileSync(path.join(srcDir, 'components/public/layout/PublicNavbar.jsx'), "import React from 'react';\nimport { Link, useNavigate } from 'react-router-dom';\nimport { useAuth } from '../../../context/AuthContext';\n\nconst PublicNavbar = () => {\n  const { user, logout } = useAuth();\n  const navigate = useNavigate();\n\n  const handleLogout = () => {\n    logout();\n    navigate('/');\n  };\n\n  return (\n    <nav className=\"bg-white shadow\">\n      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n        <div className=\"flex justify-between h-16\">\n          <div className=\"flex\">\n            <div className=\"flex-shrink-0 flex items-center\">\n              <Link to=\"/\" className=\"text-xl font-bold text-blue-600\">SAMADHAN</Link>\n            </div>\n            <div className=\"hidden sm:ml-6 sm:flex sm:space-x-8\">\n              <Link to=\"/\" className=\"text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium\">Home</Link>\n              <Link to=\"/about\" className=\"text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium\">About</Link>\n              <Link to=\"/how-it-works\" className=\"text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium\">How It Works</Link>\n              <Link to=\"/civic-connect\" className=\"text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium\">Civic Connect</Link>\n            </div>\n          </div>\n          <div className=\"hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4\">\n            {!user ? (\n              <>\n                <Link to=\"/login\" className=\"text-gray-500 hover:text-gray-700 text-sm font-medium\">Login</Link>\n                <Link to=\"/citizen/report\" className=\"bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium\">Report an Issue</Link>\n              </>\n            ) : (\n              <>\n                <Link to=\"/notifications\" className=\"text-gray-500 hover:text-gray-700 text-sm font-medium\">Notifications</Link>\n                <Link to=\"/dashboard\" className=\"text-gray-500 hover:text-gray-700 text-sm font-medium\">Dashboard</Link>\n                <Link to=\"/profile\" className=\"text-gray-500 hover:text-gray-700 text-sm font-medium\">Account</Link>\n                <button onClick={handleLogout} className=\"text-gray-500 hover:text-gray-700 text-sm font-medium\">Logout</button>\n              </>\n            )}\n          </div>\n        </div>\n      </div>\n    </nav>\n  );\n};\n\nexport default PublicNavbar;\n");

fs.writeFileSync(path.join(srcDir, 'components/public/layout/PublicFooter.jsx'), "import React from 'react';\nimport { Link } from 'react-router-dom';\n\nconst PublicFooter = () => {\n  return (\n    <footer className=\"bg-gray-800 text-white py-8\">\n      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n        <div className=\"grid grid-cols-1 md:grid-cols-4 gap-8\">\n          <div>\n            <h3 className=\"text-xl font-bold mb-4\">SAMADHAN</h3>\n            <p className=\"text-sm text-gray-400\">Connecting citizens and civic authorities to quickly resolve infrastructure issues and build better communities.</p>\n          </div>\n          <div>\n            <h4 className=\"font-semibold mb-4\">Navigation</h4>\n            <ul className=\"space-y-2 text-sm text-gray-400\">\n              <li><Link to=\"/\" className=\"hover:text-white\">Home</Link></li>\n              <li><Link to=\"/about\" className=\"hover:text-white\">About</Link></li>\n              <li><Link to=\"/how-it-works\" className=\"hover:text-white\">How It Works</Link></li>\n              <li><Link to=\"/civic-connect\" className=\"hover:text-white\">Civic Connect</Link></li>\n            </ul>\n          </div>\n          <div>\n            <h4 className=\"font-semibold mb-4\">Account</h4>\n            <ul className=\"space-y-2 text-sm text-gray-400\">\n              <li><Link to=\"/login\" className=\"hover:text-white\">Login</Link></li>\n              <li><Link to=\"/register\" className=\"hover:text-white\">Register</Link></li>\n              <li><Link to=\"/dashboard\" className=\"hover:text-white\">Dashboard</Link></li>\n            </ul>\n          </div>\n          <div>\n            <h4 className=\"font-semibold mb-4\">Legal</h4>\n            <ul className=\"space-y-2 text-sm text-gray-400\">\n              <li><Link to=\"/privacy\" className=\"hover:text-white\">Privacy Policy</Link></li>\n              <li><Link to=\"/terms\" className=\"hover:text-white\">Terms of Service</Link></li>\n            </ul>\n          </div>\n        </div>\n      </div>\n    </footer>\n  );\n};\n\nexport default PublicFooter;\n");

// Pages
const pages = {
  'Home': ['HomeHero', 'ProblemSection', 'WhatIsSamadhan', 'ReportCategories', 'HowSamadhanWorks', 'PlatformFeatures', 'ImpactStats', 'BuiltForEveryone', 'TransparencySection', 'HomeCTA'],
  'About': ['AboutHero', 'WhySamadhan', 'OurSolution', 'MissionVision', 'WhoWeConnect', 'OurPrinciples', 'WhatWeAimToAchieve', 'AboutCTA'],
  'HowItWorks': ['WorkflowHero', 'WorkflowOverview', 'WorkflowStep', 'CompleteJourney', 'ExceptionFlow', 'TransparencyWorkflow', 'WhyThisWorkflow', 'WorkflowCTA'],
  'CivicConnect': ['CivicConnectHero', 'CivicIssueMap', 'CommunityOverview', 'RecentCivicActivity', 'ResolutionStories', 'CommunityImpact', 'CivicTransparency', 'CivicConnectCTA']
};

for (const [page, comps] of Object.entries(pages)) {
  fs.writeFileSync(path.join(srcDir, 'pages/public', page, page + '.jsx'), "import React from 'react';\nimport PublicNavbar from '../../../components/public/layout/PublicNavbar';\nimport PublicFooter from '../../../components/public/layout/PublicFooter';\n\nconst " + page + " = () => {\n  return (\n    <div className=\"min-h-screen flex flex-col\">\n      <PublicNavbar />\n      <main className=\"flex-grow\">\n        <h1 className=\"text-3xl font-bold p-8 text-center\">" + page + "</h1>\n        {/* TODO: integrate " + comps.join(', ') + " */}\n      </main>\n      <PublicFooter />\n    </div>\n  );\n};\n\nexport default " + page + ";\n");
}

// Services placeholders
['publicStatsService.js', 'civicConnectService.js', 'publicIssueService.js'].forEach(f => {
  fs.writeFileSync(path.join(srcDir, 'services/public', f), "// TODO: Implement " + f + "\nexport {};\n");
});

// Data placeholders
['reportCategories.js', 'workflowSteps.js', 'publicContent.js'].forEach(f => {
  fs.writeFileSync(path.join(srcDir, 'data/public', f), "// TODO: Implement " + f + "\nexport default {};\n");
});

// Hooks placeholders
['usePublicStats.js', 'useCivicConnect.js'].forEach(f => {
  fs.writeFileSync(path.join(srcDir, 'hooks/public', f), "// TODO: Implement " + f + "\nexport {};\n");
});

// Utils placeholders
['publicFormatters.js', 'publicHelpers.js'].forEach(f => {
  fs.writeFileSync(path.join(srcDir, 'utils/public', f), "// TODO: Implement " + f + "\nexport {};\n");
});

fs.writeFileSync(path.join(srcDir, 'routes/publicRoutes.jsx'), "import React from 'react';\nimport { Route } from 'react-router-dom';\nimport Home from '../pages/public/Home/Home';\nimport About from '../pages/public/About/About';\nimport HowItWorks from '../pages/public/HowItWorks/HowItWorks';\nimport CivicConnect from '../pages/public/CivicConnect/CivicConnect';\n\nexport const PublicRoutes = [\n  <Route key=\"home\" path=\"/\" element={<Home />} />,\n  <Route key=\"about\" path=\"/about\" element={<About />} />,\n  <Route key=\"how-it-works\" path=\"/how-it-works\" element={<HowItWorks />} />,\n  <Route key=\"civic-connect\" path=\"/civic-connect\" element={<CivicConnect />} />\n];\n");

console.log('Structure generated successfully.');
