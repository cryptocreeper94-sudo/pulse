import { useState } from 'react'
import { safetyExplanations, gradeExplanations } from '../../data/safetyExplanations'

const API_BASE = ''

function SafetyTooltip({ content, children }) {
  const [show, setShow] = useState(false)
  
  return (
    <div 
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 8,
          padding: '12px 16px',
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          zIndex: 1000,
          width: 280,
          textAlign: 'left',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#00D4FF', marginBottom: 6 }}>
            {content.name}
          </div>
          <div style={{ fontSize: 11, color: '#ccc', marginBottom: 8, lineHeight: 1.5 }}>
            {content.description}
          </div>
          <div style={{ 
            fontSize: 10, 
            color: '#888', 
            fontStyle: 'italic',
            padding: '8px 10px',
            background: 'rgba(0,212,255,0.05)',
            borderRadius: 6,
            borderLeft: '2px solid #00D4FF'
          }}>
            <span style={{ fontWeight: 600, color: '#00D4FF' }}>Why it matters: </span>
            {content.whyItMatters}
          </div>
          <div style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: 12,
            height: 12,
            background: '#1a1a1a',
            border: '1px solid #333',
            borderTop: 'none',
            borderLeft: 'none',
          }} />
        </div>
      )}
    </div>
  )
}

function InfoIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function ScoreBreakdownBar({ report }) {
  const riskCount = report.risks?.length || 0
  const warningCount = report.warnings?.length || 0
  const riskDeduction = riskCount * 20
  const warningDeduction = warningCount * 5
  const totalDeduction = riskDeduction + warningDeduction
  const actualScore = report.safetyScore ?? Math.max(0, 100 - totalDeduction)
  
  const scaleFactor = totalDeduction > 100 ? 100 / totalDeduction : 1
  const scaledRiskWidth = Math.min(riskDeduction * scaleFactor, 100 - actualScore)
  const scaledWarningWidth = Math.min(warningDeduction * scaleFactor, 100 - actualScore - scaledRiskWidth)
  
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 8 
      }}>
        <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Score Breakdown</span>
        <span style={{ fontSize: 11, color: '#666' }}>
          100 - {Math.min(totalDeduction, 100)} deductions = {actualScore}
        </span>
      </div>
      
      <div style={{
        height: 24,
        background: '#1a1a1a',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        border: '1px solid #222'
      }}>
        <div style={{
          width: `${actualScore}%`,
          background: `linear-gradient(90deg, 
            ${actualScore >= 80 ? '#39FF14' : actualScore >= 60 ? '#00D4FF' : actualScore >= 40 ? '#FFD700' : '#FF4444'} 0%, 
            ${actualScore >= 80 ? '#2ECC71' : actualScore >= 60 ? '#0099CC' : actualScore >= 40 ? '#FF8C00' : '#CC3333'} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'width 0.5s ease'
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#000' }}>
            {actualScore > 20 ? `${actualScore} pts` : ''}
          </span>
        </div>
        
        {riskDeduction > 0 && (
          <div style={{
            width: `${scaledRiskWidth}%`,
            background: 'rgba(255, 68, 68, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: 9, fontWeight: 600, color: '#fff' }}>
              {riskDeduction > 10 ? `-${riskDeduction}` : ''}
            </span>
          </div>
        )}
        
        {warningDeduction > 0 && (
          <div style={{
            width: `${scaledWarningWidth}%`,
            background: 'rgba(255, 215, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: 9, fontWeight: 600, color: '#fff' }}>
              {warningDeduction > 3 ? `-${warningDeduction}` : ''}
            </span>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center' }}>
        {riskCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(255, 68, 68, 0.6)' }} />
            <span style={{ fontSize: 10, color: '#888' }}>{riskCount} risks (-{riskDeduction} pts)</span>
          </div>
        )}
        {warningCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(255, 215, 0, 0.4)' }} />
            <span style={{ fontSize: 10, color: '#888' }}>{warningCount} warnings (-{warningDeduction} pts)</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SafetyReport({ tokenAddress, onClose }) {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)

  const runSafetyCheck = async () => {
    if (!tokenAddress) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE}/api/sniper/safety/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenAddress }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to run safety check')
      }
      
      const data = await response.json()
      setReport(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return '#39FF14'
      case 'B': return '#00D4FF'
      case 'C': return '#FFD700'
      case 'D': return '#FF8C00'
      case 'F': return '#FF4444'
      default: return '#888'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#39FF14'
    if (score >= 60) return '#00D4FF'
    if (score >= 40) return '#FFD700'
    if (score >= 20) return '#FF8C00'
    return '#FF4444'
  }

  return (
    <div className="safety-report">
      <div className="safety-header">
        <h3>Safety Analysis</h3>
        {onClose && (
          <button className="close-btn" onClick={onClose}>×</button>
        )}
      </div>

      <div className="token-input-row">
        <input
          type="text"
          value={tokenAddress || ''}
          readOnly
          placeholder="Token address"
          className="token-address-display"
        />
        <button 
          onClick={runSafetyCheck} 
          disabled={loading || !tokenAddress}
          className="run-check-btn"
        >
          {loading ? 'Checking...' : 'Run Safety Check'}
        </button>
      </div>

      {error && (
        <div className="safety-error">
          {error}
        </div>
      )}

      {report && (
        <div className="safety-results">
          <div className="score-section">
            <div className="score-circle" style={{ borderColor: getScoreColor(report.safetyScore) }}>
              <span className="score-value" style={{ color: getScoreColor(report.safetyScore) }}>
                {report.safetyScore}
              </span>
              <span className="score-label">/ 100</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="grade-badge" style={{ backgroundColor: getGradeColor(report.safetyGrade) }}>
                Grade {report.safetyGrade}
              </div>
              {gradeExplanations[report.safetyGrade] && (
                <div style={{ fontSize: 10, color: '#888', maxWidth: 180 }}>
                  {gradeExplanations[report.safetyGrade].recommendation}
                </div>
              )}
            </div>
            <div className={`pass-status ${report.passesAllChecks ? 'pass' : 'fail'}`}>
              {report.passesAllChecks ? '✓ PASSES ALL CHECKS' : '✗ HAS RISKS'}
            </div>
          </div>

          <ScoreBreakdownBar report={report} />

          {report.risks?.length > 0 && (
            <div className="risks-section">
              <h4>Risks <span style={{ fontWeight: 400, color: '#FF4444' }}>(-20 pts each)</span></h4>
              {report.risks.map((risk, i) => (
                <div key={i} className="risk-item">
                  <span className="risk-icon">⚠️</span>
                  <span>{risk}</span>
                </div>
              ))}
            </div>
          )}

          {report.warnings?.length > 0 && (
            <div className="warnings-section">
              <h4>Warnings <span style={{ fontWeight: 400, color: '#FFD700' }}>(-5 pts each)</span></h4>
              {report.warnings.map((warning, i) => (
                <div key={i} className="warning-item">
                  <span className="warning-icon">⚡</span>
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}

          <div className="checks-grid">
            <div className="check-card">
              <div className="check-title">
                <SafetyTooltip content={safetyExplanations.mintAuthority}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'help' }}>
                    Mint Authority
                    <span style={{ color: '#00D4FF', opacity: 0.6 }}><InfoIcon size={12} /></span>
                  </span>
                </SafetyTooltip>
              </div>
              <div className={`check-status ${!report.hasMintAuthority ? 'safe' : 'danger'}`}>
                {!report.hasMintAuthority ? '✓ Disabled' : '✗ Active'}
              </div>
              <div className="check-impact" style={{ color: !report.hasMintAuthority ? '#888' : '#FF4444' }}>
                {!report.hasMintAuthority ? '0 deducted' : '-20 pts'}
              </div>
            </div>

            <div className="check-card">
              <div className="check-title">
                <SafetyTooltip content={safetyExplanations.freezeAuthority}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'help' }}>
                    Freeze Authority
                    <span style={{ color: '#00D4FF', opacity: 0.6 }}><InfoIcon size={12} /></span>
                  </span>
                </SafetyTooltip>
              </div>
              <div className={`check-status ${!report.hasFreezeAuthority ? 'safe' : 'danger'}`}>
                {!report.hasFreezeAuthority ? '✓ Disabled' : '✗ Active'}
              </div>
              <div className="check-impact" style={{ color: !report.hasFreezeAuthority ? '#888' : '#FF4444' }}>
                {!report.hasFreezeAuthority ? '0 deducted' : '-20 pts'}
              </div>
            </div>

            <div className="check-card">
              <div className="check-title">
                <SafetyTooltip content={safetyExplanations.liquidity}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'help' }}>
                    Liquidity
                    <span style={{ color: '#00D4FF', opacity: 0.6 }}><InfoIcon size={12} /></span>
                  </span>
                </SafetyTooltip>
              </div>
              <div className={`check-status ${report.liquidityLocked || report.liquidityBurned ? 'safe' : 'warning'}`}>
                {report.liquidityBurned ? '✓ Burned' : report.liquidityLocked ? '✓ Locked' : '⚠ Unlocked'}
              </div>
              {report.liquidityLockPlatform && (
                <div className="check-detail">{report.liquidityLockPlatform}</div>
              )}
              <div className="check-impact" style={{ 
                color: report.liquidityLocked || report.liquidityBurned ? '#888' : '#FFD700' 
              }}>
                {report.liquidityLocked || report.liquidityBurned ? '0 deducted' : '-20 pts'}
              </div>
            </div>

            <div className="check-card">
              <div className="check-title">
                <SafetyTooltip content={safetyExplanations.honeypot}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'help' }}>
                    Honeypot
                    <span style={{ color: '#00D4FF', opacity: 0.6 }}><InfoIcon size={12} /></span>
                  </span>
                </SafetyTooltip>
              </div>
              <div className={`check-status ${report.honeypotResult?.canSell && !report.honeypotResult?.isHoneypot ? 'safe' : 'danger'}`}>
                {report.honeypotResult?.isHoneypot 
                  ? '✗ HONEYPOT' 
                  : report.honeypotResult?.canSell 
                    ? '✓ Can Sell' 
                    : '⚠ Check Failed'}
              </div>
              {report.honeypotResult?.sellTax > 0 && (
                <div className="check-detail">Sell Tax: {report.honeypotResult.sellTax.toFixed(1)}%</div>
              )}
              <div className="check-impact" style={{ 
                color: report.honeypotResult?.canSell && !report.honeypotResult?.isHoneypot ? '#888' : '#FF4444' 
              }}>
                {report.honeypotResult?.canSell && !report.honeypotResult?.isHoneypot ? '0 deducted' : '-20 pts'}
              </div>
            </div>

            <div className="check-card">
              <div className="check-title">
                <SafetyTooltip content={safetyExplanations.tokenAge}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'help' }}>
                    Token Age
                    <span style={{ color: '#00D4FF', opacity: 0.6 }}><InfoIcon size={12} /></span>
                  </span>
                </SafetyTooltip>
              </div>
              <div className={`check-status ${report.tokenAgeMinutes >= 1440 ? 'safe' : report.tokenAgeMinutes >= 60 ? 'warning' : 'danger'}`}>
                {report.tokenAgeMinutes < 60 
                  ? `${report.tokenAgeMinutes}m` 
                  : report.tokenAgeMinutes < 1440 
                    ? `${Math.floor(report.tokenAgeMinutes / 60)}h` 
                    : `${Math.floor(report.tokenAgeMinutes / 1440)}d`}
              </div>
              <div className="check-impact" style={{ 
                color: report.tokenAgeMinutes >= 60 ? '#888' : '#FFD700' 
              }}>
                {report.tokenAgeMinutes < 60 ? '-5 pts' : '0 deducted'}
              </div>
            </div>

            <div className="check-card">
              <div className="check-title">
                <SafetyTooltip content={safetyExplanations.holderDistribution}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'help' }}>
                    Top 10 Holders
                    <span style={{ color: '#00D4FF', opacity: 0.6 }}><InfoIcon size={12} /></span>
                  </span>
                </SafetyTooltip>
              </div>
              <div className={`check-status ${report.top10HoldersPercent < 50 ? 'safe' : report.top10HoldersPercent < 70 ? 'warning' : 'danger'}`}>
                {report.top10HoldersPercent?.toFixed(1)}%
              </div>
              <div className="check-impact" style={{ 
                color: report.top10HoldersPercent >= 50 ? '#FFD700' : '#888' 
              }}>
                {report.top10HoldersPercent >= 50 ? '-5 to -20 pts' : '0 deducted'}
              </div>
            </div>

            <div className="check-card">
              <div className="check-title">
                <SafetyTooltip content={safetyExplanations.holderCount}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'help' }}>
                    Holder Count
                    <span style={{ color: '#00D4FF', opacity: 0.6 }}><InfoIcon size={12} /></span>
                  </span>
                </SafetyTooltip>
              </div>
              <div className={`check-status ${report.holderCount > 100 ? 'safe' : report.holderCount > 50 ? 'warning' : 'danger'}`}>
                {report.holderCount?.toLocaleString()}
              </div>
              <div className="check-impact" style={{ 
                color: report.holderCount < 50 ? '#FFD700' : '#888' 
              }}>
                {report.holderCount < 50 ? '-5 pts' : '0 deducted'}
              </div>
            </div>

            <div className="check-card">
              <div className="check-title">
                <SafetyTooltip content={safetyExplanations.creatorRisk}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'help' }}>
                    Creator Risk
                    <span style={{ color: '#00D4FF', opacity: 0.6 }}><InfoIcon size={12} /></span>
                  </span>
                </SafetyTooltip>
              </div>
              <div className={`check-status ${report.creatorRiskScore < 40 ? 'safe' : report.creatorRiskScore < 70 ? 'warning' : 'danger'}`}>
                {report.creatorRiskScore}/100
              </div>
              <div className="check-impact" style={{ 
                color: report.creatorRiskScore >= 70 ? '#FF4444' : report.creatorRiskScore >= 40 ? '#FFD700' : '#888' 
              }}>
                {report.creatorRiskScore >= 70 ? '-20 pts' : report.creatorRiskScore >= 40 ? '-5 pts' : '0 deducted'}
              </div>
            </div>
          </div>

          <div className="score-methodology">
            <div style={{ fontSize: 10, color: '#666', textAlign: 'center', marginTop: 16 }}>
              <strong style={{ color: '#888' }}>How scoring works:</strong> Start at 100 pts. Major risks deduct 20 pts each. Warnings deduct 5 pts each.
              <br />Hover over any check title for detailed explanation.
            </div>
          </div>
        </div>
      )}

      <style>{`
        .safety-report {
          background: #0f0f0f;
          border: 1px solid #222;
          border-radius: 12px;
          padding: 16px;
          margin-top: 12px;
        }
        
        .safety-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .safety-header h3 {
          color: #00D4FF;
          margin: 0;
          font-size: 16px;
        }
        
        .close-btn {
          background: none;
          border: none;
          color: #666;
          font-size: 20px;
          cursor: pointer;
        }
        
        .close-btn:hover {
          color: #FF4444;
        }
        
        .token-input-row {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .token-address-display {
          flex: 1;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 10px 12px;
          color: #888;
          font-size: 12px;
          font-family: monospace;
        }
        
        .run-check-btn {
          background: linear-gradient(135deg, #00D4FF, #0099CC);
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          color: #000;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }
        
        .run-check-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .run-check-btn:hover:not(:disabled) {
          transform: scale(1.02);
        }
        
        .safety-error {
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid #FF4444;
          border-radius: 8px;
          padding: 12px;
          color: #FF4444;
          margin-bottom: 16px;
        }
        
        .score-section {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          padding: 16px;
          background: #1a1a1a;
          border-radius: 12px;
        }
        
        .score-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 4px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
        }
        
        .score-value {
          font-size: 28px;
          font-weight: 700;
        }
        
        .score-label {
          font-size: 12px;
          color: #666;
        }
        
        .grade-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 700;
          color: #000;
          font-size: 14px;
        }
        
        .pass-status {
          margin-left: auto;
          font-weight: 600;
          font-size: 13px;
        }
        
        .pass-status.pass {
          color: #39FF14;
        }
        
        .pass-status.fail {
          color: #FF4444;
        }
        
        .risks-section, .warnings-section {
          margin-bottom: 16px;
        }
        
        .risks-section h4, .warnings-section h4 {
          color: #888;
          font-size: 12px;
          text-transform: uppercase;
          margin: 0 0 8px 0;
        }
        
        .risk-item, .warning-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: rgba(255, 68, 68, 0.1);
          border-radius: 8px;
          margin-bottom: 6px;
          color: #FF6B6B;
          font-size: 13px;
        }
        
        .warning-item {
          background: rgba(255, 215, 0, 0.1);
          color: #FFD700;
        }
        
        .checks-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        
        @media (max-width: 768px) {
          .checks-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .score-section {
            flex-wrap: wrap;
          }
        }
        
        .check-card {
          background: #1a1a1a;
          border: 1px solid #222;
          border-radius: 10px;
          padding: 12px;
          text-align: center;
        }
        
        .check-title {
          color: #666;
          font-size: 11px;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: flex;
          justify-content: center;
        }
        
        .check-status {
          font-weight: 600;
          font-size: 14px;
        }
        
        .check-status.safe {
          color: #39FF14;
        }
        
        .check-status.warning {
          color: #FFD700;
        }
        
        .check-status.danger {
          color: #FF4444;
        }
        
        .check-status.neutral {
          color: #00D4FF;
        }
        
        .check-detail {
          color: #666;
          font-size: 10px;
          margin-top: 4px;
        }
        
        .check-impact {
          font-size: 9px;
          margin-top: 4px;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
