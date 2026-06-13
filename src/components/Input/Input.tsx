import type { ComponentPropsWithoutRef } from 'react'
import styles from './Input.module.css'

type InputProps = ComponentPropsWithoutRef<'input'>

function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={[styles.input, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}

export default Input
