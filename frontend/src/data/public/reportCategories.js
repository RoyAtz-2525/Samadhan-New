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
