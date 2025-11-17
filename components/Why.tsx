'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Droplets, Leaf, Award, TrendingUp, Shield, Users, Globe } from 'lucide-react'

const benefits = [
  {
    icon: DollarSign,
    title: "Save 40-60% Water Bills",
    description: "Significantly reduce your monthly water expenses by harvesting and using rainwater for daily needs.",
    color: "from-[#48bb78] to-[#00b4d8]",
    stat: "40-60%",
    statLabel: "Bill Reduction"
  },
  {
    icon: Droplets,
    title: "Recharge Groundwater Sustainably",
    description: "Help replenish underground water sources and contribute to sustainable water management practices.",
    color: "from-[#00b4d8] to-[#0077b6]",
    stat: "1000+",
    statLabel: "Liters/Year"
  },
  {
    icon: Leaf,
    title: "Reduce Water Scarcity Impact",
    description: "Play your part in addressing water scarcity by becoming self-sufficient in water supply.",
    color: "from-[#0077b6] to-[#48bb78]",
    stat: "50%",
    statLabel: "Less Dependency"
  },
  {
    icon: Award,
    title: "Government Incentives & Eco-Certifications",
    description: "Qualify for government rebates, tax benefits, and eco-friendly certifications for your property.",
    color: "from-[#48bb78] to-[#0077b6]",
    stat: "₹50K+",
    statLabel: "Incentives"
  }
]

const additionalBenefits = [
  {
    icon: TrendingUp,
    title: "Increase Property Value",
    description: "Properties with rainwater harvesting systems have 15-20% higher market value."
  },
  {
    icon: Shield,
    title: "Water Security",
    description: "Ensure water availability during droughts and water supply disruptions."
  },
  {
    icon: Users,
    title: "Community Impact",
    description: "Contribute to community water conservation efforts and set an example for others."
  },
  {
    icon: Globe,
    title: "Environmental Protection",
    description: "Reduce stormwater runoff and prevent soil erosion in your area."
  }
]


export default function Why({}) {
  return (
    <section id="why" className="py-20 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#48bb78] rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#0077b6] rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-[#48bb78] to-[#0077b6]">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-[#48bb78] uppercase tracking-wide">
              Why Choose Rainwater Harvesting
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-white to-[#48bb78] bg-clip-text text-transparent">
              Benefits That Matter
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#00b4d8] to-[#0077b6] bg-clip-text text-transparent">
              For You & The Planet
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Rainwater harvesting isn&apos;t just about saving money—it&apos;s about creating a sustainable future 
            for yourself, your community, and the environment.
          </p>
        </motion.div>

        {/* Main Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              className="group relative"
            >
              <div className="relative p-8 rounded-3xl glass shadow-glow hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-gray-700/50">
                {/* Background Gradient */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${benefit.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon & Stat */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${benefit.color} flex items-center justify-center shadow-glow`}>
                      <benefit.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-[#48bb78]">{benefit.stat}</div>
                      <div className="text-sm text-gray-400">{benefit.statLabel}</div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#48bb78] transition-colors">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-[#48bb78] rounded-full opacity-60"></div>
                <div className="absolute bottom-4 left-4 w-1 h-1 bg-[#00b4d8] rounded-full opacity-40"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-center text-white mb-12">
            Additional <span className="text-[#48bb78]">Benefits</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="p-6 rounded-2xl glass shadow-glow border border-gray-700/50 hover:scale-105 transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#0077b6] to-[#00b4d8] flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{benefit.title}</h4>
                <p className="text-sm text-gray-300">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Impact Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center"
        >
          <div className="p-8 rounded-3xl glass shadow-glow border border-gray-700/50">
            <h3 className="text-2xl font-bold text-white mb-6">
              Join the <span className="text-[#48bb78]">Water Revolution</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#48bb78] mb-2">10,000+</div>
                <div className="text-gray-300">Homes Transformed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#00b4d8] mb-2">50M+</div>
                <div className="text-gray-300">Liters Saved</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#0077b6] mb-2">95%</div>
                <div className="text-gray-300">Customer Satisfaction</div>
              </div>
            </div>
            
            <div className="mt-8">
              <button onClick={()=>window.location.href='Signup'} className="px-8 py-4 bg-gradient-to-r from-[#48bb78] to-[#0077b6] text-white rounded-xl shadow-glow hover:scale-105 transform transition font-semibold text-lg">
                Start Your Water Journey Today
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
