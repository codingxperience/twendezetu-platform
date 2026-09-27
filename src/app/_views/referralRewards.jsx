'use client';

import { DesignView } from '@/design/DesignView';
import template from '@/design/templates/referralRewards';
import * as logic from '@/design/pages/referralRewards';

export default function ReferralRewardsView(props) {
  return <DesignView template={template} logic={logic} view="referralRewards" {...props} />;
}
