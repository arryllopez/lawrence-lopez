"use client"

import { motion } from "framer-motion"
import { Mail, Linkedin, Github } from "lucide-react"

interface ContactFormProps {
  isActive: boolean
}

export default function ContactForm({ isActive }: ContactFormProps) {
  const contacts = [
    {
      icon: Mail,
      href: "mailto:arryllopez7@gmail.com",
      delay: 0.5
    },
    {
      icon: Linkedin,
      href: "https://linkedin.com/in/arryl-lopez/",
      delay: 0.6
    },
    {
      icon: Github,
      href: "https://github.com/arryllopez",
      delay: 0.7
    }
  ]

  return (
    <div className="mt-8 w-full flex flex-col items-center justify-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-4xl md:text-5xl font-bold text-white mb-12 text-center"
      >
        Let's Connect
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-center items-center gap-12"
      >
        {contacts.map((contact, index) => {
          const Icon = contact.icon
          return (
            <motion.a
              key={index}
              href={contact.href}
              target={contact.href.startsWith("http") ? "_blank" : undefined}
              rel={contact.href.startsWith("http") ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={isActive ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: contact.delay }}
              className="group flex items-center justify-center"
            >
              <div className="w-20 h-20 rounded-full bg-neutral-800/50 border border-neutral-700 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-neutral-500 hover:bg-neutral-700/50">
                <Icon className="w-8 h-8 text-neutral-400 group-hover:text-white transition-colors" />
              </div>
            </motion.a>
          )
        })}
      </motion.div>
    </div>
  )
}
