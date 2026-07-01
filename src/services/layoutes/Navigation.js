import {
  LogOutLeft01,
  Table01,
  Chart01,
  Folder,
  TrendingUp,
} from '../../components/layoute/TemplateIcons.jsx'

export const defaultNavigationPath = '/dashboard'

export const implementedNavigationPaths = [
  '/Menu1',
  '/Page1',
  '/Page2',
  '/Table',
  '/TableActions',
  '/users',
  '/Chart',
]

export const primaryNavigationItems = [
  {
    id: 'menu1',
    label: 'Menu 1',
    href: '/Menu1',
    icon: Folder,
  },
  {
    id: 'page1',
    label: 'Page 1',
    href: '/Page1',
    icon: Folder,
  },
  {
    id: 'page2',
    label: 'Page 2',
    href: '/Page2',
    icon: Folder,
  },
  {
    id: 'table',
    label: 'Table',
    icon: Table01,
    children: [
      {
        id: 'table-data',
        label: 'Data Table',
        href: '/Table',
      },
      {
        id: 'table-users',
        label: 'Data Table Actions',
        href: '/TableActions',
      },
    ],
  },
  {
    id: 'chart',
    label: 'Chart',
    href: '/Chart',
    icon: Chart01,
  }
]

export const secondaryNavigationItems = [
  {
    id: 'back-pilargroup',
    label: 'Back Pilargroup',
    href: 'https://pilargroup.id/dashboard',
    icon: LogOutLeft01,
    external: true,
  },
]
