const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/components/public/how-it-works/WorkflowCTA.jsx',
  'src/components/public/civic-connect/CivicConnectHero.jsx',
  'src/components/public/civic-connect/CivicConnectCTA.jsx',
  'src/components/public/home/HomeCTA.jsx',
  'src/components/public/home/HomeHero.jsx',
  'src/components/public/about/AboutCTA.jsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already processed
  if (content.includes('useAuth')) {
    console.log(`Already processed: ${file}`);
    return;
  }

  // 1. Add import
  content = content.replace(
    "import { Link } from 'react-router-dom';",
    "import { Link } from 'react-router-dom';\nimport { useAuth } from '../../../context/AuthContext';"
  );
  
  if (!content.includes('../../../context/AuthContext')) {
     content = content.replace(
      "import { Link } from \"react-router-dom\";",
      "import { Link } from 'react-router-dom';\nimport { useAuth } from '../../../context/AuthContext';"
    );
  }

  // 2. Add useAuth hook
  const componentNameMatch = content.match(/const\s+([A-Za-z0-9_]+)\s*=\s*\(\)\s*=>\s*\{/);
  if (componentNameMatch) {
    const componentStart = componentNameMatch[0];
    content = content.replace(
      componentStart,
      `${componentStart}\n  const { user } = useAuth();`
    );
  }

  // 3. Replace the link
  content = content.replace(
    'to="/citizen/report-issue"',
    'to={user ? "/citizen/report-issue" : "/register"}'
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated: ${file}`);
});
