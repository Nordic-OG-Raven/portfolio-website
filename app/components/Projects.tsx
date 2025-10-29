const projects = [
  {
    id: 1,
    title: 'CurRag',
    subtitle: 'RAG System for University Notes',
    description: 'A Retrieval-Augmented Generation (RAG) system for querying university lecture notes using LangChain, ChromaDB, and OpenAI. Features semantic search with natural language queries and a Streamlit web interface for exploring your notes.',
    tech: ['Python', 'LangChain', 'ChromaDB', 'OpenAI GPT-4', 'Streamlit', 'LCEL'],
    status: 'Live Demo',
    statusColor: 'bg-green-500',
    link: 'https://currag.nordicravensolutions.com',
    demoNote: 'First visit may take 30-60s to wake up',
  },
  {
    id: 2,
    title: 'CodePractice.AI',
    subtitle: 'Interactive Coding Tutor',
    description: 'A mobile-first web app for practicing Python and SQL with AI-powered feedback and real code execution. Features 5 practice categories (Data Engineering, Analytics Engineering, Data Analysis, Data Science, Custom Topics), intelligent hints, and progress tracking with localStorage persistence.',
    tech: ['React', 'Vite', 'Tailwind CSS', 'Pyodide', 'sql.js', 'Gemini 1.5'],
    status: 'Live Demo',
    statusColor: 'bg-green-500',
    link: 'https://codetutor.jonashaahr.com',
    demoNote: 'Real code execution in browser',
  },
  {
    id: 3,
    title: 'AI News Digest',
    subtitle: 'Multi-Agent News Curation System',
    description: 'Advanced multi-agent system with RAG & ReACT that fetches, filters, and curates AI tech news. Features RAG-based deduplication, ReACT agents with tool use for quality scoring, LangSmith observability, and weekly themed execution (ML Monday, Business Briefing, Ethics Friday, Data Science Saturday).',
    tech: ['Python', 'LangChain', 'RAG', 'ReACT', 'ChromaDB', 'LangSmith', 'Multi-Agent'],
    status: 'Case Study',
    statusColor: 'bg-blue-500',
    link: 'https://ainews.nordicravensolutions.com',
    demoNote: 'Newsletter archive & methodology',
  },
  {
    id: 4,
    title: 'Novo Nordisk Analysis',
    subtitle: 'Financial & Competitive Analysis',
    description: 'Strategic analysis of Novo Nordisk - Denmark\'s pharmaceutical leader and GLP-1 innovator. Features comprehensive financial metrics (profitability, liquidity, leverage, efficiency, growth), peer comparison with 5 competitors, and 5-year trend analysis with interactive visualizations.',
    tech: ['Python', 'yfinance', 'Apache Superset', 'PostgreSQL', 'SQLite', 'Data Viz'],
    status: 'Live Dashboard',
    statusColor: 'bg-green-500',
    link: 'https://analyses.nordicravensolutions.com',
    demoNote: 'Interactive financial dashboard',
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
          Projects
        </h2>
        <p className="text-xl text-secondary text-center mb-16 max-w-2xl mx-auto">
          Interactive demos and case studies showcasing AI/ML applications and data analytics
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-slate-200 dark:border-slate-700"
            >
              {/* Project Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-2xl font-bold text-foreground">{project.title}</h3>
                  <span className={`${project.statusColor} text-white text-xs px-3 py-1 rounded-full font-medium`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-primary font-medium">{project.subtitle}</p>
              </div>

              {/* Project Body */}
              <div className="p-6 space-y-4">
                <p className="text-secondary leading-relaxed">{project.description}</p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-700 text-secondary rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Demo Note */}
                {project.demoNote && (
                  <p className="text-sm text-secondary italic">💡 {project.demoNote}</p>
                )}

                {/* CTA Button */}
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors font-medium w-full justify-center"
                >
                  View Project
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
