import { useState, useEffect, useCallback } from 'react'

export default function FlipCarousel({ 
  items, 
  renderItem, 
  autoPlay = false, 
  interval = 5000,
  showArrows = true,
  showDots = true,
  className = '',
  style = {}
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState('next')

  const goTo = useCallback((index, direction = 'next') => {
    if (isFlipping || items.length <= 1) return
    setFlipDirection(direction)
    setIsFlipping(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setTimeout(() => setIsFlipping(false), 300)
    }, 300)
  }, [isFlipping, items.length])

  const next = useCallback(() => {
    const nextIndex = (currentIndex + 1) % items.length
    goTo(nextIndex, 'next')
  }, [currentIndex, items.length, goTo])

  const prev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + items.length) % items.length
    goTo(prevIndex, 'prev')
  }, [currentIndex, items.length, goTo])

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [autoPlay, interval, next, items.length])

  const handleSwipe = (e) => {
    const touch = e.changedTouches?.[0]
    if (!touch) return
    const startX = e.target.dataset.startX
    const diff = touch.clientX - startX
    if (Math.abs(diff) > 50) {
      diff > 0 ? prev() : next()
    }
  }

  if (!items || items.length === 0) {
    return <div style={{ ...style }} className={className}>No items</div>
  }

  return (
    <div 
      className={className}
      style={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        perspective: '1000px',
        overflow: 'hidden',
        ...style 
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipping 
            ? flipDirection === 'next' 
              ? 'rotateY(-15deg) scale(0.95)' 
              : 'rotateY(15deg) scale(0.95)'
            : 'rotateY(0deg) scale(1)',
        }}
        onTouchStart={(e) => {
          e.target.dataset.startX = e.touches[0].clientX
        }}
        onTouchEnd={handleSwipe}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            borderRadius: 12,
            overflow: 'hidden',
            opacity: isFlipping ? 0.7 : 1,
            transition: 'opacity 0.3s ease',
          }}
        >
          {renderItem(items[currentIndex], currentIndex)}
        </div>
        
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
            pointerEvents: 'none',
            opacity: isFlipping ? 0.8 : 0,
            transition: 'opacity 0.3s ease',
            borderRadius: 12,
          }}
        />
      </div>

      {showArrows && items.length > 1 && (
        <>
          <button
            onClick={prev}
            style={{
              position: 'absolute',
              left: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid #333',
              color: '#fff',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              opacity: 0.7,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.opacity = 1}
            onMouseLeave={(e) => e.target.style.opacity = 0.7}
          >
            ‹
          </button>
          <button
            onClick={next}
            style={{
              position: 'absolute',
              right: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid #333',
              color: '#fff',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              opacity: 0.7,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.opacity = 1}
            onMouseLeave={(e) => e.target.style.opacity = 0.7}
          >
            ›
          </button>
        </>
      )}

      {showDots && items.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: 6,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 4,
          zIndex: 10,
        }}>
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx, idx > currentIndex ? 'next' : 'prev')}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: idx === currentIndex ? '#00D4FF' : '#444',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
      )}

      <div style={{
        position: 'absolute',
        top: 6,
        right: 6,
        fontSize: 9,
        color: '#555',
        zIndex: 10,
      }}>
        {currentIndex + 1}/{items.length}
      </div>
    </div>
  )
}
