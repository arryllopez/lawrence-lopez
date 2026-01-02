import { Badge } from "../ui/badge"
import type { Section } from "../../types"

export const sections: Section[] = [
  {
    id: "hero",
    subtitle: (
      <Badge variant="outline" className="text-white border-white/50">
        Software Engineering @ Ontario Tech University
      </Badge>
    ),
    title: "Lawrence Lopez",
    content: "Building thoughtful solutions through code and creativity.",
    showButton: false,
  },
  {
    id: "projects",
    title: "Projects",
    content: "A selection of projects I've been working on.",
    projects: [
      {
        name: "sharpeye.ai",
        slogan: "Clarity in sports outcomes through machine learning.",
        link: "https://github.com/arryllopez/sharpeye.ai",
      },
      {
        name: "letterbox.ai",
        slogan: "From experience to impact — structured cover letters made measurable.",
        link: "https://github.com/arryllopez/letterbox",
      },
    ],
  },
  {
    id: "experience",
    title: "Experience",
    content: "Where I've been making an impact.",
    experiences: [
      {
        role: "Program Activity Leader",
        company: "BGC Durham",
        period: "September 2024 - Present",
      },
      {
        role: "Summer Camp Counsellor",
        company: "STEM CAMP",
        period: "June 2024 - August 2025",
      },
    ],
  },
  {
    id: "contact",
    title: "Get In Touch",
    content: "Have a question or want to work together? Send me a message.",
    isContactForm: true,
  },
]
