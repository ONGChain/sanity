import {Path} from '@sanity/types'
import React, {PropsWithChildren, useCallback, useMemo, useState} from 'react'
import {HoveredFieldContext, HoveredFieldContextValue} from './HoveredFieldContext'

/** @internal */
export function HoveredFieldProvider(props: PropsWithChildren) {
  const {children} = props
  const [hoveredStack, setHoveredStack] = useState<Path[]>([])

  const handleMouseEnter = useCallback((path: Path) => {
    setHoveredStack((prev) => {
      return [...prev, path]
    })
  }, [])

  const handleMouseLeave = useCallback((_path: Path) => {
    setHoveredStack((prev) => {
      return prev.slice(0, prev.length - 1)
    })
  }, [])

  const context: HoveredFieldContextValue = useMemo(
    () => ({
      hoveredStack,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    }),
    [handleMouseEnter, handleMouseLeave, hoveredStack]
  )

  return <HoveredFieldContext.Provider value={context}>{children}</HoveredFieldContext.Provider>
}
