import { useEffect, useMemo, useState } from 'react'


import DialogDelete from './components/dialog/DialogDelete.jsx'
import DialogEdit from './components/dialog/DialogEdit.jsx'

// layout components
import Header from './components/layoute/Header.jsx'
import Sidebar from './components/layoute/Sidebar.jsx'
import BackgroundMain from './components/layoute/BackgroundMain.jsx'

import DataTable from './components/table/DataTable.jsx'

import DataTableAction from './components/table/DataTableAction.jsx'
import ButtonMain from './components/button/ButtonMain.jsx'
import ButtonRangeDate from './components/button/ButtonRangeDate.jsx'

// chart import
import { Edit03, Trash03, Users01 } from './components/layoute/TemplateIcons.jsx'

// dummy data
import { chartViews } from './dummy/chartViews.js'
import { userRows } from './dummy/dataTable.js'
import { pageDetails } from './dummy/pageDetails.js'
import { userTableColumns } from './dummy/userTableColumns.jsx'
import MyTickets from './pages/my-tickets/MyTickets.jsx'

function getCurrentPath() {
  if (typeof window === 'undefined') {
    return '/documents'
  }

  return window.location.pathname === '/' ? '/documents' : window.location.pathname
}

const tablePagePaths = ['/Table', '/TableActions', '/users']
const USERS_PAGE_SIZE_OPTIONS = [5, 10, 25, 50]
const DEFAULT_USERS_PAGE_SIZE = USERS_PAGE_SIZE_OPTIONS[0]

function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'end-ellipsis', totalPages]
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'start-ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, 'start-ellipsis', currentPage - 1, currentPage, currentPage + 1, 'end-ellipsis', totalPages]
}

function getUserDetailSections(user) {
  return [
    {
      title: 'Account',
      fields: [
        { label: 'user_id', value: user.userId },
        { label: 'username', value: user.username },
        { label: 'email', value: user.email },
        { label: 'phone', value: user.phone },
      ],
    },
    {
      title: 'Organization',
      fields: [
        { label: 'department_id', value: user.departmentId },
        { label: 'department', value: user.department },
        { label: 'role', value: user.role },
        { label: 'job_level', value: user.jobLevel },
      ],
    },
    {
      title: 'Access',
      wide: true,
      fields: [
        { label: 'apps', value: user.apps, kind: 'chips' },
        { label: 'status', value: user.status },
        { label: 'created_at', value: user.createdAt },
        { label: 'updated_at', value: user.updatedAt },
        { label: 'last_active', value: user.lastActive },
      ],
    },
  ]
}

function userMatchesSearch(user, searchQuery) {
  const query = searchQuery.trim().toLowerCase()

  if (!query) {
    return true
  }

  return [
    user.name,
    user.username,
    user.email,
    user.department,
    user.role,
    user.status,
    ...(user.apps ?? []),
  ].some((value) => String(value).toLowerCase().includes(query))
}

