'use client';

import { useState } from 'react';

export type ReportView = 'list' | 'chart';
export type ReportMetric = 'count' | 'cost';

export function useReportDisplay() {
  const [view, setView] = useState<ReportView>('list');
  const [metric, setMetric] = useState<ReportMetric>('count');
  return { view, setView, metric, setMetric };
}
