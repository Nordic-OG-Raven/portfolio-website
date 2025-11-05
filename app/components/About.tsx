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
              src="/profile.jpg" 
              alt="Jonas Haahr" 
              width={200} 
              height={200} 
              className="rounded-xl shadow-lg object-cover w-48 h-48"
            />
          </div>

          {/* Bio Text */}
          <div className="space-y-4 text-lg text-slate-400 leading-relaxed flex-1">
            <p className="text-xl font-medium text-slate-100 italic">
              "404 error bio not yet found (...) I mean I like Data Science, AI, building stuff, but I still need to work on expressing that eloquently."
            </p>

            <p>
              In the meantime: I am a freshly graduated BI student. I built a portfolio to showcase my determination to apply my skills outside of the classroom too. 
            </p>
          </div>
        </motion.div>

        <div className="space-y-6 text-lg text-slate-400 leading-relaxed">
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <Card hover={false} className="text-center">
              <div className="text-4xl font-bold text-slate-100 mb-2">5+</div>
              <div className="text-sm text-slate-400">Active Projects</div>
            </Card>
            <Card hover={false} className="text-center">
              <div className="text-4xl font-bold text-slate-100 mb-2">AI/ML</div>
              <div className="text-sm text-slate-400">Core Focus</div>
            </Card>
            <Card hover={false} className="text-center">
              <div className="text-4xl font-bold text-slate-100 mb-2">Full-Stack</div>
              <div className="text-sm text-slate-400">Projects</div>
            </Card>
          </div>

          <div className="pt-8">
            <h3 className="text-2xl font-semibold text-slate-100 mb-4">Tech Stack</h3>
            
            <Card hover={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-700">
                      <th className="py-3 px-4 font-semibold text-slate-100 w-1/4">Category</th>
                      <th className="py-3 px-4 font-semibold text-slate-100">Technologies</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-400">
                    <tr className="border-b border-slate-800">
                      <td className="py-3 px-4 font-medium text-slate-100">Programming</td>
                      <td className="py-3 px-4">Python, R, SQL, JavaScript, HTML</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-3 px-4 font-medium text-slate-100">Data Science & AI/ML</td>
                      <td className="py-3 px-4">scikit-learn, TensorFlow, Keras, XGBoost, Transformers, FinBERT, LangChain, RAG, QLoRA, GPT, MLOps</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-3 px-4 font-medium text-slate-100">Data Engineering & Viz</td>
                      <td className="py-3 px-4">Docker, Git, Power BI, Superset, R Shiny, Streamlit</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-3 px-4 font-medium text-slate-100">Cloud & Integration</td>
                      <td className="py-3 px-4">Google Cloud Platform, Microsoft Azure, Power Automate, APIs, Web Scraping</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-3 px-4 font-medium text-slate-100">Databases</td>
                      <td className="py-3 px-4">PostgreSQL, SQLite, ChromaDB, NoSQL, ER Modeling, Dimensional Modeling</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-100">Business Analytics</td>
                      <td className="py-3 px-4">Forecasting, Time Series, Customer Analytics, Marketing Analytics, Strategic Analytics</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Section>
  );
}

