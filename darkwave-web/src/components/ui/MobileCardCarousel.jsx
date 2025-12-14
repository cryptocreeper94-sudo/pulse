import { useState, useRef } from 'react'

export default function MobileCardCarousel({ children }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartRef = useRef(null)
  const touchStartYRef = useRef(null)
  const containerRef = useRef(null)
  
  const childArray = Array.isArray(children) ? children : [children]
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
          overflow: hidden;
        }
        
        .carousel-track {
          display: flex;
          transition: transform 0.3s ease-out;
        }
        
        .carousel-slide {
          flex: 0 0 100%;
          width: 100%;
          padding: 0 4px;
          box-sizing: border-box;
        }
        
        .carousel-nav {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 12px;
          padding: 8px 0;
        }
        
        .carousel-arrow {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #1a1a1a;
          border: 1px solid #333;
          color: #fff;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .carousel-arrow:hover {
          background: #141414;
          border-color: #00D4FF;
          box-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
        }
        
        .carousel-arrow:active {
          transform: scale(0.95);
        }
        
        .carousel-dots {
          display: flex;
          gap: 8px;
        }
        
        .carousel-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #444;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .carousel-dot.active {
          background: #00D4FF;
          box-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
        }
        
        .carousel-label {
          text-align: center;
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 4px;
        }
      `}</style>
      
      <div
        ref={containerRef}
        className="carousel-track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {childArray.map((child, index) => (
          <div key={index} className="carousel-slide">
            {child}
          </div>
        ))}
      </div>
      
      <div className="carousel-nav">
        <button className="carousel-arrow" onClick={() => goTo(currentIndex - 1)}>
          ‹
        </button>
        
        <div className="carousel-dots">
          {childArray.map((_, index) => (
            <div
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
        
        <button className="carousel-arrow" onClick={() => goTo(currentIndex + 1)}>
          ›
        </button>
      </div>
      
      <div className="carousel-label">
        {currentIndex + 1} / {totalCards}
      </div>
    </div>
  )
}
