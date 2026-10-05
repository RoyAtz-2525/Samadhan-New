const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components', 'public', 'how-it-works');
const pagesDir = path.join(__dirname, 'src', 'pages', 'public', 'HowItWorks');

// Ensure directories exist
[componentsDir, pagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const workflowHero = `
import React from 'react';
import { GitMerge } from 'lucide-react';

const WorkflowHero = () => {
  return (
    <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16 sm:py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-8 shadow-lg">
            <GitMerge className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            From Report to <span className="text-blue-400">Resolution</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            See how SAMADHAN moves a civic issue through reporting, review, assignment, field work, verification, and resolution.
          </p>
        </div>
      </div>
      
      {/* Visual workflow motif background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="workflow-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M10 50 h80 M90 50 l-10 -10 M90 50 l-10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#workflow-pattern)" />
        </svg>
      </div>
    </section>
  );
};

export default WorkflowHero;
`;

const workflowOverview = `
import React from 'react';
import { ArrowRight, AlertCircle, FileCheck, CheckCircle, UserCheck, Search, HardHat, Eye, Star, CreditCard } from 'lucide-react';

const WorkflowOverview = () => {
  const steps = [
    { num: '01', title: 'Report', icon: AlertCircle },
    { num: '02', title: 'Review', icon: Search },
    { num: '03', title: 'Assign', icon: UserCheck },
    { num: '04', title: 'Accept', icon: FileCheck },
    { num: '05', title: 'Verify', icon: Eye },
    { num: '06', title: 'Work', icon: HardHat },
    { num: '07', title: 'Verify', icon: Eye },
    { num: '08', title: 'Resolve', icon: CheckCircle },
    { num: '09', title: 'Pay', icon: CreditCard },
    { num: '10', title: 'Feedback', icon: Star }
  ];

  return (
    <section className="py-12 bg-white border-b border-gray-100 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-[800px]">
        <div className="flex items-center justify-between space-x-2">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center flex-1">
                <div className="bg-gray-50 border border-gray-200 h-12 w-12 rounded-full flex items-center justify-center mb-3 text-blue-600 shadow-sm relative z-10 group hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="text-xs font-bold text-gray-400 mb-1">{step.num}</div>
                <div className="text-sm font-semibold text-gray-900">{step.title}</div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-300 mb-6 relative">
                  <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 h-4 w-4 text-gray-300" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkflowOverview;
`;

const completeJourney = `
import React from 'react';
import WorkflowStep from './WorkflowStep';

const CompleteJourney = () => {
  const journeySteps = [
    {
      id: 1,
      title: "Citizen Reports",
      role: "CITIZEN",
      action: "Citizen provides issue category, description, location, and photo/video evidence where applicable. The report enters the civic workflow.",
      result: "Issue state changes to REPORTED"
    },
    {
      id: 2,
      title: "Admin Reviews",
      role: "ADMIN",
      action: "Admin reviews the submitted issue. Admin can approve, reject, or prioritize. If rejected, the reason is recorded. Admin does NOT assign workers.",
      result: "Issue state changes to UNDER_REVIEW"
    },
    {
      id: 3,
      title: "Issue Approved",
      role: "ADMIN",
      action: "Admin approves the issue, making it available for manager coordination.",
      result: "Issue state changes to APPROVED"
    },
    {
      id: 4,
      title: "Manager Assigns Worker",
      role: "MANAGER",
      action: "Manager reviews issue details, worker availability, relevant skills, and assignment suitability. Manager assigns an appropriate worker.",
      result: "Issue state changes to ASSIGNED"
    },
    {
      id: 5,
      title: "Worker Accepts",
      role: "WORKER",
      action: "Worker reviews the assignment and can accept or reject it. If rejected, it does not become active work.",
      result: "Assignment state changes to ACCEPTED"
    },
    {
      id: 6,
      title: "Before-Work Verification",
      role: "WORKER / MANAGER",
      action: "Worker submits location verification and evidence. Manager reviews it. Only approved verification allows work to begin.",
      result: "Issue state changes to WORK_STARTED"
    },
    {
      id: 7,
      title: "Work Execution",
      role: "WORKER",
      action: "Worker performs the assigned work, submits progress updates, notes, and media, then completes the assignment with completion evidence.",
      result: "Issue state changes to WORK_COMPLETED"
    },
    {
      id: 8,
      title: "After-Work Verification",
      role: "WORKER / MANAGER",
      action: "Worker submits work summary, location, and completion evidence. Manager reviews the result and can approve, reject, or request revision.",
      result: "Issue state changes to UNDER_VERIFICATION"
    },
    {
      id: 9,
      title: "Issue Resolved",
      role: "SYSTEM / MANAGER",
      action: "When after-work verification is approved, the issue is formally closed. This is the actual resolution point.",
      result: "Issue state changes to RESOLVED"
    },
    {
      id: 10,
      title: "Worker Payment",
      role: "MANAGER",
      action: "Manager pays the worker for eligible completed work through the platform's payment workflow. Payment amount is based on the assigned work rate.",
      result: "Payment is processed (Post-resolution operational step)"
    },
    {
      id: 11,
      title: "Citizen Feedback",
      role: "CITIZEN",
      action: "The citizen can provide feedback/review after the issue has reached the appropriate completed/resolved stage.",
      result: "Feedback recorded (Does not change issue status)"
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            The Complete Journey
          </h2>
          <p className="text-lg text-gray-600">
            A detailed look at how responsibility moves through the workflow.
          </p>
        </div>

        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
          {journeySteps.map((step, index) => (
            <WorkflowStep key={step.id} step={step} isLeft={index % 2 === 0} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompleteJourney;
`;

const workflowStep = `
import React from 'react';
import { User, Shield, Briefcase, HardHat, Settings } from 'lucide-react';

const WorkflowStep = ({ step, isLeft }) => {
  const getRoleColor = (role) => {
    if (role.includes('CITIZEN')) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    if (role.includes('ADMIN')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (role.includes('MANAGER')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (role.includes('WORKER')) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getRoleIcon = (role) => {
    if (role.includes('CITIZEN')) return <User className="w-5 h-5" />;
    if (role.includes('ADMIN')) return <Shield className="w-5 h-5" />;
    if (role.includes('MANAGER')) return <Briefcase className="w-5 h-5" />;
    if (role.includes('WORKER')) return <HardHat className="w-5 h-5" />;
    return <Settings className="w-5 h-5" />;
  };

  return (
    <div className={\`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active\`}>
      
      {/* Icon Node */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-white z-10 font-bold text-sm">
        {step.id}
      </div>
      
      {/* Content Card */}
      <div className={\`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl shadow-sm border border-gray-100\`}>
        <div className="flex items-center space-x-3 mb-3">
          <div className={\`flex items-center space-x-1 px-3 py-1 rounded-full border text-xs font-bold \${getRoleColor(step.role)}\`}>
            {getRoleIcon(step.role)}
            <span>{step.role}</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">{step.action}</p>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Resulting State</div>
          <div className="text-sm font-medium text-gray-900">{step.result}</div>
        </div>
      </div>
      
    </div>
  );
};

export default WorkflowStep;
`;

const exceptionFlow = `
import React from 'react';
import { AlertTriangle, CornerDownRight } from 'lucide-react';

const ExceptionFlow = () => {
  const exceptions = [
    {
      title: "Admin Rejects Issue",
      result: "The issue does not proceed to assignment. It is marked rejected with a reason."
    },
    {
      title: "Worker Rejects Assignment",
      result: "The manager can handle the assignment accordingly and re-assign a different worker."
    },
    {
      title: "Before-Work Verification Rejected",
      result: "Work does not proceed until the required verification process is satisfied or revised."
    },
    {
      title: "After-Work Verification Rejected",
      result: "Issue remains in the appropriate work-completion state and corrective action or revision may be required."
    },
    {
      title: "Payment Failure",
      result: "Payment can be retried without changing the resolved issue state."
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-3 mb-12">
          <AlertTriangle className="h-8 w-8 text-orange-500" />
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            If Something Needs Correction
          </h2>
        </div>
        
        <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          The workflow can seamlessly handle unsuccessful stages. Depending on the stage, the item may be rejected, sent back for revision, or require further action.
        </p>

        <div className="space-y-4">
          {exceptions.map((ex, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="w-full sm:w-1/2 font-bold text-gray-900 text-lg mb-2 sm:mb-0">
                {ex.title}
              </div>
              <div className="hidden sm:flex items-center justify-center w-12 text-gray-400">
                <CornerDownRight className="h-6 w-6" />
              </div>
              <div className="w-full sm:w-1/2 text-gray-600 sm:pl-4 border-l-0 sm:border-l-2 border-gray-200 pt-2 sm:pt-0">
                {ex.result}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExceptionFlow;
`;

const transparencyWorkflow = `
import React from 'react';
import { ChevronRight } from 'lucide-react';

const TransparencyWorkflow = () => {
  const statuses = [
    "REPORTED",
    "UNDER REVIEW",
    "APPROVED",
    "ASSIGNED",
    "WORK STARTED",
    "WORK COMPLETED",
    "UNDER VERIFICATION",
    "RESOLVED"
  ];

  return (
    <section className="py-16 sm:py-24 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold sm:text-4xl mb-6">
          Transparency by Design
        </h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-16">
          The platform maintains structured status progression and verification checkpoints. Every transition is recorded securely without exposing private user information.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-y-4">
          {statuses.map((status, idx) => (
            <React.Fragment key={idx}>
              <div className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg text-sm font-bold tracking-wider text-blue-400 whitespace-nowrap">
                {status}
              </div>
              {idx < statuses.length - 1 && (
                <div className="px-2 text-gray-500">
                  <ChevronRight className="h-5 w-5" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransparencyWorkflow;
`;

const whyThisWorkflow = `
import React from 'react';
import { UserCheck, Waypoints, Camera, Briefcase, SplitSquareHorizontal, History } from 'lucide-react';

const WhyThisWorkflow = () => {
  const principles = [
    {
      title: "Clear Responsibility",
      desc: "Every stage has a responsible role.",
      icon: UserCheck
    },
    {
      title: "Structured Progress",
      desc: "Issues move through defined states.",
      icon: Waypoints
    },
    {
      title: "Evidence-Based Verification",
      desc: "Photos, videos and location can support field verification.",
      icon: Camera
    },
    {
      title: "Controlled Assignment",
      desc: "Managers coordinate workers instead of assigning work arbitrarily.",
      icon: Briefcase
    },
    {
      title: "Separation of Work & Verification",
      desc: "The worker performs the work; the manager verifies the result.",
      icon: SplitSquareHorizontal
    },
    {
      title: "Operational Transparency",
      desc: "Progress can be represented through issue status and history.",
      icon: History
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Why This Workflow?
          </h2>
          <p className="text-lg text-gray-600">
            Our design principles ensure accountability and clear operational boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {principles.map((item, idx) => (
            <div key={idx} className="bg-blue-50 p-8 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow">
              <div className="bg-white h-12 w-12 rounded-xl flex items-center justify-center shadow-sm mb-6 text-blue-600">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyThisWorkflow;
`;

const workflowCTA = `
import React from 'react';
import { Link } from 'react-router-dom';

const WorkflowCTA = () => {
  return (
    <section className="bg-blue-600 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-8">
          Ready to report a civic issue?
        </h2>
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

export default WorkflowCTA;
`;

const howItWorksIndex = `
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
`;

const files = {
  [path.join(componentsDir, 'WorkflowHero.jsx')]: workflowHero,
  [path.join(componentsDir, 'WorkflowOverview.jsx')]: workflowOverview,
  [path.join(componentsDir, 'CompleteJourney.jsx')]: completeJourney,
  [path.join(componentsDir, 'WorkflowStep.jsx')]: workflowStep,
  [path.join(componentsDir, 'ExceptionFlow.jsx')]: exceptionFlow,
  [path.join(componentsDir, 'TransparencyWorkflow.jsx')]: transparencyWorkflow,
  [path.join(componentsDir, 'WhyThisWorkflow.jsx')]: whyThisWorkflow,
  [path.join(componentsDir, 'WorkflowCTA.jsx')]: workflowCTA,
  [path.join(pagesDir, 'HowItWorks.jsx')]: howItWorksIndex,
};

Object.entries(files).forEach(([filePath, content]) => {
  fs.writeFileSync(filePath, content.trim() + '\n');
});

console.log('How It Works page generated successfully.');
