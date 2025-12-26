import { useState, useRef } from 'react'

export default function MobileCardCarousel({ children, items, renderItem }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartRef = useRef(null)
  const touchStartYRef = useRef(null)
  const containerRef = useRef(null)
  
  // Support both children and items/renderItem patterns
  const childArray = items && renderItem 
    ? items.map((item, idx) => renderItem(item, idx))
    : (Array.isArray(children) ? children : [children])
  const totalCards = childArray.length

  const goTo = (index) => {
    if (index < 0) index = totalCards - 1
    if (index >= totalCards) index = 0
    setCurrentIndex(index)
  }

  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX
    touchStartYRef.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    if (touchStartRef.current === null) return
    
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const diffX = touchStartRef.current - touchEndX
    const diffY = Math.abs(touchStartYRef.current - touchEndY)
    
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > diffY) {
      if (diffX > 0) {
        goTo(currentIndex + 1)
      } else {
        goTo(currentIndex - 1)
      }
    }
    
    touchStartRef.current = null
    touchStartYRef.current = null
  }

  return (
    <div className="mobile-card-carousel">
      <style>{`
        .mobile-card-carousel {
          position: relative;
          width: 100%;
          overflow: visible;
        }
        
        .mcc-track {
          display: flex;
          transition: transform 0.3s ease-out;
        }
        
        .mcc-slide {
          flex: 0 0 100%;
          width: 100%;
          padding: 0 4px;
          box-sizing: border-box;
        }
        
        .mcc-nav {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 10px;
          padding: 6px 0;
        }
        
        .mcc-arrow {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: #1a1a1a;
          border: 1px solid #333;
          color: #fff;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .mcc-arrow:hover {
          background: #141414;
          border-color: #00D4FF;
        }
        
        .mcc-arrow:active {
          transform: scale(0.95);
        }
        
        .mcc-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        
        .mcc-dots {
          display: flex;
          gap: 6px;
        }
        
        .mcc-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #444;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .mcc-dot.active {
          background: #00D4FF;
          box-shadow: 0 0 6px rgba(0, 212, 255, 0.5);
        }
        
        .mcc-label {
          text-align: center;
          font-size: 9px;
          color: #555;
        }
      `}</style>
      
      <div
        ref={containerRef}
        className="mcc-track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {childArray.map((child, index) => (
          <div key={index} className="mcc-slide">
            {child}
          </div>
        ))}
      </div>
      
      <div className="mcc-nav">
        <button className="mcc-arrow" onClick={() => goTo(currentIndex - 1)}>
          ‹
        </button>
        
        <div className="mcc-center">
          <div className="mcc-dots">
            {childArray.map((_, index) => (
              <div
                key={index}
                className={`mcc-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
          <div className="mcc-label">
            {currentIndex + 1} / {totalCards}
          </div>
        </div>
        
        <button className="mcc-arrow" onClick={() => goTo(currentIndex + 1)}>
          ›
        </button>
      </div>
    </div>
  )
}
