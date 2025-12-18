import { useState, useEffect, useCallback, useRef } from 'react'

export default function FlipCarousel({ 
  items, 
  renderItem, 
  autoPlay = false, 
  interval = 5000,
  showArrows = true,
  showDots = true,
  showCounter = true,
  className = '',
  style = {}
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(1)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState('next')
  const touchStartRef = useRef({ x: 0, y: 0 })

  const goTo = useCallback((index, direction = 'next') => {
    if (isFlipping || items.length <= 1) return
    setFlipDirection(direction)
    setNextIndex(index)
    setIsFlipping(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsFlipping(false)
    }, 600)
  }, [isFlipping, items.length])

  const next = useCallback(() => {
    const idx = (currentIndex + 1) % items.length
    goTo(idx, 'next')
  }, [currentIndex, items.length, goTo])

  const prev = useCallback(() => {
    const idx = (currentIndex - 1 + items.length) % items.length
    goTo(idx, 'prev')
  }, [currentIndex, items.length, goTo])

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [autoPlay, interval, next, items.length])

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const touch = e.changedTouches?.[0]
    if (!touch) return
    const diffX = touch.clientX - touchStartRef.current.x
    const diffY = touch.clientY - touchStartRef.current.y
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      diffX > 0 ? prev() : next()
    }
  }, [prev, next])

  if (!items || items.length === 0) {
    return <div style={{ ...style }} className={className}>No items</div>
  }

  const flipRotation = flipDirection === 'next' ? 180 : -180

  return (
    <div 
      className={className}
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        ...style 
      }}
    >
      <div
        style={{
          position: 'relative',
          flex: 1,
          perspective: '1200px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transition: isFlipping ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            transform: isFlipping ? `rotateY(${flipRotation}deg)` : 'rotateY(0deg)',
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {renderItem(items[currentIndex], currentIndex)}
          </div>

          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderRadius: 12,
              overflow: 'hidden',
              transform: `rotateY(${-flipRotation}deg)`,
            }}
          >
            {isFlipping && renderItem(items[nextIndex], nextIndex)}
          </div>
        </div>

        {showCounter && (
          <div style={{
            position: 'absolute',
            top: 6,
            left: 6,
            fontSize: 9,
            color: '#555',
            zIndex: 10,
          }}>
            {currentIndex + 1}/{items.length}
          </div>
        )}
      </div>

      {(showArrows || showDots) && items.length > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          paddingTop: 10,
        }}>
          {showArrows && (
            <button
              onClick={prev}
              disabled={isFlipping}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#141414',
                border: '1px solid #00D4FF',
                color: '#00D4FF',
                fontSize: 18,
                fontWeight: 'bold',
                cursor: isFlipping ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isFlipping ? 0.5 : 1,
                transition: 'all 0.2s',
                boxShadow: '0 0 8px rgba(0, 212, 255, 0.4)',
              }}
            >
              ‹
            </button>
          )}

          {showDots && (
            <div style={{
              display: 'flex',
              gap: 6,
            }}>
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx, idx > currentIndex ? 'next' : 'prev')}
                  disabled={isFlipping}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: idx === currentIndex ? '#00D4FF' : '#444',
                    border: 'none',
                    cursor: isFlipping ? 'default' : 'pointer',
                    padding: 0,
                    transition: 'background 0.2s',
                  }}
                />
              ))}
            </div>
          )}

          {showArrows && (
            <button
              onClick={next}
              disabled={isFlipping}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#141414',
                border: '1px solid #00D4FF',
                color: '#00D4FF',
                fontSize: 18,
                fontWeight: 'bold',
                cursor: isFlipping ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isFlipping ? 0.5 : 1,
                transition: 'all 0.2s',
                boxShadow: '0 0 8px rgba(0, 212, 255, 0.4)',
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  )
}
