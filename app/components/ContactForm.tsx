"use client"

import { motion } from "framer-motion"
import { Mail } from "lucide-react"

interface ContactFormProps {
  isActive: boolean
}

export default function ContactForm({ isActive }: ContactFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isActive ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-8 w-full max-w-2xl"
    >
      <motion.a
        href="mailto:arryllopez7@gmail.com"
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="group flex items-center justify-center gap-3 p-6 border border-neutral-700 rounded-lg hover:border-neutral-500 transition-all"
      >
        <Mail className="w-6 h-6 text-neutral-400 group-hover:text-white transition-colors" />
        <span className="text-xl md:text-2xl text-neutral-300 group-hover:text-white transition-colors">
          arryllopez7@gmail.com
        </span>
      </motion.a>
    </motion.div>
  )
}
