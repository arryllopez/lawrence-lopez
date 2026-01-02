import type { ReactNode } from "react"

export interface Project {
  name: string
  slogan: string
  link?: string
}

export interface Experience {
  role: string
  company: string
  period: string
}

export interface Section {
  id: string
  title: string
  subtitle?: ReactNode
  content?: string
  showButton?: boolean
  buttonText?: string
  buttonLink?: string
  projects?: Project[]
  experiences?: Experience[]
  isContactForm?: boolean
  isGame?: boolean
}

export interface SectionProps extends Section {
  isActive: boolean
}
