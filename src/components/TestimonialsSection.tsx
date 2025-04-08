
import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "HandleHunter helped me secure my brand name across all major platforms. The real-time monitoring is a game-changer!",
    name: "Sarah Johnson",
    title: "Marketing Director",
    rating: 5
  },
  {
    quote: "I was able to snag my preferred username the moment it became available thanks to the instant notifications.",
    name: "Michael Chen",
    title: "Content Creator",
    rating: 5
  },
  {
    quote: "As a business owner, protecting our brand online is crucial. This tool made it effortless to monitor and secure our social handles.",
    name: "Jessica Williams",
    title: "Small Business Owner",
    rating: 4
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what people who use HandleHunter have to say.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-gray-50 border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-gray-600 text-sm">{testimonial.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
