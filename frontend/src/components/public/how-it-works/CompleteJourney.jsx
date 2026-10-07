import React from 'react';
import WorkflowStep from './WorkflowStep';

const CompleteJourney = () => {
  const journeySteps = [
    {
      id: 1,
      role: "CITIZEN",
      title: "Report the Issue",
      action: "A citizen uses the platform to upload photos, location, and details of a civic issue.",
      result: "Issue Status: REPORTED"
    },
    {
      id: 2,
      role: "ADMIN",
      title: "Review & Approve",
      action: "Admin verifies the report, ensures it's valid and within scope, and approves it for action.",
      result: "Issue Status: APPROVED"
    },
    {
      id: 3,
      role: "MANAGER",
      title: "Assign Worker",
      action: "Manager reviews approved issues and assigns them to an appropriate verified worker.",
      result: "Issue Status: ASSIGNED"
    },
    {
      id: 4,
      role: "WORKER",
      title: "Accept & Provide Quote",
      action: "Worker receives the assignment, reviews the problem, and may provide a cost estimate.",
      result: "Assignment Status: ACCEPTED"
    },
    {
      id: 5,
      role: "MANAGER",
      title: "Verify Before-Work",
      action: "Manager verifies the worker's initial assessment or quote before authorizing work to start.",
      result: "Issue Status: WORK STARTED"
    },
    {
      id: 6,
      role: "WORKER",
      title: "Execute Work",
      action: "Worker performs the physical labor. Once done, they upload 'after' photos as proof.",
      result: "Issue Status: WORK COMPLETED"
    },
    {
      id: 7,
      role: "MANAGER",
      title: "Verify Completion",
      action: "Manager reviews the 'after' photos and field report to ensure quality standards are met.",
      result: "Issue Status: UNDER VERIFICATION"
    },
    {
      id: 8,
      role: "ADMIN / SYSTEM",
      title: "Final Resolution",
      action: "Admin performs a final review (if required) or system automatically marks it resolved upon manager verification.",
      result: "Issue Status: RESOLVED"
    },
    {
      id: 9,
      role: "ADMIN",
      title: "Payment Release",
      action: "Admin triggers payment processing to the worker through the platform.",
      result: "Payment Status: PROCESSED"
    },
    {
      id: 10,
      role: "CITIZEN",
      title: "Feedback Loop",
      action: "Citizen is notified of the resolution and asked to provide feedback and a rating.",
      result: "Issue Lifecycle: CLOSED"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-slate-50 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            The Complete Journey
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A step-by-step breakdown of how an issue flows through the SAMADHAN platform.
          </p>
        </div>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 md:before:ml-1/2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-teal-100 before:via-blue-200 before:to-transparent">
          {journeySteps.map((step, index) => (
            <WorkflowStep key={step.id} step={step} isLeft={index % 2 === 0} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompleteJourney;