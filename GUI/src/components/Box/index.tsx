import React, { BaseHTMLAttributes, forwardRef, PropsWithChildren } from 'react'
import clsx from 'clsx'

import './Box.scss'

type BoxProps = BaseHTMLAttributes<HTMLDivElement> & {
  color?: 'default' | 'blue' | 'yellow' | 'green' | 'red' | 'gray',
}

const Box = forwardRef<HTMLDivElement, PropsWithChildren<BoxProps>>(({ color = 'default', children, ...rest }, ref) => {
  return (
    <div ref={ref} className={clsx(['box', `box--${color}`])} {...rest}>
      {children}
    </div>
  )
})

Box.displayName = 'box'

export default Box
