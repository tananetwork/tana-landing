'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface AnimatedTerminalWithScreenshotProps {
  command: string
  screenshotPath?: string
  screenshotAlt?: string
  align?: 'left' | 'right'
}

export function AnimatedTerminalWithScreenshot({
  command,
  screenshotPath,
  screenshotAlt = 'Screenshot',
  align = 'right'
}: AnimatedTerminalWithScreenshotProps) {
  const [currentChar, setCurrentChar] = useState(0)
  const [showScreenshot, setShowScreenshot] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    // Reset animation cycle
    const resetCycle = () => {
      setCurrentChar(0)
      setShowScreenshot(false)
    }

    if (!showScreenshot) {
      // Typing animation
      if (currentChar < command.length) {
        const timeout = setTimeout(() => {
          setCurrentChar(currentChar + 1)
        }, 50)
        return () => clearTimeout(timeout)
      } else {
        // Command complete, show screenshot after 3 seconds
        const timeout = setTimeout(() => {
          setShowScreenshot(true)
        }, 3000)
        return () => clearTimeout(timeout)
      }
    } else {
      // Show screenshot for 5 seconds, then reset
      const timeout = setTimeout(() => {
        resetCycle()
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [currentChar, showScreenshot, command])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)
    return () => clearInterval(cursorInterval)
  }, [])

  const getCurrentCommand = () => {
    return command.slice(0, currentChar)
  }

  return (
    <div className={`${align === 'left' ? 'lg:pr-8' : 'lg:pl-8'}`}>
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-6 font-mono text-sm shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-muted-foreground ml-2">
            {showScreenshot ? screenshotAlt : 'terminal'}
          </span>
        </div>

        {/* Fixed height container to prevent layout shift */}
        <div className="h-[350px] flex items-start justify-start">
          {!showScreenshot ? (
            <div className="w-full pt-2">
              <div className="text-foreground">
                <span className="text-primary">$</span> {getCurrentCommand()}
                {showCursor && currentChar < command.length && (
                  <span className="text-foreground animate-pulse">_</span>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-full rounded-lg overflow-hidden bg-secondary/30 border border-border/50">
              {screenshotPath ? (
                <Image
                  src={screenshotPath}
                  alt={screenshotAlt}
                  width={800}
                  height={600}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center space-y-2">
                    <div className="text-4xl">📸</div>
                    <div className="text-sm">Screenshot Placeholder</div>
                    <div className="text-xs opacity-50">{screenshotAlt}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
