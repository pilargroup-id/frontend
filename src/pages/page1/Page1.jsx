import { useOutletContext } from 'react-router-dom';

// import ButtonCreateCompensation from '../../components/button/button-compensation/ButtonCreateCompensation';
// import DataTableCompensationType from '../../components/table/dekstop/DataTableCompensationType.jsx'

function Page1(props) {
  const outletContext = useOutletContext() ?? {}
  const activePage = props.activePage ?? outletContext.activePage
  const searchQuery = props.searchQuery ?? outletContext.searchQuery
  const pageTitle = activePage?.title ?? 'Page1'
  const pageEyebrow = activePage?.eyebrow ?? 'Master Data'

  return (
    <section
      className="dashboard-panel users-table-card parents-table-card"
      aria-label={pageTitle}
    >
      <div className="users-table-card__header">
        <div>
          <p className="dashboard-panel__eyebrow">{pageEyebrow}</p>
          <h1 className="dashboard-panel__title">{pageTitle}</h1>
        </div>

        <div className="users-table-card__actions" />
      </div>

      <div className="dashboard-stack">
        <p className="dashboard-stack__text">
          {searchQuery ? `Search: ${searchQuery}` : 'Pages 1 Test'}
        </p>
      </div>
    </section>

  )
}

export default Page1
