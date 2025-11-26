'use client';

import Image from 'next/image';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Section } from './ui/Section';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const projects = [
  {
    id: 0,
    title: 'House Prices Prediction',
    subtitle: 'Real Estate Economics Meets Machine Learning',
    description: 'Achieved top 8.1% performance (rank 476/5,887) in a Kaggle competition by combining hedonic pricing theory with modern ML techniques. Built an 8-model hybrid ensemble with 2-level stacking, demonstrating how domain knowledge guides feature engineering.',
    image: '/kagglecomp.jpg',
    skills: ['Ensemble Learning', 'Feature Engineering', 'scikit-learn', 'XGBoost', 'LightGBM', 'CatBoost', 'Python'],
    status: 'Kaggle Competition',
    statusVariant: 'success' as const,
    link: '/kaggle-house-prices',
  },
  {
    id: 1,
    title: 'CodePractice.AI',
    subtitle: 'Full-Stack AI-Powered Data Tutoring Platform',
    description: 'Built a mobile-first application using Gemini 1.5 to provide intelligent, real-time feedback on user-submitted Python and SQL code. Enables full code execution in the browser without backend dependencies.',
    image: '/codetutor.png',
    skills: ['Gen-AI (Gemini 1.5)', 'NLP', 'React', 'Vite', 'Tailwind CSS', 'Pyodide', 'SQL.js'],
    status: 'Live Demo',
    statusVariant: 'success' as const,
    link: 'https://codetutor.jonashaahr.com',
  },
  {
    id: 2,
    title: 'AI News Digest',
    subtitle: 'Multi-Agent News Curation System',
    description: 'Developed a multi-agent system (ReACT/RAG) for automated, quality-scored curation of AI research news, complete with LangSmith observability. Features RAG-based deduplication, ReACT agents with tool use, and weekly themed execution.',
    image: '/AInews.png',
    skills: ['Multi-Agent Systems', 'RAG', 'ReACT', 'LangChain', 'ChromaDB', 'LangSmith', 'Python'],
    status: 'Case Study',
    statusVariant: 'info' as const,
    link: '/ainews',
  },
  {
    id: 3,
    title: 'FinSight',
    subtitle: 'Business Intelligence & ETL Architecture',
    description: 'Created a robust ETL pipeline that extracts, normalizes, and validates financial facts (XBRL) from thousands of SEC/ESEF filings into a PostgreSQL warehouse. Interactive demo enables analysis of any publicly listed company.',
    image: '/finsight.png',
    skills: ['ETL/ELT', 'Data Modeling', 'PostgreSQL', 'XBRL Parsing (Arelle)', 'Python', 'Flask', 'Next.js', 'Recharts'],
    status: 'In Development',
    statusVariant: 'warning' as const,
    link: '/finsight',
  },
  {
    id: 4,
    title: 'Novo Nordisk Analysis',
    subtitle: 'Financial & Competitive Analysis',
    description: 'Strategic analysis of Novo Nordisk with comprehensive financial metrics, peer comparison, and 5-year trend analysis. Dashboard showcases market positioning, financial fundamentals, R&D efficiency, and innovation returns.',
    image: '/novoanalysis.jpg',
    skills: ['Financial Analysis', 'Data Visualization', 'PostgreSQL', 'Apache Superset', 'Python', 'yfinance'],
    status: 'Portfolio Showcase',
    statusVariant: 'info' as const,
    link: '/novo-nordisk',
  },
  {
    id: 5,
    title: 'CurRag',
    subtitle: 'RAG System for University Notes',
    description: 'Built a Retrieval-Augmented Generation system for querying university lecture notes using LangChain, ChromaDB, and OpenAI. Features semantic search with natural language queries and a Streamlit web interface.',
    image: '/currag.png',
    skills: ['RAG', 'LangChain', 'ChromaDB', 'OpenAI GPT-4', 'LCEL', 'Python', 'Streamlit'],
    status: 'Live Demo',
    statusVariant: 'success' as const,
    link: 'https://knowledgetutor.jonashaahr.com',
  },
];

export default function Projects() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <Section 
      id="projects" 
      title="My Latest Projects"
    >
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
            >
              <Card className="flex flex-col h-full">
                {/* Project Image */}
                <div className="relative w-full h-48 mb-4 overflow-hidden rounded-t-lg">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Project Content */}
                <div className="flex-1 px-4 pb-4">
                  {/* Status Badge */}
                  <div className="mb-3">
                    <Badge variant={project.statusVariant}>{project.status}</Badge>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-100 mb-2">{project.title}</h3>
                  
                  {/* Subtitle */}
                  <p className="text-sm text-purple-700 font-medium mb-3">{project.subtitle}</p>

                  {/* Description */}
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{project.description}</p>

                  {/* Skills & Tech Stack - Combined */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="px-4 pb-4">
                  <a
                    href={project.link}
                    target={project.link.startsWith('http') ? '_blank' : undefined}
                    rel={project.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="block w-full"
                  >
                    <Button variant="primary" className="w-full justify-center">
                      View Project
                    </Button>
                  </a>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
