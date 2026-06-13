import type { ComponentPropsWithoutRef } from 'react'
import styles from './Button.module.css'

type ButtonProps = ComponentPropsWithoutRef<'button'>

function Button({ className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={[styles.button, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}

export default Button
