import { FileWarning, ClipboardCheck, UserPlus, HardHat, ShieldCheck, CheckCircle } from 'lucide-react';

export const workflowSteps = [
  { id: 'REPORT', title: 'Report', description: 'Citizen reports an issue with photo evidence.', icon: FileWarning },
  { id: 'REVIEW', title: 'Review', description: 'Administrator reviews and approves the issue.', icon: ClipboardCheck },
  { id: 'ASSIGN', title: 'Assign', description: 'Manager assigns the work to a field worker.', icon: UserPlus },
  { id: 'WORK', title: 'Work', description: 'Worker executes and documents the repair.', icon: HardHat },
  { id: 'VERIFY', title: 'Verify', description: 'Manager verifies the completed work.', icon: ShieldCheck },
  { id: 'RESOLVE', title: 'Resolve', description: 'Issue is marked resolved and citizen is notified.', icon: CheckCircle }
];
