import { useState, useEffect, useSyncExternalStore } from 'react'

const MOBILE_BREAKPOINT = 1024

function getSnapshot() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
}

function getServerSnapshot() {
  return false
}

function subscribe(callback) {
  if (typeof window === 'undefined') return () => {}
  const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function useResponsiveValue(mobileValue, desktopValue) {
  const isMobile = useIsMobile()
  return isMobile ? mobileValue : desktopValue
}

export function useViewportBreakpoint() {
  const isMobile = useIsMobile()
  return {
    isMobile,
    breakpoint: isMobile ? 'mobile' : 'desktop',
    gaugeSize: isMobile ? 140 : 160,
    arrowSize: isMobile ? 24 : 32,
    dotSize: isMobile ? 6 : 8,
  }
}
