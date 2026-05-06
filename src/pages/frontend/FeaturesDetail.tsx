import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Bot, Share2, BarChart3, Smartphone, LayoutGrid, Globe, Heart, DollarSign, Users, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeaturesDetail() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-slate-950 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-[10px] tracking-[0.2em] uppercase mb-8"
          >
            <Zap size={14} className="animate-pulse" /> The Ultimate Business Suite
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-[0.95]">
            Everything you need to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 italic">Dominate your Market.</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-3xl mx-auto font-medium leading-relaxed">
            Stop using static links. Our AI-powered smart profiles are designed to capture leads, 
            automate follow-ups, and provide real ROI data for your business.
          </p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 max-w-2xl mx-auto bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 p-6 md:p-8 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4">
                <div className="bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] animate-pulse">Limited Time</div>
             </div>
             <h3 className="text-white text-xl md:text-2xl font-black mb-2 italic">Hurry Up! 1 Month FREE Trial</h3>
             <p className="text-slate-300 text-sm font-medium mb-6">Test the full power of our PRO features without spending a dime. No credit card required, instant activation.</p>
             <Link to="/plans" className="inline-flex h-12 items-center px-8 bg-white text-blue-600 font-black rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]">
                Start Your Pro Trial Now
             </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Bot className="text-blue-500" size={32} />}
            title="AI Virtual Staff"
            desc="Instead of hiring a receptionist for $2,000/mo, use our AI agent. It answers queries, shares pricing, and books appointments 24/7 on your profile."
            benefit="Save up to $24,000 yearly in staffing costs while maintaining 100% response rates."
          />
          <FeatureCard 
            icon={<Zap className="text-amber-500" size={32} />}
            title="Smart Lead Capture"
            desc="An interactive form that pops up when someone visits your profile. It captures name, email, and requirements directly to your CRM."
            benefit="Increase lead conversion by 300% compared to traditional static business cards."
          />
          <FeatureCard 
            icon={<BarChart3 className="text-emerald-500" size={32} />}
            title="Real-time ROI Tracking"
            desc="See exactly who clicked what, where they are from, and which service is most popular on your profile."
            benefit="Make data-driven decisions to optimize your services and marketing spend."
          />
          <FeatureCard 
            icon={<Globe className="text-indigo-500" size={32} />}
            title="Multi-Language Support"
            desc="Serve international clients effortlessly. Your profile translates into multiple languages based on the user's browser settings."
            benefit="Expand your business globally without language barriers."
          />
          <FeatureCard 
            icon={<LayoutGrid className="text-purple-500" size={32} />}
            title="Service Marketplace"
            desc="List your services with images, descriptions, and 'Order Now' buttons that link directly to your WhatsApp or Stripe."
            benefit="Turn your digital profile into a fully functional mini-e-commerce store."
          />
          <FeatureCard 
            icon={<Shield className="text-rose-500" size={32} />}
            title="Enterprise Security"
            desc="End-to-end encryption for your lead data, SOC 2 compliance standards, and private dashboard access."
            benefit="Protect your business data and build trust with luxury clientele."
          />
        </div>
      </section>

      {/* ROICalculator Section */}
      <section className="py-24 bg-slate-50 border-y border-slate-200 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
           <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">The Value Calculator</h2>
             <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">See how much you save by switching to Digital Business Cards</p>
           </div>
           <ROICalculator />
        </div>
      </section>

      {/* AI vs Human Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-slate-950 rounded-[3rem] p-8 md:p-16 border border-slate-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.1),transparent)]"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">AI Staff <br/> <span className="text-blue-600">vs</span> Human Staff</h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed font-medium">
                Traditional sales staff requires salaries, insurance, and they only work 8 hours a day. 
                Our AI Virtual Agent works 24/7, never sleeps, and costs less than a cup of coffee per day.
              </p>
              
              <div className="space-y-6">
                 <ComparisonRow label="Working Hours" human="8 hrs / Day" ai="24/7 / 365" />
                 <ComparisonRow label="Monthly Cost" human="10,000+ AED" ai="70 - 180 AED" />
                 <ComparisonRow label="Response Time" human="15 - 60 mins" ai="< 2 Seconds" />
                 <ComparisonRow label="Lead Capture" human="Manual / Error-prone" ai="Automatic & Precise" />
              </div>

              <div className="mt-12">
                 <Link to="/plans" className="inline-flex h-16 items-center px-10 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20">
                    Get AI Staff Today
                 </Link>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative">
               <div className="absolute -top-4 -right-4 bg-emerald-500 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">98% Savings</div>
               <h3 className="text-2xl font-black text-white mb-8 border-b border-slate-800 pb-4">Yearly Cost Comparison</h3>
               
               <div className="space-y-10">
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Traditional Staff</span>
                      <span className="text-white font-black text-xl">120,000 AED /yr</span>
                    </div>
                    <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden">
                       <div className="bg-slate-600 w-full h-full"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-4 text-blue-500">
                      <span className="font-bold uppercase text-[10px] tracking-widest">DBC AI AGENT</span>
                      <span className="font-black text-xl">1,800 AED /yr</span>
                    </div>
                    <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: '4%' }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          viewport={{ once: true }}
                          className="bg-blue-500 h-full shadow-[0_0_20px_#3b82f6]"
                       ></motion.div>
                    </div>
                  </div>
               </div>
               
               <p className="mt-10 text-slate-500 text-xs font-medium italic border-t border-slate-800 pt-6">
                 *Calculated based on industry average junior sales staff salary vs. Professional DBC AI Plan.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-white text-center">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Ready to upgrade your business?</h2>
        <p className="text-slate-500 max-w-xl mx-auto mb-10 font-medium">Join thousands of professionals who have ditched paper for the future of networking.</p>
        <Link to="/plans" className="inline-flex h-16 items-center px-12 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-sm">
           Choose Your Plan
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc, benefit }: { icon: any, title: string, desc: string, benefit: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-8 rounded-[2rem] border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group"
    >
      <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed mb-6 text-sm">{desc}</p>
      <div className="pt-6 border-t border-slate-50">
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">Key Benefit</span>
        <p className="text-slate-900 font-black text-sm">{benefit}</p>
      </div>
    </motion.div>
  );
}

function ComparisonRow({ label, human, ai }: { label: string, human: string, ai: string }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-4 border-b border-slate-900/50">
       <div className="text-slate-500 font-bold text-xs uppercase tracking-widest self-center">{label}</div>
       <div className="text-slate-400 font-medium text-sm">{human}</div>
       <div className="text-blue-400 font-black text-sm uppercase tracking-tight">{ai}</div>
    </div>
  );
}

function ROICalculator() {
  const [employees, setEmployees] = useState(50);
  const [cardsPerYear, setCardsPerYear] = useState(1);
  const [paperCostTotal, setPaperCostTotal] = useState(200); // Average cost per set of 1000 paper cards in AED

  const totalPaperCost = employees * paperCostTotal;
  const totalDBCCost = employees * 150; // Minimum 150 AED for digital
  const savings = totalPaperCost - totalDBCCost;
  const treesSaved = Math.round((employees * 100) / 200);
  const co2Saved = Math.round(treesSaved * 60);

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-8 md:p-12 bg-slate-50">
           <div className="space-y-12">
             <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <label className="text-sm font-black text-slate-800 uppercase tracking-tight">Number of Employees</label>
                  <span className="text-xl font-black text-blue-600">{employees}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="1000" 
                  step="1"
                  value={employees} 
                  onChange={(e) => setEmployees(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                />
             </div>

             <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <label className="text-sm font-black text-slate-800 uppercase tracking-tight">Paper Card Set Cost (AED)</label>
                  <span className="text-xl font-black text-blue-600">{paperCostTotal} AED</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="1000" 
                  step="10"
                  value={paperCostTotal} 
                  onChange={(e) => setPaperCostTotal(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                />
             </div>

             <div className="p-6 bg-blue-600/5 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                   <Zap size={16} className="text-blue-600" />
                   <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Digital Cost</span>
                </div>
                <div className="text-2xl font-black text-blue-600">150 AED <span className="text-xs text-slate-500 font-bold uppercase">/ Person (One-time)</span></div>
             </div>
           </div>

           <div className="mt-12 p-6 bg-blue-600/5 rounded-2xl border border-blue-100 flex items-start gap-4">
              <Smartphone className="text-blue-600 shrink-0" size={24} />
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                A single paper card costs 0.20 - 0.50 AED, but 1000 cards cost 200-500 AED. With DBC, you pay once per person and update info live anytime without reprints.
              </p>
           </div>
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-between">
           <div className="space-y-8">
              <div className="text-center md:text-left">
                <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Total Estimated Savings</div>
                <div className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
                  {savings > 0 ? savings.toLocaleString() : 0} <span className="text-2xl">AED</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                    <Heart className="text-emerald-500 mb-3" size={20} />
                    <div className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Trees Saved</div>
                    <div className="text-2xl font-black text-emerald-900">{treesSaved} Trees</div>
                 </div>
                 <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                    <Trash2 className="text-blue-500 mb-3" size={20} />
                    <div className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">CO2 Reductions</div>
                    <div className="text-2xl font-black text-blue-900">{co2Saved} Lbs</div>
                 </div>
              </div>
           </div>

           <div className="mt-12 bg-slate-950 p-8 rounded-[2rem] text-white">
              <div className="flex justify-between items-center mb-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital ROI Index</div>
                <div className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Highly Profitable</div>
              </div>
              <p className="text-sm text-slate-300 font-medium leading-relaxed">
                Your investment in Digital Business Cards pays for itself in less than <span className="text-emerald-400 font-black tracking-widest uppercase">3 Months.</span>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