function App() {
  const [activePath, setActivePath] = useState(getCurrentPath)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastUpdated, setLastUpdated] = useState(() => new Date())
  const [tableUsers, setTableUsers] = useState(userRows)
  const [usersPage, setUsersPage] = useState(1)
  const [usersPageSize, setUsersPageSize] = useState(DEFAULT_USERS_PAGE_SIZE)
  const [activeActionDialog, setActiveActionDialog] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  useEffect(() => {
    const handleRouteChange = () => {
      setActivePath(getCurrentPath())
    }

    window.addEventListener('popstate', handleRouteChange)

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  const activePage = pageDetails[activePath] ?? pageDetails['/MyTickets']
  const isUsersPage = activePath === '/users'
  const isTableActionsPage = activePath === '/TableActions'
  const isTablePage = tablePagePaths.includes(activePath)
  const isChartPage = activePath === '/Chart'
  const isTeamPerformancePage = activePath === '/Reports/TeamPerformance'
  const tableEntityLabel = isUsersPage ? 'user' : 'data'
  const selectedUserName = selectedUser?.name ?? 'data ini'

  const openActionDialog = (dialogType, user) => {
    setSelectedUser(user)
    setActiveActionDialog(dialogType)
  }

  const closeActionDialog = () => {
    setActiveActionDialog(null)
    setSelectedUser(null)
  }

  const handleEditConfirm = () => {
    setLastUpdated(new Date())
    closeActionDialog()
  }

  const handleDeleteConfirm = () => {
    if (selectedUser?.userId) {
      setTableUsers((currentUsers) =>
        currentUsers.filter((user) => user.userId !== selectedUser.userId),
      )
    }

    setLastUpdated(new Date())
    closeActionDialog()
  }

  const filteredUsers = useMemo(
    () => tableUsers.filter((user) => userMatchesSearch(user, searchQuery)),
    [searchQuery, tableUsers],
  )
  const activeUsersCount = useMemo(
    () => tableUsers.filter((user) => user.statusKey === 'active').length,
    [tableUsers],
  )
  const uniqueAppsCount = useMemo(
    () => new Set(tableUsers.flatMap((user) => user.apps ?? [])).size,
    [tableUsers],
  )
  const usersTotalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPageSize))
  const usersCurrentPage = Math.min(usersPage, usersTotalPages)
  const paginatedUsers = useMemo(() => {
    const startIndex = (usersCurrentPage - 1) * usersPageSize

    return filteredUsers.slice(startIndex, startIndex + usersPageSize)
  }, [filteredUsers, usersCurrentPage, usersPageSize])
  const usersPagination = useMemo(() => {
    const firstItem = filteredUsers.length === 0 ? 0 : (usersCurrentPage - 1) * usersPageSize + 1
    const lastItem = Math.min(usersCurrentPage * usersPageSize, filteredUsers.length)

    return {
      summary: `${firstItem}-${lastItem} dari ${filteredUsers.length} ${tableEntityLabel}`,
      currentPage: usersCurrentPage,
      totalPages: usersTotalPages,
      items: getPaginationItems(usersCurrentPage, usersTotalPages),
      pageSize: usersPageSize,
      pageSizeOptions: USERS_PAGE_SIZE_OPTIONS,
      pageSizeLabel: 'Tampilkan',
      pageSizeSuffix: 'baris',
      previousLabel: 'Sebelumnya',
      nextLabel: 'Berikutnya',
      ariaLabel: 'Users pagination',
      pageSizeAriaLabel: 'Jumlah baris per halaman',
      onPrevious: () => setUsersPage((currentPage) => Math.max(1, currentPage - 1)),
      onNext: () => setUsersPage((currentPage) => Math.min(usersTotalPages, currentPage + 1)),
      onSelect: (page) => setUsersPage(page),
      onPageSizeChange: (pageSize) => {
        setUsersPageSize(pageSize)
        setUsersPage(1)
      },
    }
  }, [filteredUsers.length, tableEntityLabel, usersCurrentPage, usersPageSize, usersTotalPages])
  const userTableActions = useMemo(
    () => [
      {
        key: 'edit',
        label: 'Edit',
        icon: Edit03,
        onClick: (user) => openActionDialog('edit', user),
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: Trash03,
        variant: 'danger',
        onClick: (user) => openActionDialog('delete', user),
      },
    ],
    [],
  )

  const overviewCards = useMemo(
    () => {
      if (activePath === '/MyTickets') {
        return []
      }

      if (isTablePage) {
        return [
          {
            ...activePage,
            value: String(tableUsers.length),
          },
          {
            title: 'Active Users',
            eyebrow: 'Status',
            value: String(activeUsersCount),
            detail: 'User yang saat ini aktif dan dapat mengakses aplikasi.',
          },
          {
            title: 'Apps Access',
            eyebrow: 'Access',
            value: String(uniqueAppsCount),
            detail: 'Aplikasi yang sudah dipetakan pada user internal.',
          },
        ]
      }

      return [
        activePage,
        {
          title: 'MyTickets',
          eyebrow: 'Performance',
          value: '92%',
          detail: 'Permintaan yang selesai sebelum batas SLA.',
        },
        {
          title: 'Priority',
          eyebrow: 'Escalation',
          value: '3',
          detail: 'Tiket prioritas tinggi yang perlu ditindaklanjuti.',
        },
      ]
    },
    [activePage, activeUsersCount, isTablePage, tableUsers.length, uniqueAppsCount, activePath],
  )

  const shellClassName = [
    'dashboard-shell',
    sidebarCollapsed ? 'dashboard-shell--sidebar-collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClassName}>
      <BackgroundMain />

      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        activePath={activePath}
        userName="Al Fatih"
        userRole="Frontend Developer"
        onToggleCollapse={() => setSidebarCollapsed((currentValue) => !currentValue)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <button
        type="button"
        className={`sidebar-overlay${mobileSidebarOpen ? ' active' : ''}`}
        aria-label="Close sidebar"
        onClick={() => setMobileSidebarOpen(false)}
      />

      <div className="dashboard-stage">
        <Header
          title="Overtime"
          showMenuButton
          onMenuToggle={() => setMobileSidebarOpen(true)}
          breadcrumb={[
            { label: 'Overtime', href: '#' },
            { label: activePage.title, href: '#', active: true },
          ]}
          searchProps={{
            value: searchQuery,
            placeholder: isTablePage ? 'Cari data table...' : 'Cari tiket...',
            ariaLabel: isTablePage ? 'Cari data table' : 'Cari tiket legal',
            onChange: (event) => {
              setSearchQuery(event.target.value)
              setUsersPage(1)
            },
          }}
          notificationProps={{
            ariaLabel: 'Open notifications',
            modalTitle: 'Notifications',
          }}
          onRefresh={() => setLastUpdated(new Date())}
        />

        <main
          className={`dashboard-main${activePath === '/MyTickets' ? ' dashboard-main--mytickets' : ''}`}
        >
          <div
            className={`dashboard-content${activePath === '/MyTickets' ? ' dashboard-content--mytickets' : ''}`}
          >
            {activePath !== '/MyTickets' && !isTeamPerformancePage && (
              <section className="dashboard-overview" aria-label="Ringkasan dashboard">
                {overviewCards.map((card) => (
                  <article className="dashboard-card" key={card.title}>
                    <div className="dashboard-card__badge-row">
                      <div className="status-badge">
                        <span className="dashboard-card__label">{card.title}</span>
                      </div>
                    </div>
                    <strong className="dashboard-card__value">{card.value}</strong>
                    <p className="dashboard-card__detail">{card.detail}</p>
                  </article>
                ))}
              </section>
            )}

            {activePath === '/MyTickets' ? (
              <MyTickets activePage={activePage} searchQuery={searchQuery} />
            ) : isTablePage ? (
              <section className="dashboard-panel users-table-card" aria-label={activePage.title}>
                <div className="users-table-card__header">
                  <div>
                    <p className="dashboard-panel__eyebrow">{activePage.eyebrow}</p>
                    <h1 className="dashboard-panel__title">{activePage.title}</h1>
                    <p className="users-table-card__description">
                      {isUsersPage
                        ? 'Template data table untuk daftar user internal, akses aplikasi, dan detail account.'
                        : isTableActionsPage
                          ? 'Template data table dengan kolom Action berisi tombol icon-only untuk edit dan delete.'
                          : ''}
                    </p>
                  </div>

                  <div className="users-table-card__actions">
                    <ButtonRangeDate />
                    <button
                      type="button"
                      className="users-table-card__action"
                      onClick={() => setLastUpdated(new Date())}
                    >
                      <Users01 size={18} aria-hidden="true" />
                      <span>{isUsersPage ? 'Tambah User' : 'Tambah Data'}</span>
                    </button>
                    <ButtonMain />
                  </div>
                </div>

                {isTableActionsPage ? (
                  <DataTableAction
                    rows={paginatedUsers}
                    columns={userTableColumns}
                    actions={userTableActions}
                    getRowId={(user) => user.userId}
                    tableLabel={`${activePage.title} table`}
                    emptyMessage={
                      searchQuery
                        ? 'Data tidak ditemukan. Coba pakai kata kunci lain.'
                        : 'Belum ada data.'
                    }
                    pagination={usersPagination}
                  />
                ) : (
                  <DataTable
                    rows={paginatedUsers}
                    columns={userTableColumns}
                    getRowId={(user) => user.userId}
                    tableLabel={`${activePage.title} table`}
                    emptyMessage={
                      searchQuery
                        ? 'Data tidak ditemukan. Coba pakai kata kunci lain.'
                        : 'Belum ada data.'
                    }
                    detail={{
                      columnLabel: 'Detail',
                      buttonLabel: 'Detail',
                      eyebrow: 'User detail',
                      title: (user) => user.name,
                      description: (user) => `${user.role} - ${user.department}`,
                      sections: getUserDetailSections,
                    }}
                    actions={userTableActions}
                    pagination={usersPagination}
                  />
                )}
              </section>
            ) : isChartPage ? (
              <section className="chart-page" aria-label="Chart">
                <div className="chart-grid">
                  {chartViews.map(({ title, eyebrow, Component, wide }) => (
                    <article
                      className={`dashboard-panel chart-card${wide ? ' chart-card--wide' : ''}`}
                      key={title}
                    >
                      <div className="chart-card__header">
                        <p className="dashboard-panel__eyebrow">{eyebrow}</p>
                        <h1 className="dashboard-panel__title">{title}</h1>
                      </div>

                      <div className="chart-card__body">
                        <Component />
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : (
              <section className="dashboard-grid" aria-label="Aktivitas legal">
                <article className="dashboard-panel">
                  <div className="dashboard-panel__header">
                    <p className="dashboard-panel__eyebrow">Current View</p>
                    <h1 className="dashboard-panel__title">{activePage.title}</h1>
                  </div>

                  <div className="dashboard-stack">
                    <div className="dashboard-stack__item">
                      <h2 className="dashboard-stack__title">Review kontrak vendor</h2>
                      <p className="dashboard-stack__text">
                        Draft kontrak sedang masuk tahap pengecekan klausul komersial.
                      </p>
                    </div>
                    <div className="dashboard-stack__item">
                      <h2 className="dashboard-stack__title">Permintaan legal opinion</h2>
                      <p className="dashboard-stack__text">
                        Tim bisnis meminta analisis risiko untuk kerja sama baru.
                      </p>
                    </div>
                    <div className="dashboard-stack__item">
                      <h2 className="dashboard-stack__title">Pembaharuan dokumen</h2>
                      <p className="dashboard-stack__text">
                        Template dokumen internal sedang disesuaikan dengan kebijakan terbaru.
                      </p>
                    </div>
                  </div>
                </article>

                <aside className="dashboard-panel">
                  <div className="dashboard-panel__header">
                    <p className="dashboard-panel__eyebrow">Workspace</p>
                    <h2 className="dashboard-panel__title">Status</h2>
                  </div>

                  <ul className="dashboard-list">
                    <li className="dashboard-list__item">
                      Search: {searchQuery || 'Belum ada kata kunci'}
                    </li>
                    <li className="dashboard-list__item">
                      Path aktif: {activePath}
                    </li>
                    <li className="dashboard-list__item">
                      Update terakhir: {lastUpdated.toLocaleTimeString('id-ID')}
                    </li>
                  </ul>
                </aside>
              </section>
            )}
          </div>
        </main>
      </div>

      <DialogEdit
        isOpen={activeActionDialog === 'edit'}
        eyebrow="Edit Data"
        title={`Edit ${selectedUserName}`}
        user={selectedUser}
        onClose={closeActionDialog}
        onConfirm={handleEditConfirm}
      />

      <DialogDelete
        isOpen={activeActionDialog === 'delete'}
        eyebrow="Delete Data"
        title={`Delete ${selectedUserName}`}
        user={selectedUser}
        onClose={closeActionDialog}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

export default App
