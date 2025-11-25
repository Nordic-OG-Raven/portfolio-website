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
    headline: 'House Prices Prediction: Core Data Science / ML (Kaggle Competition)',
    focus: 'Core Data Science / ML. Achieved top 8.1% performance (rank 476/5,887) in a Kaggle competition by combining hedonic pricing theory with modern ML techniques. Built an 8-model hybrid ensemble with 2-level stacking, demonstrating how domain knowledge guides feature engineering and reduces trial-and-error.',
    keySkills: ['Ensemble Learning', 'Feature Engineering', 'scikit-learn', 'XGBoost', 'LightGBM', 'CatBoost'],
    fullStackTools: {
      'ML/AI': ['scikit-learn', 'XGBoost', 'LightGBM', 'CatBoost', 'Ensemble Learning'],
      'Back-end': ['Python'],
    },
    status: 'Kaggle Competition',
    statusVariant: 'success' as const,
    link: '/kaggle-house-prices',
    demoNote: 'Top-tier performance with theory-grounded approach',
  },
  {
    id: 1,
    title: 'CodePractice.AI',
    subtitle: 'Full-Stack AI-Powered Data Tutoring Platform',
    headline: 'CodePractice.AI: Generative AI / Browser-Native ML (Live Demo)',
    focus: 'Generative AI / Browser-Native ML. Built a mobile-first application using Gemini 1.5 to provide intelligent, real-time feedback on user-submitted Python and SQL code. Enables full code execution in the browser without backend dependencies.',
    keySkills: ['Gen-AI (Gemini 1.5)', 'NLP', 'Data Execution in Browser'],
    fullStackTools: {
      'ML/AI': ['Gemini 1.5'],
      'Back-end': ['Python', 'Pyodide', 'SQL.js'],
      'Front-end': ['React', 'Vite', 'Tailwind CSS'],
    },
    status: 'Live Demo',
    statusVariant: 'success' as const,
    link: 'https://codetutor.jonashaahr.com',
    demoNote: 'Real code execution in browser',
  },
  {
    id: 2,
    title: 'AI News Digest',
    subtitle: 'Multi-Agent News Curation System',
    headline: 'AI News Digest: Advanced LLM Orchestration / MLOps (Case Study)',
    focus: 'Advanced LLM Orchestration / MLOps. Developed a multi-agent system (ReACT/RAG) for automated, quality-scored curation of AI research news, complete with LangSmith observability. Features RAG-based deduplication, ReACT agents with tool use, and weekly themed execution.',
    keySkills: ['Multi-Agent Systems', 'RAG', 'ReACT', 'LangChain', 'MLOps/Observability (LangSmith)'],
    fullStackTools: {
      'ML/AI': ['LangChain', 'RAG', 'ReACT', 'ChromaDB'],
      'Back-end': ['Python'],
    },
    status: 'Case Study',
    statusVariant: 'info' as const,
    link: '/ainews',
    demoNote: 'Newsletter archive & methodology',
  },
  {
    id: 3,
    title: 'FinSight',
    subtitle: 'Business Intelligence & ETL Architecture',
    headline: 'FinSight: Data Engineering / Business Intelligence (In Development)',
    focus: 'Data Engineering / Business Intelligence. Created a robust ETL pipeline that extracts, normalizes, and validates financial facts (XBRL) from thousands of SEC/ESEF filings into a PostgreSQL warehouse. Interactive demo enables analysis of any publicly listed company.',
    keySkills: ['ETL/ELT', 'Data Modeling', 'PostgreSQL', 'XBRL Parsing (Arelle)'],
    fullStackTools: {
      'Back-end': ['Python', 'Flask', 'Arelle', 'PostgreSQL'],
      'Front-end': ['Next.js', 'Recharts'],
      'Deployment': ['Railway'],
    },
    status: 'In Development',
    statusVariant: 'warning' as const,
    link: '/finsight',
    demoNote: 'Live ETL demo with quota system',
  },
  {
    id: 4,
    title: 'Novo Nordisk Analysis',
    subtitle: 'Financial & Competitive Analysis',
    headline: 'Novo Nordisk Analysis: Business Intelligence / Data Visualization (Portfolio Showcase)',
    focus: 'Business Intelligence / Data Visualization. Strategic analysis of Novo Nordisk with comprehensive financial metrics, peer comparison, and 5-year trend analysis. Dashboard showcases market positioning, financial fundamentals, R&D efficiency, and innovation returns.',
    keySkills: ['Financial Analysis', 'Data Visualization', 'PostgreSQL', 'Business Intelligence'],
    fullStackTools: {
      'Back-end': ['Python', 'yfinance', 'PostgreSQL'],
      'Data Viz': ['Apache Superset'],
    },
    status: 'Portfolio Showcase',
    statusVariant: 'info' as const,
    link: '/novo-nordisk',
    demoNote: 'Static dashboard showcase',
  },
  {
    id: 5,
    title: 'CurRag',
    subtitle: 'RAG System for University Notes',
    headline: 'CurRag: RAG / Retrieval Systems (Live Demo)',
    focus: 'RAG / Retrieval Systems. Built a Retrieval-Augmented Generation system for querying university lecture notes using LangChain, ChromaDB, and OpenAI. Features semantic search with natural language queries and a Streamlit web interface.',
    keySkills: ['RAG', 'LangChain', 'ChromaDB', 'OpenAI GPT-4'],
    fullStackTools: {
      'ML/AI': ['LangChain', 'ChromaDB', 'OpenAI GPT-4', 'LCEL'],
      'Back-end': ['Python'],
      'Front-end': ['Streamlit'],
    },
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
                  <p className="text-sm text-purple-700 font-medium mb-2">{project.subtitle}</p>
                  <p className="text-xs text-slate-500 italic">{project.headline}</p>
                </div>

                {/* Project Body */}
                <div className="flex-1 space-y-4">
                  {/* Focus - What hiring manager sees first */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 mb-2">Focus</h4>
                    <p className="text-slate-400 leading-relaxed text-sm">{project.focus}</p>
                  </div>

                  {/* Key Skills */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 mb-2">Key Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.keySkills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-2 py-1 bg-purple-900/30 text-purple-300 rounded-md border border-purple-700/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Full Stack Tools */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 mb-2">Tech Stack</h4>
                    <div className="space-y-2">
                      {Object.entries(project.fullStackTools).map(([category, tools]) => (
                        <div key={category}>
                          <span className="text-xs font-medium text-slate-300">{category}:</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {tools.map((tool: string) => (
                              <span
                                key={tool}
                                className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
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
