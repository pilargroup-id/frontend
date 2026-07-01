import {
  DataTableChips,
  DataTableIdentity,
  DataTableStatus,
} from '../components/table/DataTable.jsx'

export const userTableColumns = [
  {
    key: 'user',
    header: 'User',
    render: (user) => (
      <DataTableIdentity
        title={user.name}
        subtitle={user.username}
        badge={
          <DataTableStatus variant={user.statusKey} inline>
            {user.status}
          </DataTableStatus>
        }
      />
    ),
  },
  {
    key: 'department',
    header: 'Department',
    accessor: 'department',
  },
  {
    key: 'role',
    header: 'Role',
    accessor: 'role',
  },
  {
    key: 'apps',
    header: 'Apps',
    render: (user) => <DataTableChips items={user.apps} />,
  },
]
