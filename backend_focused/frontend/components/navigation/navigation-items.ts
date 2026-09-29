type NavigationItem = { href: string; label: string };
type NavigationSection = NavigationItem & { views: NavigationItem[] };

export const navigationSections: NavigationSection[] = [
  {
    href: '/vehicles',
    label: 'Vehicles',
    views: [
      { href: '/vehicles', label: 'All vehicles' },
      { href: '/vehicles/needing-maintenance', label: 'Needing maintenance' },
    ],
  },
  {
    href: '/offices',
    label: 'Offices',
    views: [
      { href: '/offices', label: 'All offices' },
      { href: '/offices/summary', label: 'Fleet summary' },
    ],
  },
  {
    href: '/mechanics',
    label: 'Mechanics',
    views: [
      { href: '/mechanics', label: 'All mechanics' },
      { href: '/mechanics/workload', label: 'Workload' },
    ],
  },
  { href: '/maintenance', label: 'Maintenance', views: [] },
];

export function getNavigationSection(pathname: string) {
  return navigationSections.find(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
  );
}
