
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { contact } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-brand-light p-8">
        <div className="w-full max-w-lg bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="flex items-center mb-4">
            <contact className="w-6 h-6 text-brand-blue mr-2" />
            <h1 className="text-2xl font-bold">Contact Us</h1>
          </div>
          <p className="mb-8 text-gray-600">Have a question or feedback? Fill in the form below and we'll get back to you soon!</p>
          <form 
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              alert("Thanks for reaching out! We'll get back to you soon.");
            }}
          >
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Your Name</label>
              <input className="w-full border px-4 py-2 rounded" required placeholder="Name" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Email Address</label>
              <input className="w-full border px-4 py-2 rounded" required type="email" placeholder="Email" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Message</label>
              <textarea className="w-full border px-4 py-2 rounded" rows={4} required placeholder="Message"></textarea>
            </div>
            <Button className="w-full bg-brand-blue text-white" type="submit">Send Message</Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
