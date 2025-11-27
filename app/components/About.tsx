'use client';

import Image from 'next/image';
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
          {/* Profile Photo */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <Image 
              src="/friend-and-i.png" 
              alt="Jonas Haahr" 
              width={200} 
              height={200} 
              className="rounded-xl shadow-lg object-cover w-48 h-48"
            />
          </div>

          {/* Bio Text */}
          <div className="space-y-4 text-lg text-slate-400 leading-relaxed flex-1">
            <p className="text-xl font-medium text-slate-100">
              What started as a way to explore data science and AI outside the classroom has grown into a collection of projects that showcase what can be built when enjoyment and curiosity meet determination.
            </p>

            <p>
              With the goal of continuous learning and fun, during our studies back in april 2024 a friend and I co-founded Nordic Raven Solutions, a data consultancy. Honorary collaborations include Paper Check and my University Dormitory.
            </p>

            <p>
              Since then I have graduated with my Masters in Business Intelligence from Aarhus University (Oct. 2025), and built a portfolio to showcase my determination to apply my skills outside of the classroom too.
            </p>
          </div>
        </motion.div>

        <div className="space-y-6 text-lg text-slate-400 leading-relaxed">
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <Card hover={false} className="text-center">
              <div className="text-4xl font-bold text-slate-100 mb-2">6+</div>
              <div className="text-sm text-slate-400">Active Projects</div>
            </Card>
            <Card hover={false} className="text-center">
              <div className="text-4xl font-bold text-slate-100 mb-2">AI/ML</div>
              <div className="text-sm text-slate-400">Core Focus</div>
            </Card>
            <Card hover={false} className="text-center">
              <div className="text-4xl font-bold text-slate-100 mb-2">Python/SQL</div>
              <div className="text-sm text-slate-400">Core Languages</div>
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
                      <td className="py-3 px-4 font-medium text-slate-100">Generative AI / LLMs</td>
                      <td className="py-3 px-4">LangChain, RAG, ReACT, Gemini 1.5, OpenAI GPT-4, QLoRA (Fine-tuning), Transformers, NLP</td>
                      <td className="py-3 px-4 text-sm">Specializing in cutting-edge Gen-AI and Agentic Systems to unlock new business value and automation.</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-3 px-4 font-medium text-slate-100">ML Engineering / MLOps</td>
                      <td className="py-3 px-4">Docker, Git, FastAPI, LangSmith, Azure, GCP, Railway</td>
                      <td className="py-3 px-4 text-sm">Full-Lifecycle MLOps: Adept at building, deploying, monitoring, and scaling models from proof-of-concept to production.</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-3 px-4 font-medium text-slate-100">Core Data Science / ML</td>
                      <td className="py-3 px-4">Python, scikit-learn, TensorFlow, XGBoost, FinBERT, Classification/Regression</td>
                      <td className="py-3 px-4 text-sm">Core Data Science Competence: Strong foundation in classic and complex models (e.g., XGBoost, FinBERT) for robust predictive analysis.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-100">Data Engineering / BI</td>
                      <td className="py-3 px-4">PostgreSQL, SQL, ETL/ELT, Arelle (XBRL), Apache Superset, Power BI</td>
                      <td className="py-3 px-4 text-sm">End-to-End Data Readiness: Proficient in ETL/ELT, infrastructure, and ensuring the data quality required for reliable DS/ML applications.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile: Card view */}
              <div className="md:hidden space-y-4">
                <div className="border-b border-slate-800 pb-4">
                  <h4 className="font-semibold text-slate-100 mb-2">Generative AI / LLMs</h4>
                  <p className="text-slate-400 text-sm mb-2"><strong className="text-slate-300">Technologies:</strong> LangChain, RAG, ReACT, Gemini 1.5, OpenAI GPT-4, QLoRA (Fine-tuning), Transformers, NLP</p>
                  <p className="text-slate-400 text-sm"><strong className="text-slate-300">What It Means:</strong> Specializing in cutting-edge Gen-AI and Agentic Systems to unlock new business value and automation.</p>
                </div>
                <div className="border-b border-slate-800 pb-4">
                  <h4 className="font-semibold text-slate-100 mb-2">ML Engineering / MLOps</h4>
                  <p className="text-slate-400 text-sm mb-2"><strong className="text-slate-300">Technologies:</strong> Docker, Git, FastAPI, LangSmith, Azure, GCP, Railway</p>
                  <p className="text-slate-400 text-sm"><strong className="text-slate-300">What It Means:</strong> Full-Lifecycle MLOps: Adept at building, deploying, monitoring, and scaling models from proof-of-concept to production.</p>
                </div>
                <div className="border-b border-slate-800 pb-4">
                  <h4 className="font-semibold text-slate-100 mb-2">Core Data Science / ML</h4>
                  <p className="text-slate-400 text-sm mb-2"><strong className="text-slate-300">Technologies:</strong> Python, scikit-learn, TensorFlow, XGBoost, FinBERT, Classification/Regression</p>
                  <p className="text-slate-400 text-sm"><strong className="text-slate-300">What It Means:</strong> Core Data Science Competence: Strong foundation in classic and complex models (e.g., XGBoost, FinBERT) for robust predictive analysis.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-100 mb-2">Data Engineering / BI</h4>
                  <p className="text-slate-400 text-sm mb-2"><strong className="text-slate-300">Technologies:</strong> PostgreSQL, SQL, ETL/ELT, Arelle (XBRL), Apache Superset, Power BI</p>
                  <p className="text-slate-400 text-sm"><strong className="text-slate-300">What It Means:</strong> End-to-End Data Readiness: Proficient in ETL/ELT, infrastructure, and ensuring the data quality required for reliable DS/ML applications.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Section>
  );
}

