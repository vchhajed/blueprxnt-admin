import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Sample seed data for initial setup
export const seedData = {
  hero: {
    label: 'BLUEPRXNT PERFORMANCE HEALTH',
    title: "The World's First Performance<br>Health Operating System",
    subtitle: 'Built in elite sport. Engineered for real life. Now available to you.',
    gradientText: 'Transform your health into lasting performance.',
    ctaPrimary: {
      text: 'Apply for Coaching',
      link: '/apply'
    },
    ctaSecondary: {
      text: 'Explore the System',
      link: '/system'
    },
    bottomText: 'No quick fixes. No generic plans. Just a system you can run.'
  },

  about: {
    label: 'ABOUT ME',
    title: "I Didn't Start Healthy. <span class='title-highlight'>I Earned It.</span>",
    intro: "I wasn't always fit, confident, or comfortable in my own body. As a first-generation Indian-American, I grew up overweight, struggling with self-esteem, and constantly comparing myself to others...",
    sections: [
      {
        title: 'Growing Up Indian in America',
        content: 'Sports were my passion, but I rarely saw anyone who looked like me succeed at the highest level...'
      },
      {
        title: 'Lessons from Elite Sport',
        content: 'Working at the highest levels of sport taught me what most people never see...'
      }
    ]
  },

  coaching: {
    title: 'Elite Coaching. Personalized Systems. Proven Results.',
    subtitle: 'Built in the NFL. Engineered for Real Life.',
    packages: [
      {
        name: 'Foundation',
        price: '$2,997',
        duration: '12 weeks',
        description: 'Build your foundation',
        features: [
          'Weekly 1-on-1 coaching calls',
          'Custom nutrition plan',
          'Training program design',
          'Habit tracking system'
        ]
      }
    ]
  },

  footer: {
    description: 'The world\'s first performance health operating system. Built in elite sport. Engineered for real life.',
    links: {
      product: [
        { text: 'The Blueprxnt System', href: '/system' },
        { text: 'Coaching', href: '/coaching' },
        { text: 'About Me', href: '/about' }
      ],
      company: [
        { text: 'Contact', href: '/contact' },
        { text: 'Privacy Policy', href: '/privacy' },
        { text: 'Terms & Conditions', href: '/terms' }
      ]
    },
    social: {
      instagram: 'https://instagram.com/blueprxnt',
      twitter: 'https://twitter.com/blueprxnt',
      linkedin: 'https://linkedin.com/company/blueprxnt'
    },
    copyright: `© ${new Date().getFullYear()} BLUEPRXNT. All rights reserved.`
  }
};
