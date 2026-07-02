import { Fragment, isValidElement, useState } from 'react'

import CreateButton from '../button/CreateButton.jsx'
import { ChevronDown } from '../layoute/TemplateIcons.jsx'

function getInitials(value = '') {
  return String(value)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function getDefaultRowId(row, index) {
  return row?.id ?? row?.userId ?? row?.key ?? index
}

function normalizeList(items) {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map((item) => String(item).trim()).filter(Boolean)
}

function sanitizeId(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '-') || 'row'
}

function joinClassNames(...classNames) {
  return classNames.flat().filter(Boolean).join(' ')
}

function resolveTemplateValue(value, row, index) {
  return typeof value === 'function' ? value(row, index) : value
}

function getPathValue(source, path) {
  if (!path || typeof path !== 'string') {
    return undefined
  }

  return path.split('.').reduce((currentValue, key) => currentValue?.[key], source)
}

function normalizePageSizeOptions(options, pageSize) {
  const normalizedOptions = (Array.isArray(options) ? options : [])
    .map((option) => Number(option))
    .filter((option) => Number.isInteger(option) && option > 0)
  const normalizedPageSize = Number(pageSize)

  if (
    Number.isInteger(normalizedPageSize) &&
    normalizedPageSize > 0 &&
    !normalizedOptions.includes(normalizedPageSize)
  ) {
    return [normalizedPageSize, ...normalizedOptions]
  }

  return normalizedOptions
}

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

function getDefaultPaginationConfig(pagination) {
  if (pagination && typeof pagination === 'object') {
    return pagination
  }

  return {}
}

function getColumnValue(column, row, index) {
  if (typeof column.render === 'function') {
    return column.render(row, index)
  }

  if (typeof column.accessor === 'function') {
    return column.accessor(row, index)
  }

  if (typeof column.accessor === 'string') {
    return getPathValue(row, column.accessor)
  }

  if (column.key) {
    return getPathValue(row, column.key)
  }

  return null
}

function getColumnOptionValue(option, row, index) {
  if (typeof option === 'function') {
    return option(row, index)
  }

  if (typeof option === 'string') {
    return getPathValue(row, option)
  }

  return option
}

function getColumnClassName(column, target) {
  const columnKey = sanitizeId(
    column.key ?? (typeof column.accessor === 'string' ? column.accessor : target),
  )
  const baseClassName = target === 'header' ? 'users-table__header-cell' : 'users-table__cell'
  const configuredClassName = target === 'header' ? column.headerClassName : column.cellClassName
  const alignClassName = column.align ? `${baseClassName}--align-${column.align}` : ''
  const typeClassName = column.type ? `${baseClassName}--${column.type}` : ''

  return joinClassNames(
    baseClassName,
    `${baseClassName}--${columnKey}`,
    typeClassName,
    alignClassName,
    column.nowrap ? `${baseClassName}--nowrap` : '',
    column.truncate ? `${baseClassName}--truncate` : '',
    configuredClassName,
  )
}

function getColumnStyle(column, target) {
  const configuredStyle = target === 'header' ? column.headerStyle : column.cellStyle

  return {
    width: column.width,
    minWidth: column.minWidth,
    maxWidth: column.maxWidth,
    ...configuredStyle,
  }
}

function getColumnKey(column, index) {
  if (column.key) {
    return column.key
  }

  if (typeof column.accessor === 'string') {
    return column.accessor
  }

  return `column-${index}`
}

function formatColumnText(value, column, row, index) {
  if (typeof column.format === 'function') {
    return column.format(value, row, index)
  }

  if (column.prefix || column.suffix) {
    return `${column.prefix ?? ''}${value ?? ''}${column.suffix ?? ''}`
  }

  return value
}

