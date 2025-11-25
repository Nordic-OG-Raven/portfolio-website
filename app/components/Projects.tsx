'use client';

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
    description: 'Kaggle competition solution combining hedonic pricing theory with modern ML. Achieved top-tier performance (CV Log-RMSE: 0.111909) through theory-driven feature engineering, 8-model hybrid ensemble, and disciplined 2-level stacking. Features include spatial equilibrium modeling, diminishing marginal utility transforms, and domain-specific features.',
    tech: ['Python', 'scikit-learn', 'XGBoost', 'LightGBM', 'CatBoost', 'Ensemble Learning', 'Real Estate Economics'],
    status: 'Kaggle Competition',
    statusVariant: 'success' as const,
    link: '/kaggle-house-prices',
    demoNote: 'Top-tier performance with theory-grounded approach',
  },
  {
    id: 1,
    title: 'CodePractice.AI',
    subtitle: 'Full-Stack AI-Powered Data Tutoring Platform',
    description: 'A mobile-first web app for practicing Python and SQL with AI-powered feedback and real code execution. Features 6+ practice categories (Data Engineering, Analytics Engineering, Data Analysis, Data Science, Custom Topics), intelligent hints, and progress tracking with localStorage persistence.',
    tech: ['React', 'Vite', 'Tailwind CSS', 'Pyodide', 'sql.js', 'Gemini 1.5'],
    status: 'Live Demo',
    statusVariant: 'success' as const,
    link: 'https://codetutor.jonashaahr.com',
    demoNote: 'Real code execution in browser',
  },
  {
    id: 2,
    title: 'AI News Digest',
    subtitle: 'Multi-Agent News Curation System',
    description: 'Advanced multi-agent system with RAG & ReACT that fetches, filters, and curates AI tech news. Features RAG-based deduplication, ReACT agents with tool use for quality scoring, LangSmith observability, and weekly themed execution (ML Monday, Business Briefing, Ethics Friday, Data Science Saturday).',
    tech: ['Python', 'LangChain', 'RAG', 'ReACT', 'ChromaDB', 'LangSmith', 'Multi-Agent'],
    status: 'Case Study',
    statusVariant: 'info' as const,
    link: '/ainews',
    demoNote: 'Newsletter archive & methodology',
  },
  {
    id: 3,
    title: 'FinSight',
    subtitle: 'Business Intelligence & ETL Architecture',
    description: 'End-to-end BI architecture with ETL pipeline to extract, prepare, visualize and analyze 10-40 thousand facts per SEC/ESEF filing. Features XBRL parsing with Arelle, normalization across US-GAAP/IFRS taxonomies, accounting identity validation, and PostgreSQL data warehouse. Interactive demo lets you analyze any publicly listed company.',
    tech: ['Python', 'Flask', 'Arelle', 'PostgreSQL', 'Next.js', 'Recharts', 'Railway'],
    status: 'In Development',
    statusVariant: 'warning' as const,
    link: '/finsight',
    demoNote: 'Live ETL demo with quota system',
  },
  {
    id: 4,
    title: 'Novo Nordisk Analysis',
    subtitle: 'Financial & Competitive Analysis',
    description: 'Strategic analysis of Novo Nordisk - Denmark\'s pharmaceutical leader and GLP-1 innovator. Comprehensive financial metrics, peer comparison, and 5-year trend analysis. Dashboard showcases market positioning, financial fundamentals, R&D efficiency, and innovation returns.',
    tech: ['Python', 'yfinance', 'Apache Superset', 'PostgreSQL', 'Data Viz'],
    status: 'Portfolio Showcase',
    statusVariant: 'info' as const,
    link: '/novo-nordisk',
    demoNote: 'Static dashboard showcase',
  },
  {
    id: 5,
    title: 'CurRag',
    subtitle: 'RAG System for University Notes',
    description: 'A Retrieval-Augmented Generation (RAG) system for querying university lecture notes using LangChain, ChromaDB, and OpenAI. Features semantic search with natural language queries and a Streamlit web interface for exploring your notes.',
    tech: ['Python', 'LangChain', 'ChromaDB', 'OpenAI GPT-4', 'Streamlit', 'LCEL'],
    status: 'Live Demo',
    statusVariant: 'success' as const,
    link: 'https://knowledgetutor.jonashaahr.com',
    demoNote: 'First visit may take 30-60s to wake up',
  },
];

export default function Projects() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <Section 
      id="projects" 
      title="Projects"
      subtitle="Interactive demos and case studies showcasing AI/ML applications and data analytics"
    >
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          ref={ref}
          className="grid md:grid-cols-2 gap-8"
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
                {/* Project Header */}
                <div className="border-b border-slate-700 pb-4 mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-2xl font-bold text-slate-100">{project.title}</h3>
                    <Badge variant={project.statusVariant}>{project.status}</Badge>
                  </div>
                  <p className="text-sm text-purple-700 font-medium">{project.subtitle}</p>
                </div>

                {/* Project Body */}
                <div className="flex-1 space-y-4">
                  <p className="text-slate-400 leading-relaxed">{project.description}</p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs px-3 py-1 bg-slate-700 text-slate-300 rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Demo Note */}
                  {project.demoNote && (
                    <p className="text-sm text-slate-500 italic">💡 {project.demoNote}</p>
                  )}
                </div>

                {/* CTA Button */}
                <div className="mt-6">
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
