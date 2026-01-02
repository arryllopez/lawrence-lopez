"use client"

import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import type { SectionProps } from "../types"
import ContactForm from "./ContactForm"
import { FishingGame } from "./FishingGame"
import GradientButton from "@/components/ui/gradient-button"

export default function Section({
  id,
  title,
  subtitle,
  content,
  isActive,
  showButton,
  buttonText,
  buttonLink,
  projects,
  experiences,
  isContactForm,
  isGame,
}: SectionProps) {
  return (
    <section
      id={id}
      className="relative min-h-screen w-full snap-start flex flex-col justify-center items-center text-center p-4 sm:p-8 md:p-16 lg:p-24"
    >
      {subtitle && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {subtitle}
        </motion.div>
      )}
      <motion.h2
        className="text-3xl sm:text-4xl md:text-6xl lg:text-[5rem] xl:text-[6rem] font-bold leading-[1.1] tracking-tight max-w-4xl"
        initial={{ opacity: 0, y: 50 }}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        {title}
      </motion.h2>
      {content && (
        <motion.p
          className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-2xl mt-4 sm:mt-6 text-neutral-400"
          initial={{ opacity: 0, y: 50 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {content}
        </motion.p>
      )}

      {/* Projects Section - Replace orange with charcoal gray */}
      {projects && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 sm:mt-8 space-y-4 max-w-2xl w-full text-left"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, x: -20 }}
              animate={isActive ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              className="group p-4 border border-neutral-800 rounded-lg hover:border-neutral-500 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-left">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white group-hover:text-neutral-300 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-neutral-400 mt-1 text-sm sm:text-base">{project.slogan}</p>
                </div>
                {project.link && project.link.length > 0 && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-2 rounded-full border border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800 transition-all"
                  >
                    <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-white" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Experience Section - Replace orange with charcoal gray */}
      {experiences && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 sm:mt-8 space-y-4 max-w-2xl w-full text-left"
        >
          {experiences.map((exp, index) => (
            <motion.div
              key={`${exp.company}-${exp.role}`}
              initial={{ opacity: 0, x: -20 }}
              animate={isActive ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              className="border-l-2 border-neutral-600 pl-6"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">{exp.role}</h3>
              <p className="text-neutral-400 mt-1">{exp.company}</p>
              <p className="text-neutral-500 text-sm mt-1">{exp.period}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Contact Form */}
      {isContactForm && <ContactForm isActive={isActive} />}

      {isGame && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 w-full max-w-3xl h-[300px] sm:h-[350px] md:h-[400px] rounded-lg overflow-hidden"
        >
          <FishingGame />
        </motion.div>
      )}

      {showButton && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <GradientButton
            width="180px"
            height="50px"
            onClick={() => {
              if (buttonLink) {
                document.querySelector(buttonLink)?.scrollIntoView({ behavior: "smooth" })
              }
            }}
          >
            {buttonText}
          </GradientButton>
        </motion.div>
      )}
    </section>
  )
}