function renderColumnValue(column, row, index) {
  const value = getColumnValue(column, row, index)

  if (isValidElement(value)) {
    return value
  }

  if (column.type === 'identity') {
    const title =
      resolveTemplateValue(column.title, row, index) ??
      getColumnOptionValue(column.titleAccessor, row, index) ??
      value
    const subtitle =
      resolveTemplateValue(column.subtitle, row, index) ??
      getColumnOptionValue(column.subtitleAccessor, row, index)
    const initials =
      resolveTemplateValue(column.initials, row, index) ??
      getColumnOptionValue(column.initialsAccessor, row, index)
    const badgeValue =
      resolveTemplateValue(column.badge, row, index) ??
      getColumnOptionValue(column.badgeAccessor, row, index)

    return (
      <DataTableIdentity
        title={title}
        subtitle={subtitle}
        initials={initials}
        badge={badgeValue}
      />
    )
  }

  if (column.type === 'status') {
    const variant =
      resolveTemplateValue(column.variant, row, index) ??
      getColumnOptionValue(column.variantAccessor, row, index) ??
      String(value ?? 'active').toLowerCase()

    return (
      <DataTableStatus variant={variant} inline={column.inline ?? false}>
        {formatColumnText(value, column, row, index)}
      </DataTableStatus>
    )
  }

  if (column.type === 'chips') {
    return (
      <DataTableChips
        items={Array.isArray(value) ? value : normalizeList(String(value ?? '').split(','))}
        empty={column.empty ?? '-'}
        variant={column.variant ?? 'app'}
      />
    )
  }

  return renderBasicValue(formatColumnText(value, column, row, index))
}

function renderBasicValue(value) {
  if (isValidElement(value)) {
    return value
  }

  if (Array.isArray(value)) {
    return <DataTableChips items={value} />
  }

  if (value === null) {
    return <span className="users-table__detail-value users-table__detail-value--muted">null</span>
  }

  if (value === undefined || value === '') {
    return <span className="users-table__detail-value users-table__detail-value--muted">-</span>
  }

  return value
}

function renderDetailValue(value) {
  if (isValidElement(value)) {
    return value
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="users-table__detail-value users-table__detail-value--mono">[]</span>
    }

    return (
      <div className="users-table__detail-chips">
        {value.map((item, index) => (
          <span className="users-table__detail-chip" key={`${item}-${index}`}>
            {item}
          </span>
        ))}
      </div>
    )
  }

  if (value === null) {
    return <span className="users-table__detail-value users-table__detail-value--muted">null</span>
  }

  if (value === undefined || value === '') {
    return <span className="users-table__detail-value users-table__detail-value--muted">-</span>
  }

  return (
    <span
      className={`users-table__detail-value${
        typeof value === 'number' ? ' users-table__detail-value--mono' : ''
      }`}
    >
      {String(value)}
    </span>
  )
}

function getDetailSections(detail, row, index) {
  if (!detail) {
    return []
  }

  if (typeof detail.sections === 'function') {
    return detail.sections(row, index) ?? []
  }

  return detail.sections ?? []
}

