import { useState, useEffect } from 'react'
import './TaxTab.css'

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : ''

export default function TaxTab({ userId }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [costBasisMethod, setCostBasisMethod] = useState('fifo')

  useEffect(() => {
    fetchTaxReport()
  }, [userId, year])

  const fetchTaxReport = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/tax/reports/${userId}?year=${year}`)
      const data = await res.json()
      setReport(data)
    } catch (error) {
      console.error('Failed to fetch tax report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format) => {
    try {
      const res = await fetch(`${API_BASE}/api/tax/export/${userId}?year=${year}&format=${format}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tax_report_${year}.${format === 'turbotax' ? 'txf' : 'csv'}`
      a.click()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (loading) {
    return <div className="tax-loading">Loading tax report...</div>
  }

  return (
    <div className="tax-tab">
      <div className="tax-header">
        <h1>Tax Reports</h1>
        <div className="tax-controls">
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {[2026, 2025, 2024, 2023, 2022].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select value={costBasisMethod} onChange={(e) => setCostBasisMethod(e.target.value)}>
            <option value="fifo">FIFO</option>
            <option value="lifo">LIFO</option>
            <option value="hifo">HIFO</option>
          </select>
        </div>
      </div>

      <div className="tax-summary">
        <div className="tax-card gains">
          <h3>Total Gains</h3>
          <p className="amount positive">${report?.summary?.totalGains?.toLocaleString() || '0'}</p>
        </div>
        <div className="tax-card losses">
          <h3>Total Losses</h3>
          <p className="amount negative">-${report?.summary?.totalLosses?.toLocaleString() || '0'}</p>
        </div>
        <div className="tax-card net">
          <h3>Net Gain/Loss</h3>
          <p className={`amount ${(report?.summary?.netGainLoss || 0) >= 0 ? 'positive' : 'negative'}`}>
            ${report?.summary?.netGainLoss?.toLocaleString() || '0'}
          </p>
        </div>
        <div className="tax-card short-term">
          <h3>Short-Term</h3>
          <p className="amount">${report?.summary?.shortTermGains?.toLocaleString() || '0'}</p>
        </div>
        <div className="tax-card long-term">
          <h3>Long-Term</h3>
          <p className="amount">${report?.summary?.longTermGains?.toLocaleString() || '0'}</p>
        </div>
        <div className="tax-card events">
          <h3>Taxable Events</h3>
          <p className="amount">{report?.summary?.taxableEvents || 0}</p>
        </div>
      </div>

      <div className="tax-export">
        <h2>Export Options</h2>
        <div className="export-buttons">
          <button onClick={() => handleExport('csv')} className="export-btn csv">
            <span className="icon">📄</span>
            Export CSV
          </button>
          <button onClick={() => handleExport('turbotax')} className="export-btn turbotax">
            <span className="icon">📊</span>
            TurboTax (TXF)
          </button>
        </div>
      </div>

      <div className="tax-events">
        <h2>Taxable Events</h2>
        <table className="events-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Asset</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Proceeds</th>
              <th>Cost Basis</th>
              <th>Gain/Loss</th>
              <th>Term</th>
            </tr>
          </thead>
          <tbody>
            {report?.taxEvents?.length > 0 ? (
              report.taxEvents.map((event, i) => (
                <tr key={i}>
                  <td>{new Date(event.date).toLocaleDateString()}</td>
                  <td>{event.symbol}</td>
                  <td>{event.type}</td>
                  <td>{event.quantity}</td>
                  <td>${event.proceeds?.toLocaleString()}</td>
                  <td>${event.costBasis?.toLocaleString()}</td>
                  <td className={event.gainLoss >= 0 ? 'positive' : 'negative'}>
                    ${event.gainLoss?.toLocaleString()}
                  </td>
                  <td className={event.term}>{event.term}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-events">No taxable events for {year}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="tax-holdings">
        <h2>Cost Basis by Asset</h2>
        <div className="holdings-grid">
          {report?.holdings?.map((holding, i) => (
            <div key={i} className="holding-card">
              <h4>{holding.symbol}</h4>
              <div className="holding-stats">
                <div>
                  <span>Quantity</span>
                  <strong>{holding.quantity?.toFixed(4)}</strong>
                </div>
                <div>
                  <span>Cost Basis</span>
                  <strong>${holding.costBasis?.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Avg Cost</span>
                  <strong>${holding.avgCostPerUnit?.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
