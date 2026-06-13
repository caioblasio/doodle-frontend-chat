import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import styles from './Input.module.css'

type InputProps = ComponentPropsWithoutRef<'input'>

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={[styles.input, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
})

export default Input
