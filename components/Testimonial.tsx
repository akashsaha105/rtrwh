'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Star, Quote, Droplets, Users, Award, TrendingUp } from 'lucide-react'

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Bangalore, Karnataka",
    role: "Homeowner",
    image: "👩‍💼",
    rating: 5,
    quote: "The assessment was incredibly accurate! We saved 60% on our water bills in the first year. The AR feature made measuring our rooftop so easy.",
    savings: "₹8,400/year",
    waterSaved: "12,000L/year"
  },
  {
    name: "Rajesh Kumar",
    location: "Chennai, Tamil Nadu",
    role: "Business Owner",
    image: "👨‍💼",
    rating: 5,
    quote: "As a restaurant owner, water costs were killing us. This system paid for itself in 8 months. The expert consultation was worth every rupee.",
    savings: "₹15,600/year",
    waterSaved: "25,000L/year"
  },
  {
    name: "Dr. Anjali Patel",
    location: "Mumbai, Maharashtra",
    role: "Environmental Scientist",
    image: "👩‍🔬",
    rating: 5,
    quote: "Finally, a solution that combines technology with sustainability. The groundwater recharge feature is exactly what our city needs.",
    savings: "₹12,000/year",
    waterSaved: "18,000L/year"
  },
  {
    name: "Vikram Singh",
    location: "Delhi, NCR",
    role: "Architect",
    image: "👨‍🎨",
    rating: 5,
    quote: "I recommend this to all my clients now. The detailed reports help with building approvals and the contractor network is top-notch.",
    savings: "₹10,800/year",
    waterSaved: "15,000L/year"
  }
]

const impactStats = [
  {
    icon: Users,
    number: "10,000+",
    label: "Happy Customers",
    color: "text-[#00b4d8]"
  },
  {
    icon: Droplets,
    number: "50M+",
    label: "Liters Saved",
    color: "text-[#48bb78]"
  },
  {
    icon: TrendingUp,
    number: "₹2.5Cr+",
    label: "Total Savings",
    color: "text-[#0077b6]"
  },
  {
    icon: Award,
    number: "95%",
    label: "Satisfaction Rate",
    color: "text-[#48bb78]"
  }
]

function HandleStories() {
  window.open('https://nexteel.in/stories-of-success-rainwater-harvesting-triumphs-in-various-indian-states/', '_blank');
}


export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#0077b6] rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#48bb78] rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
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
              <Quote className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-[#48bb78] uppercase tracking-wide">
              Success Stories
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-white to-[#48bb78] bg-clip-text text-transparent">
              Real People,
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#00b4d8] to-[#0077b6] bg-clip-text text-transparent">
              Real Results
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join thousands of satisfied customers who have transformed their water management 
            and saved money while protecting the environment.
          </p>
        </motion.div>

        {/* Impact Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {impactStats.map((stat, index) => (
            <div key={index} className="text-center p-6 rounded-2xl glass shadow-glow border border-gray-700/50">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r from-[#0077b6] to-[#00b4d8] flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.number}</div>
              <div className="text-gray-300 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              className="group relative"
            >
              <div className="relative p-8 rounded-3xl glass shadow-glow hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-gray-700/50">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gradient-to-r from-[#48bb78] to-[#0077b6] flex items-center justify-center opacity-20">
                  <Quote className="w-4 h-4 text-white" />
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-gray-300 text-lg leading-relaxed mb-6">
                  &quot;{testimonial.quote}&quot;
                </blockquote>

                {/* Stats */}
                <div className="flex items-center space-x-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#48bb78]">{testimonial.savings}</div>
                    <div className="text-xs text-gray-400">Annual Savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00b4d8]">{testimonial.waterSaved}</div>
                    <div className="text-xs text-gray-400">Water Saved</div>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#0077b6] to-[#00b4d8] flex items-center justify-center text-2xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                    <div className="text-sm text-[#00b4d8]">{testimonial.location}</div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 left-4 w-2 h-2 bg-[#48bb78] rounded-full opacity-60"></div>
                <div className="absolute bottom-4 right-4 w-1 h-1 bg-[#00b4d8] rounded-full opacity-40"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center"
        >
          <div className="p-8 rounded-3xl glass shadow-glow border border-gray-700/50">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Join Our <span className="text-[#48bb78]">Success Stories</span>?
            </h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Start your rainwater harvesting journey today and become part of a community 
              that&apos;s making a real difference for the environment and their wallets.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={()=>window.location.href='Signup'} className="px-8 py-4 bg-gradient-to-r from-[#48bb78] to-[#0077b6] text-white rounded-xl shadow-glow hover:scale-105 transform transition font-semibold text-lg">
                Start Free Assessment
              </button>
              <button onClick={HandleStories} className="px-8 py-4 glass border border-gray-600 text-white rounded-xl hover:scale-105 transform transition font-semibold text-lg">
                View More Stories
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
