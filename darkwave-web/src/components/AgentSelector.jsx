import React, { useState } from 'react'

const AGENTS = [
  { id: 1, name: 'Agent Alex', age: 28, ageGroup: 'young' },
  { id: 2, name: 'Agent Marcus', age: 42, ageGroup: 'middle' },
  { id: 3, name: 'Agent Sofia', age: 26, ageGroup: 'young' },
  { id: 4, name: 'Agent Raj', age: 48, ageGroup: 'middle' },
  { id: 5, name: 'Agent Layla', age: 51, ageGroup: 'middle' },
  { id: 6, name: 'Agent Blake', age: 58, ageGroup: 'old' },
  { id: 7, name: 'Agent Devon', age: 45, ageGroup: 'middle' },
  { id: 8, name: 'Agent Aria', age: 31, ageGroup: 'young' },
  { id: 9, name: 'Agent Mei', age: 27, ageGroup: 'young' },
  { id: 10, name: 'Agent Claire', age: 61, ageGroup: 'old' },
  { id: 11, name: 'Agent Vikram', age: 39, ageGroup: 'middle' },
  { id: 12, name: 'Agent Zara', age: 29, ageGroup: 'young' },
  { id: 13, name: 'Agent Marco', age: 46, ageGroup: 'middle' },
  { id: 14, name: 'Agent Jade', age: 35, ageGroup: 'middle' },
  { id: 15, name: 'Agent Luis', age: 25, ageGroup: 'young' },
  { id: 16, name: 'Agent Kaia', age: 56, ageGroup: 'old' },
  { id: 17, name: 'Agent Nova', age: 32, ageGroup: 'young' },
  { id: 18, name: 'Agent Kai', age: 52, ageGroup: 'middle' }
]

export default function AgentSelector({ isOpen, onClose, isSubscribed }) {
  const [filter, setFilter] = useState('all')
  const [selectedAgent, setSelectedAgent] = useState(null)

  const filteredAgents = filter === 'all' ? AGENTS : AGENTS.filter(a => a.ageGroup === filter)

  if (!isOpen) return null

  if (!isSubscribed) {
    return (
      <div className="agent-selector-modal">
        <div className="agent-selector-container">
          <div className="agent-selector-locked">
            <div className="agent-lock-icon">🔒</div>
            <h3>Premium Feature</h3>
            <p>Choose from 18 AI agents</p>
            <button className="agent-upgrade-btn">UPGRADE NOW</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="agent-selector-modal">
      <div className="agent-selector-container">
        <div className="agent-carousel-wrapper">
          <div className="agent-carousel-header">
            <h3>Select Your Agent</h3>
            <button className="agent-carousel-close" onClick={onClose}>×</button>
          </div>

          <div className="agent-carousel-filters">
            {['all', 'young', 'middle', 'old'].map(f => (
              <button
                key={f}
                className={`agent-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'young' ? 'Young (20-30)' : f === 'middle' ? 'Middle (35-55)' : 'Senior (55+)'}
              </button>
            ))}
          </div>

          <div className="agent-carousel">
            <button className="agent-carousel-nav">❮</button>
            <div className="agent-carousel-track">
              {filteredAgents.map(agent => (
                <div
                  key={agent.id}
                  className="agent-carousel-card"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="agent-card-placeholder">{agent.name.charAt(7)}</div>
                  <div className="agent-card-info">
                    <div className="agent-card-name">{agent.name}</div>
                    <div className="agent-card-age">{agent.age}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="agent-carousel-nav">❯</button>
          </div>

          <div className="agent-carousel-dots">
            {[...Array(Math.ceil(filteredAgents.length / 3))].map((_, i) => (
              <button key={i} className={`agent-dot ${i === 0 ? 'active' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
