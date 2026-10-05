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
