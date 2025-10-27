import Image from 'next/image';

export default function About() {
  return (
    <section id="about" className="py-24 px-6 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 text-center">
          About
        </h2>

        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Profile Photo */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <Image 
              src="/profile.jpg" 
              alt="Jonas Haahr" 
              width={200} 
              height={200} 
              className="rounded-lg shadow-lg object-cover w-48 h-48"
            />
          </div>

          {/* Bio Text */}
          <div className="space-y-4 text-lg text-secondary leading-relaxed flex-1">
            <p className="text-xl font-medium text-foreground italic">
              "404 error bio not yet found (...) I mean I like Data Science, AI, building stuff, but I still need to work on expressing that eloquently."
            </p>

            <p>
              In the meantime: I am a freshly graduated BI student. I built a portfolio to showcase my determination to apply my skills outside of the classroom too. 
            </p>

            <p>
              All projects showcased here are fully functional with interactive demos you can try right now.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-lg text-secondary leading-relaxed">

          <div className="grid md:grid-cols-3 gap-8 pt-8">
            <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-primary mb-2">4+</div>
              <div className="text-sm text-secondary">Active Projects</div>
            </div>
            <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-primary mb-2">AI/ML </div>
              <div className="text-sm text-secondary">Core Focus</div>
            </div>
            <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-secondary">Interactive Demos</div>
            </div>
          </div>

          <div className="pt-8">
            <h3 className="text-2xl font-semibold text-foreground mb-4">Tech Stack</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 dark:border-slate-700">
                    <th className="py-3 px-4 font-semibold text-foreground w-1/4">Category</th>
                    <th className="py-3 px-4 font-semibold text-foreground">Technologies</th>
                  </tr>
                </thead>
                <tbody className="text-secondary">
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <td className="py-3 px-4 font-medium text-foreground">Programming</td>
                    <td className="py-3 px-4">Python, R, SQL, JavaScript, HTML</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <td className="py-3 px-4 font-medium text-foreground">Data Science & AI/ML</td>
                    <td className="py-3 px-4">scikit-learn, TensorFlow, Keras, XGBoost, Transformers, FinBERT, LangChain, RAG, QLoRA, GPT, MLOps</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <td className="py-3 px-4 font-medium text-foreground">Data Engineering & Viz</td>
                    <td className="py-3 px-4">Docker, Git, Power BI, Superset, R Shiny, Streamlit</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <td className="py-3 px-4 font-medium text-foreground">Cloud & Integration</td>
                    <td className="py-3 px-4">Google Cloud Platform, Microsoft Azure, Power Automate, APIs, Web Scraping</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <td className="py-3 px-4 font-medium text-foreground">Databases</td>
                    <td className="py-3 px-4">PostgreSQL, SQLite, ChromaDB, NoSQL, ER Modeling, Dimensional Modeling</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-foreground">Business Analytics</td>
                    <td className="py-3 px-4">Forecasting, Time Series, Customer Analytics, Marketing Analytics, Strategic Analytics</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

