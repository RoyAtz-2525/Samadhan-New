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

  const oldLogic = 'to={user ? "/citizen/report-issue" : "/register"}';
  const newLogic = `to={!user ? "/register" : user.role?.name === 'CITIZEN' ? "/citizen/report-issue" : user.role?.name === 'ADMIN' ? "/admin" : user.role?.name === 'MANAGER' ? "/manager" : user.role?.name === 'WORKER' ? "/worker" : user.role?.name === 'SUPER_ADMIN' ? "/super-admin" : "/"} state={!user ? { from: "/citizen/report-issue" } : undefined}`;

  if (content.includes(oldLogic)) {
    content = content.replace(oldLogic, newLogic);
    fs.writeFileSync(filePath, content);
    console.log(`Updated CTA logic: ${file}`);
  }
});
