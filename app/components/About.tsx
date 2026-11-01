'use client';

import { Card } from './ui/Card';
import { Section } from './ui/Section';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { motion } from 'framer-motion';

export default function About() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <Section id="about" title="About">
      <div className="container mx-auto max-w-4xl">
        <motion.div 
          ref={ref}
          className="flex flex-col md:flex-row gap-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Bio Text */}
          <div className="space-y-4 text-lg text-slate-400 leading-relaxed flex-1">
            <p className="text-xl font-medium text-slate-100">
              I like turning messy data into something a business can actually act on. What started as a way to explore that outside the classroom has grown into a collection of projects spanning data engineering, BI, analytics, and a bit of AI.
            </p>

            <p>
              Back in April 2024, during our studies, a friend and I started Nordic Raven Solutions, a small side practice we use to take on real data work and keep learning. Collaborations so far include Paper Check and my University Dormitory (yes, really).
            </p>

            <p>
              Since then I have graduated with my MSc in Business Intelligence from Aarhus University (Nov. 2025), and kept building this portfolio to show what I can do with those skills beyond coursework.
            </p>
          </div>
        </motion.div>

        <div className="space-y-6 text-lg text-slate-400 leading-relaxed">
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <Card hover={false} className="text-center">
              <div className="text-4xl font-bold text-slate-100 mb-2">MSc</div>
              <div className="text-sm text-slate-400">Business Intelligence, Aarhus University</div>
            </Card>
            <Card hover={false} className="text-center">
              <div className="text-2xl font-bold text-slate-100 mb-2">Data Eng · BI · Analytics</div>
              <div className="text-sm text-slate-400">Where I work, with AI in the mix</div>
            </Card>
            <Card hover={false} className="text-center">
              <div className="text-2xl font-bold text-slate-100 mb-2">DA · EN · DE</div>
              <div className="text-sm text-slate-400">Danish · English · German</div>
            </Card>
          </div>

          <div className="pt-8">
            <h3 className="text-2xl font-semibold text-slate-100 mb-4">What I love doing</h3>
            
            <Card hover={false}>
              {/* Desktop: Table view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-700">
                      <th className="py-3 px-4 font-semibold text-slate-100 w-1/4">Category</th>
                      <th className="py-3 px-4 font-semibold text-slate-100 w-2/5">Technologies</th>
                      <th className="py-3 px-4 font-semibold text-slate-100">What It Means</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-400">
                    <tr className="border-b border-slate-800">
                      <td className="py-3 px-4 font-medium text-slate-100">Data Engineering / BI</td>
                      <td className="py-3 px-4">SQL, PostgreSQL, ETL/ELT, Azure, Microsoft Fabric, Power BI, Apache Superset, Arelle (XBRL)</td>
                      <td className="py-3 px-4 text-sm">My home base: getting data modeled, cleaned, and trustworthy, then into dashboards people actually use to make decisions.</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-3 px-4 font-medium text-slate-100">Analytics & Modeling</td>
                      <td className="py-3 px-4">Python, scikit-learn, XGBoost, LightGBM, Classification/Regression, Forecasting</td>
                      <td className="py-3 px-4 text-sm">Comfortable pairing domain knowledge with practical models to answer real business questions, not modeling for its own sake.</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-3 px-4 font-medium text-slate-100">Generative AI / LLMs</td>
                      <td className="py-3 px-4">LangChain, RAG, ReACT, OpenAI, Gemini, Transformers, NLP</td>
                      <td className="py-3 px-4 text-sm">Build LLM/RAG and agentic tools where they add value. I've used them in real projects and at work, as one tool among many.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-100">Tooling & Deployment</td>
                      <td className="py-3 px-4">Docker, Git, FastAPI, Streamlit, Next.js, GCP, Railway</td>
                      <td className="py-3 px-4 text-sm">Can take a project from notebook to something deployed and usable: the glue that turns analysis into a working tool.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile: Card view */}
              <div className="md:hidden space-y-4">
                <div className="border-b border-slate-800 pb-4">
                  <h4 className="font-semibold text-slate-100 mb-2">Data Engineering / BI</h4>
                  <p className="text-slate-400 text-sm mb-2"><strong className="text-slate-300">Technologies:</strong> SQL, PostgreSQL, ETL/ELT, Azure, Microsoft Fabric, Power BI, Apache Superset, Arelle (XBRL)</p>
                  <p className="text-slate-400 text-sm"><strong className="text-slate-300">What It Means:</strong> My home base: getting data modeled, cleaned, and trustworthy, then into dashboards people actually use to make decisions.</p>
                </div>
                <div className="border-b border-slate-800 pb-4">
                  <h4 className="font-semibold text-slate-100 mb-2">Analytics & Modeling</h4>
                  <p className="text-slate-400 text-sm mb-2"><strong className="text-slate-300">Technologies:</strong> Python, scikit-learn, XGBoost, LightGBM, Classification/Regression, Forecasting</p>
                  <p className="text-slate-400 text-sm"><strong className="text-slate-300">What It Means:</strong> Comfortable pairing domain knowledge with practical models to answer real business questions, not modeling for its own sake.</p>
                </div>
                <div className="border-b border-slate-800 pb-4">
                  <h4 className="font-semibold text-slate-100 mb-2">Generative AI / LLMs</h4>
                  <p className="text-slate-400 text-sm mb-2"><strong className="text-slate-300">Technologies:</strong> LangChain, RAG, ReACT, OpenAI, Gemini, Transformers, NLP</p>
                  <p className="text-slate-400 text-sm"><strong className="text-slate-300">What It Means:</strong> Build LLM/RAG and agentic tools where they add value. I've used them in real projects and at work, as one tool among many.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-100 mb-2">Tooling & Deployment</h4>
                  <p className="text-slate-400 text-sm mb-2"><strong className="text-slate-300">Technologies:</strong> Docker, Git, FastAPI, Streamlit, Next.js, GCP, Railway</p>
                  <p className="text-slate-400 text-sm"><strong className="text-slate-300">What It Means:</strong> Can take a project from notebook to something deployed and usable: the glue that turns analysis into a working tool.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Section>
  );
}