export function DataTableStatus({
  children,
  variant = 'active',
  inline = false,
  className = '',
}) {
  const statusClassName = [
    'users-table__status',
    inline ? 'users-table__status--inline' : '',
    variant ? `users-table__status--${variant}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <span className={statusClassName}>{children ?? '-'}</span>
}

export function DataTableChips({ items = [], empty = '-', variant = 'app', className = '' }) {
  const normalizedItems = normalizeList(items)

  if (normalizedItems.length === 0) {
    return <span className="users-table__apps-empty">{empty}</span>
  }

  return (
    <div className={['users-table__apps', className].filter(Boolean).join(' ')}>
      {normalizedItems.map((item, index) => (
        <DataTableStatus key={`${item}-${index}`} variant={variant} inline>
          {item}
        </DataTableStatus>
      ))}
    </div>
  )
}

export function DataTableIdentity({ title, subtitle, initials, badge, className = '' }) {
  return (
    <div className={['users-table__identity', className].filter(Boolean).join(' ')}>
      <span className="users-table__avatar">{initials || getInitials(title)}</span>

      <div className="users-table__identity-copy">
        <div className="users-table__name-row">
          <strong className="users-table__name">{title}</strong>
          {badge}
        </div>

        {subtitle ? <p className="users-table__meta">{subtitle}</p> : null}
      </div>
    </div>
  )
}

function DataTable({
  rows = [],
  columns = [],
  getRowId = getDefaultRowId,
  detail = null,
  actions = [],
  pagination = true,
  tableLabel = 'Data table',
  tableMessage = '',
  emptyMessage,
  idPrefix = 'data-table',
  className = '',
  onRowClick,
  getRowClassName,
}) {
  const [expandedRowKey, setExpandedRowKey] = useState(null)
  const [localPage, setLocalPage] = useState(1)
  const [localPageSize, setLocalPageSize] = useState(
    getDefaultPaginationConfig(pagination).pageSize ?? 5,
  )
  const hasDetail = Boolean(detail)
  const hasPagination = pagination !== false && pagination !== null
  const paginationConfig = getDefaultPaginationConfig(pagination)
  const isControlledPagination =
    hasPagination &&
    typeof paginationConfig.onPrevious === 'function' &&
    typeof paginationConfig.onNext === 'function'
  const effectivePageSize = Number(paginationConfig.pageSize ?? localPageSize)
  const totalRows = Number(paginationConfig.totalRows ?? rows.length)
  const totalPages = Math.max(
    1,
    Number(paginationConfig.totalPages) ||
      Math.ceil(totalRows / (Number.isInteger(effectivePageSize) && effectivePageSize > 0 ? effectivePageSize : 1)),
  )
  const currentPage = Math.min(
    Math.max(1, Number(paginationConfig.currentPage ?? localPage) || 1),
    totalPages,
  )
  const displayRows =
    hasPagination && !isControlledPagination
      ? rows.slice((currentPage - 1) * effectivePageSize, currentPage * effectivePageSize)
      : rows
  const visibleExpandedRowKey = displayRows.some(
    (row, index) => String(getRowId(row, index)) === expandedRowKey,
  )
    ? expandedRowKey
    : null
  const resolvedEmptyMessage = emptyMessage ?? tableMessage ?? 'Belum ada data.'
  const colSpan = columns.length + (hasDetail ? 1 : 0)
  const currentPageSize = Number(effectivePageSize)
  const pageSizeOptions = normalizePageSizeOptions(
    paginationConfig.pageSizeOptions ?? [5, 10, 25, 50],
    currentPageSize,
  )
  const canChangePageSize =
    hasPagination &&
    Number.isInteger(currentPageSize) &&
    currentPageSize > 0 &&
    pageSizeOptions.length > 0
  const firstItem = totalRows === 0 ? 0 : (currentPage - 1) * currentPageSize + 1
  const lastItem = Math.min(currentPage * currentPageSize, totalRows)
  const paginationItems = paginationConfig.items ?? getPaginationItems(currentPage, totalPages)
  const paginationSummary =
    paginationConfig.summary ?? `${firstItem}-${lastItem} dari ${totalRows} data`

  const handleToggleRow = (rowKey) => {
    if (!hasDetail) {
      return
    }

    setExpandedRowKey((currentRowKey) => (currentRowKey === rowKey ? null : rowKey))
  }

  const handleRowKeyDown = (event, rowKey) => {
    if (!hasDetail || (event.key !== 'Enter' && event.key !== ' ')) {
      return
    }

    event.preventDefault()
    handleToggleRow(rowKey)
  }

  const handleRowClick = (row, index, rowKey) => {
    onRowClick?.(row, index)
    handleToggleRow(rowKey)
  }

  const handlePageSizeChange = (event) => {
    const nextPageSize = Number(event.target.value)

    if (!Number.isInteger(nextPageSize) || nextPageSize <= 0) {
      return
    }

    if (typeof paginationConfig.onPageSizeChange === 'function') {
      paginationConfig.onPageSizeChange(nextPageSize)
      return
    }

    setLocalPageSize(nextPageSize)
    setLocalPage(1)
  }

  const handlePreviousPage = () => {
    if (typeof paginationConfig.onPrevious === 'function') {
      paginationConfig.onPrevious()
      return
    }

    setLocalPage((page) => Math.max(1, page - 1))
  }

  const handleNextPage = () => {
    if (typeof paginationConfig.onNext === 'function') {
      paginationConfig.onNext()
      return
    }

    setLocalPage((page) => Math.min(totalPages, page + 1))
  }

  const handleSelectPage = (page) => {
    if (typeof paginationConfig.onSelect === 'function') {
      paginationConfig.onSelect(page)
      return
    }

    setLocalPage(page)
  }

  return (
    <>
      <div className={['users-table-wrapper', className].filter(Boolean).join(' ')}>
        <table className="users-table" aria-label={tableLabel}>
          <thead>
            <tr>
              {columns.map((column, columnIndex) => (
                <th
                  key={getColumnKey(column, columnIndex)}
                  scope="col"
                  className={getColumnClassName(column, 'header')}
                  style={getColumnStyle(column, 'header')}
                >
                  {column.header}
                </th>
              ))}

              {hasDetail ? (
                <th scope="col" className="users-table__detail-header">
                  {detail.columnLabel ?? 'Detail'}
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody>
            {displayRows.length > 0 ? (
              displayRows.map((row, index) => {
                const rowId = getRowId(row, index)
                const rowKey = String(rowId)
                const safeRowId = sanitizeId(rowKey)
                const isExpanded = visibleExpandedRowKey === rowKey
                const isRowInteractive = hasDetail || typeof onRowClick === 'function'
                const accordionId = `${idPrefix}-accordion-${safeRowId}`
                const detailSections = getDetailSections(detail, row, index)
                const detailTitle = resolveTemplateValue(detail?.title, row, index)
                const detailDescription = resolveTemplateValue(detail?.description, row, index)
                const detailEyebrow = resolveTemplateValue(detail?.eyebrow, row, index)
                const rowClassName = [
                  'users-table__row',
                  isRowInteractive ? 'users-table__row--interactive' : '',
                  isExpanded ? 'users-table__row--expanded' : '',
                  getRowClassName?.(row, index),
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <Fragment key={rowKey}>
                    <tr
                      className={rowClassName}
                      onClick={
                        isRowInteractive ? () => handleRowClick(row, index, rowKey) : undefined
                      }
                      onKeyDown={(event) => handleRowKeyDown(event, rowKey)}
                      tabIndex={hasDetail ? 0 : undefined}
                      aria-expanded={hasDetail ? isExpanded : undefined}
                      aria-controls={hasDetail ? accordionId : undefined}
                    >
                      {columns.map((column, columnIndex) => (
                        <td
                          key={getColumnKey(column, columnIndex)}
                          className={getColumnClassName(column, 'cell')}
                          style={getColumnStyle(column, 'cell')}
                        >
                          {renderColumnValue(column, row, index)}
                        </td>
                      ))}

                      {hasDetail ? (
                        <td className="users-table__detail-cell">
                          <CreateButton
                            variant="detail"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleToggleRow(rowKey)
                            }}
                            aria-expanded={isExpanded}
                            aria-controls={accordionId}
                            title={isExpanded ? 'Tutup detail' : 'Buka detail'}
                          >
                            <span>{detail.buttonLabel ?? 'Detail'}</span>
                            <ChevronDown
                              size={16}
                              aria-hidden="true"
                              className={`users-table__detail-icon${
                                isExpanded ? ' users-table__detail-icon--open' : ''
                              }`}
                            />
                          </CreateButton>
                        </td>
                      ) : null}
                    </tr>

                    {hasDetail && isExpanded ? (
                      <tr className="users-table__accordion-row">
                        <td colSpan={colSpan}>
                          <div className="users-table__accordion" id={accordionId}>
                            <div className="users-table__accordion-header">
                              <div className="users-table__accordion-copy">
                                <p className="users-table__accordion-eyebrow">
                                  {detailEyebrow ?? 'Detail'}
                                </p>
                                <h3 className="users-table__accordion-title">
                                  {detailTitle ?? row.name ?? row.title ?? rowId}
                                </h3>
                                {detailDescription ? (
                                  <p className="users-table__accordion-description">
                                    {detailDescription}
                                  </p>
                                ) : null}
                              </div>
                            </div>

                            {typeof detail.render === 'function' ? detail.render(row, index) : null}

                            {detailSections.length > 0 ? (
                              <div className="users-table__detail-shell">
                                {detailSections.map((section) => (
                                  <section
                                    key={section.title}
                                    className={`users-table__detail-section${
                                      section.wide ? ' users-table__detail-section--wide' : ''
                                    }`}
                                  >
                                    <div className="users-table__detail-section-header">
                                      <p className="users-table__detail-section-eyebrow">
                                        {section.title}
                                      </p>
                                    </div>

                                    <dl className="users-table__detail-list">
                                      {(section.fields ?? []).map((field) => {
                                        const fieldValue =
                                          typeof field.render === 'function'
                                            ? field.render(row, index)
                                            : resolveTemplateValue(field.value, row, index)

                                        return (
                                          <div
                                            key={field.label}
                                            className={`users-table__detail-row${
                                              field.kind === 'chips'
                                                ? ' users-table__detail-row--stacked'
                                                : ''
                                            }`}
                                          >
                                            <dt className="users-table__detail-label">
                                              {field.label}
                                            </dt>
                                            <dd className="users-table__detail-field">
                                              {renderDetailValue(fieldValue)}
                                            </dd>
                                          </div>
                                        )
                                      })}
                                    </dl>
                                  </section>
                                ))}
                              </div>
                            ) : null}

                            {actions.length > 0 ? (
                              <div className="users-table__accordion-actions">
                                {actions.map((action) => {
                                  if (action.hidden?.(row, index)) {
                                    return null
                                  }

                                  const Icon = action.icon

                                  return (
                                    <CreateButton
                                      key={action.key ?? action.label}
                                      variant="accordion"
                                      tone={action.variant === 'danger' ? 'danger' : 'default'}
                                      type="button"
                                      disabled={action.disabled?.(row, index) ?? action.disabled}
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        action.onClick?.(row, index, event)
                                      }}
                                    >
                                      {Icon ? <Icon size={16} aria-hidden="true" /> : null}
                                      {action.label}
                                    </CreateButton>
                                  )
                                })}
                              </div>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })
            ) : (
              <tr>
                <td colSpan={colSpan}>
                  <div className="users-table__empty">{resolvedEmptyMessage}</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasPagination ? (
        <div className="users-table-pagination">
          <div className="users-table-pagination__meta">
            <p className="users-table-pagination__summary">{paginationSummary}</p>

            {canChangePageSize ? (
              <label className="users-table-pagination__page-size">
                <span>{paginationConfig.pageSizeLabel ?? 'Tampilkan'}</span>
                <select
                  className="users-table-pagination__select"
                  value={currentPageSize}
                  onChange={handlePageSizeChange}
                  aria-label={paginationConfig.pageSizeAriaLabel ?? 'Jumlah baris per halaman'}
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span>{paginationConfig.pageSizeSuffix ?? 'baris'}</span>
              </label>
            ) : null}
          </div>

          <div
            className="users-table-pagination__controls"
            aria-label={paginationConfig.ariaLabel ?? `${tableLabel} pagination`}
          >
            <CreateButton
              variant="pagination"
              type="button"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              {paginationConfig.previousLabel ?? 'Previous'}
            </CreateButton>

            {paginationItems.map((item, index) =>
              typeof item === 'number' ? (
                <CreateButton
                  key={item}
                  variant="pagination"
                  active={item === currentPage}
                  type="button"
                  onClick={() => handleSelectPage(item)}
                  aria-current={item === currentPage ? 'page' : undefined}
                >
                  {item}
                </CreateButton>
              ) : (
                <span
                  key={`${item}-${index}`}
                  className="users-table-pagination__ellipsis"
                  aria-hidden="true"
                >
                  ...
                </span>
              ),
            )}

            <CreateButton
              variant="pagination"
              type="button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              {paginationConfig.nextLabel ?? 'Next'}
            </CreateButton>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default DataTable
