import { useState, useEffect } from 'react'

const TARGET_PREDICTIONS = 50

export default function AIStatusWidget() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [userHistory, setUserHistory] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('howItWorks')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/ml/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
          setError(false)
        } else {
          setError(true)
        }
      } catch (err) {
        console.log('Failed to fetch AI stats')
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchUserHistory = async () => {
      if (showModal && activeTab === 'predictions') {
        setHistoryLoading(true)
        try {
          const response = await fetch('/api/ml/user-history?limit=20')
          if (response.ok) {
            const data = await response.json()
            setUserHistory(data)
          }
        } catch (err) {
          console.log('Failed to fetch user history')
        } finally {
          setHistoryLoading(false)
        }
      }
    }
    fetchUserHistory()
  }, [showModal, activeTab])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    if (showModal) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showModal])

  if (loading) {
    return (
      <div style={{
        background: '#0f0f0f',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #222',
        height: '100%',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        <div style={{ color: '#666', fontSize: '13px' }}>Loading AI Status...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: '#0f0f0f',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #222',
        height: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🧠</span>
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>AI Status</span>
        </div>
        <p style={{ color: '#666', fontSize: '12px', margin: '12px 0 0 0' }}>
          Status unavailable - will retry shortly
        </p>
      </div>
    )
  }

  const totalPredictions = stats?.totalPredictions || 0
  const progress = Math.min((totalPredictions / TARGET_PREDICTIONS) * 100, 100)
  const outcomesByHorizon = stats?.outcomesByHorizon || {}
  
  const calculateOverallAccuracy = () => {
    let totalCorrect = 0
    let totalOutcomes = 0
    Object.values(outcomesByHorizon).forEach((h) => {
      totalCorrect += h.correct || 0
      totalOutcomes += h.total || 0
    })
    if (totalOutcomes === 0) return null
    return ((totalCorrect / totalOutcomes) * 100).toFixed(1)
  }
  
  const overallAccuracy = calculateOverallAccuracy()
  const isActive = totalPredictions >= TARGET_PREDICTIONS
  
  const getStatus = () => {
    if (isActive) return { label: 'Active', color: '#00ff88' }
    if (totalPredictions >= TARGET_PREDICTIONS / 2) return { label: 'Training', color: '#ffaa00' }
    return { label: 'Learning', color: '#00D4FF' }
  }

  const status = getStatus()
  
  const getAccuracyColor = (rate) => {
    const num = parseFloat(rate)
    if (num >= 60) return '#00ff88'
    if (num >= 50) return '#ffaa00'
    return '#ff4444'
  }

  const getSignalColor = (signal) => {
    if (signal === 'BUY' || signal === 'STRONG_BUY') return '#00ff88'
    if (signal === 'SELL' || signal === 'STRONG_SELL') return '#ff4444'
    return '#888'
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const OutcomeBadge = ({ status }) => {
    if (status === 'correct') {
      return <span style={{ color: '#00ff88', fontSize: '14px' }}>✓</span>
    }
    if (status === 'incorrect') {
      return <span style={{ color: '#ff4444', fontSize: '14px' }}>✗</span>
    }
    return <span style={{ color: '#666', fontSize: '12px' }}>⏳</span>
  }

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        style={{
          background: '#0f0f0f',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #222',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          height: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#333'
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#222'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🧠</span>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>AI Status</span>
            <span style={{ color: '#555', fontSize: '11px' }}>Tap for details</span>
          </div>
          <span style={{
            padding: '3px 10px',
            background: status.color + '22',
            color: status.color,
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 600
          }}>
            {status.label}
          </span>
        </div>

        {isActive && overallAccuracy ? (
          <>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '10px'
            }}>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 700, 
                color: getAccuracyColor(overallAccuracy),
                lineHeight: 1
              }}>
                {overallAccuracy}%
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#888' }}>Overall Accuracy</div>
                <div style={{ fontSize: '10px', color: '#555' }}>{totalPredictions} predictions</div>
              </div>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '6px',
            }}>
              {['1h', '4h', '24h', '7d'].map(h => {
                const data = outcomesByHorizon[h] || { winRate: '0', total: 0 }
                return (
                  <div key={h} style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      color: data.total > 0 ? getAccuracyColor(data.winRate) : '#444' 
                    }}>
                      {data.total > 0 ? `${data.winRate}%` : '-'}
                    </div>
                    <div style={{ fontSize: '9px', color: '#666' }}>{h}</div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#888', fontSize: '12px' }}>Learning Progress</span>
                <span style={{ color: '#fff', fontSize: '12px' }}>{totalPredictions} / {TARGET_PREDICTIONS}</span>
              </div>
              <div style={{ 
                background: '#333', 
                borderRadius: '6px', 
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: status.color,
                  borderRadius: '6px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
            <p style={{ 
              color: '#888', 
              fontSize: '12px', 
              margin: 0,
              lineHeight: 1.4
            }}>
              {totalPredictions} predictions collected - Your analyses help train our AI!
            </p>
          </>
        )}
      </div>

      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1a1a',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: 'min(500px, 95vw)',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #333',
              boxShadow: '0 0 40px rgba(0, 212, 255, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🧠</span>
                <span style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>AI Learning System</span>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                onClick={() => setActiveTab('howItWorks')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: activeTab === 'howItWorks' ? '#00D4FF22' : '#0f0f0f',
                  border: `1px solid ${activeTab === 'howItWorks' ? '#00D4FF' : '#333'}`,
                  borderRadius: '8px',
                  color: activeTab === 'howItWorks' ? '#00D4FF' : '#888',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                How It Works
              </button>
              <button
                onClick={() => setActiveTab('predictions')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: activeTab === 'predictions' ? '#00D4FF22' : '#0f0f0f',
                  border: `1px solid ${activeTab === 'predictions' ? '#00D4FF' : '#333'}`,
                  borderRadius: '8px',
                  color: activeTab === 'predictions' ? '#00D4FF' : '#888',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                My Predictions
              </button>
            </div>

            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              paddingRight: '4px'
            }}>
              {activeTab === 'howItWorks' && (
                <div>
                  <div style={{ 
                    background: status.color + '15', 
                    border: `1px solid ${status.color}40`,
                    borderRadius: '12px', 
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ color: status.color, fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Current Status: {status.label}
                    </div>
                    <div style={{ color: '#fff', fontSize: '24px', fontWeight: 700 }}>
                      {totalPredictions} / {TARGET_PREDICTIONS} predictions
                    </div>
                    <div style={{ 
                      background: '#333', 
                      borderRadius: '6px', 
                      height: '10px',
                      overflow: 'hidden',
                      marginTop: '12px'
                    }}>
                      <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: status.color,
                        borderRadius: '6px'
                      }} />
                    </div>
                  </div>

                  <div style={{ 
                    background: '#0f0f0f', 
                    borderRadius: '12px', 
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid #222'
                  }}>
                    <div style={{ color: '#00D4FF', fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📊</span> Every Analysis Trains Our AI
                    </div>
                    <p style={{ color: '#ccc', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                      When you analyze a coin, our AI records the market conditions, technical indicators, and your analysis. 
                      This data helps the model learn patterns that lead to successful trades.
                    </p>
                  </div>

                  <div style={{ 
                    background: '#0f0f0f', 
                    borderRadius: '12px', 
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid #222'
                  }}>
                    <div style={{ color: '#ffaa00', fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>⏱️</span> We Track Outcomes at 4 Timeframes
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
                      {['1h', '4h', '24h', '7d'].map(h => (
                        <div key={h} style={{ 
                          background: '#1a1a1a', 
                          padding: '10px', 
                          borderRadius: '8px', 
                          textAlign: 'center',
                          border: '1px solid #333'
                        }}>
                          <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{h}</div>
                          <div style={{ color: '#666', fontSize: '10px' }}>horizon</div>
                        </div>
                      ))}
                    </div>
                    <p style={{ color: '#888', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
                      After each prediction, we check if the price moved in the predicted direction at 1 hour, 4 hours, 24 hours, and 7 days.
                    </p>
                  </div>

                  <div style={{ 
                    background: '#0f0f0f', 
                    borderRadius: '12px', 
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid #222'
                  }}>
                    <div style={{ color: '#00ff88', fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🎯</span> 55%+ Accuracy Unlocks Auto-Trading
                    </div>
                    <p style={{ color: '#ccc', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                      Once the AI achieves consistent accuracy above 55%, it becomes eligible to execute autonomous trades. 
                      Higher accuracy = higher confidence = larger position sizes.
                    </p>
                    <div style={{ marginTop: '12px', padding: '10px', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #333' }}>
                      <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Accuracy Thresholds:</div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div><span style={{ color: '#ff4444' }}>{'<50%'}</span> <span style={{ color: '#666' }}>= Learning</span></div>
                        <div><span style={{ color: '#ffaa00' }}>50-55%</span> <span style={{ color: '#666' }}>= Almost Ready</span></div>
                        <div><span style={{ color: '#00ff88' }}>{'>55%'}</span> <span style={{ color: '#666' }}>= Trade Ready</span></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    background: '#0f0f0f', 
                    borderRadius: '12px', 
                    padding: '16px',
                    border: '1px solid #222'
                  }}>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                      Understanding the Numbers
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#ccc', fontSize: '13px', lineHeight: 1.8 }}>
                      <li><strong style={{ color: '#fff' }}>Win Rate</strong> - % of predictions where price moved in the predicted direction</li>
                      <li><strong style={{ color: '#fff' }}>1h/4h/24h/7d</strong> - Accuracy at each time horizon</li>
                      <li><strong style={{ color: '#fff' }}>Predictions</strong> - Total number of AI signals generated</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'predictions' && (
                <div>
                  {historyLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
                      Loading predictions...
                    </div>
                  ) : !userHistory?.predictions?.length ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px 20px',
                      background: '#0f0f0f',
                      borderRadius: '12px',
                      border: '1px solid #222'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                        No Predictions Yet
                      </div>
                      <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
                        Analyze some coins to start building your prediction history!
                      </p>
                    </div>
                  ) : (
                    <>
                      {userHistory.summary && (
                        <div style={{ 
                          background: '#0f0f0f', 
                          borderRadius: '12px', 
                          padding: '14px',
                          marginBottom: '16px',
                          border: '1px solid #222'
                        }}>
                          <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                            Accuracy by Horizon
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {['1h', '4h', '24h', '7d'].map(h => {
                              const data = userHistory.summary.accuracyByHorizon?.[h] || { accuracy: '0', total: 0 }
                              return (
                                <div key={h} style={{ textAlign: 'center' }}>
                                  <div style={{ 
                                    fontSize: '16px', 
                                    fontWeight: 700, 
                                    color: data.total > 0 ? getAccuracyColor(data.accuracy) : '#444' 
                                  }}>
                                    {data.total > 0 ? `${data.accuracy}%` : '-'}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#666' }}>{h}</div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Recent Predictions</span>
                        <span>{userHistory.pagination?.total || 0} total</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {userHistory.predictions.map((pred) => (
                          <div 
                            key={pred.id}
                            style={{
                              background: '#0f0f0f',
                              borderRadius: '10px',
                              padding: '12px 14px',
                              border: '1px solid #222'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>
                                  {pred.ticker?.toUpperCase()}
                                </span>
                                <span style={{ 
                                  padding: '2px 8px',
                                  background: getSignalColor(pred.signal) + '22',
                                  color: getSignalColor(pred.signal),
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 600
                                }}>
                                  {pred.signal}
                                </span>
                                {pred.confidence && (
                                  <span style={{ color: '#666', fontSize: '11px' }}>
                                    {pred.confidence}
                                  </span>
                                )}
                              </div>
                              <span style={{ color: '#555', fontSize: '11px' }}>
                                {formatDate(pred.createdAt)}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ color: '#666', fontSize: '11px', marginRight: '8px' }}>Outcomes:</span>
                              {['1h', '4h', '24h', '7d'].map(h => (
                                <div 
                                  key={h} 
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '3px',
                                    padding: '3px 6px',
                                    background: '#1a1a1a',
                                    borderRadius: '4px'
                                  }}
                                >
                                  <span style={{ fontSize: '10px', color: '#666' }}>{h}</span>
                                  <OutcomeBadge status={pred.outcomes?.[h]} />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {userHistory.pagination?.hasMore && (
                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                          <span style={{ color: '#666', fontSize: '12px' }}>
                            Showing {userHistory.predictions.length} of {userHistory.pagination.total}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowModal(false)}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '14px',
                background: 'linear-gradient(135deg, #00D4FF, #0099FF)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
