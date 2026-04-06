import type { Feel } from './FeelList';

export interface FollowUp {
  id: string;
  rootFeelId: string;
  parentFollowUpId: string | null;
  description: string;
  attachedFeelId: string | null;
  attachedFeel?: Pick<Feel, 'emotion' | 'intensity' | 'notes'> | null;
  isActive: boolean;
  createdAt: string;
  children?: FollowUp[];
}
