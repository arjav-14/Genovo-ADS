import { UploadIcon, VideoIcon, ZapIcon } from 'lucide-react';

export const featuresData = [
    {
        icon: <UploadIcon className="w-6 h-6" />,
        title: 'Smart Upload',
        desc: 'Upload any image and our AI will generate a high-quality video in seconds.'
    },
    {
        icon: <ZapIcon className="w-6 h-6" />,
        title: 'Fast Generation',
        desc: 'Our AI generates videos in seconds, not hours.'
    },
    {
        icon: <VideoIcon className="w-6 h-6" />,
        title: 'High Quality Output',
        desc: 'Our AI generates high-quality videos that are ready for social media and marketing.'
    }
];

export const plansData = [
    {
        id: 'starter',
        name: 'Starter',
        price: '$10',
        desc: 'Best for early-stage startups.',
        credits: 25,
        features: [
            '25 AI-generated videos',
            'Basic editing tools',
            'Export to social media formats',
            'Standard support',
            'No watermarks'
        ]
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$29',
        desc: 'Best for growing businesses.',
        credits: 80,
        features: [
            '80 AI-generated videos',
            'Advanced editing tools',
            'Export to all formats',
            'HD output quality',
            'No watermarks'
        ],
        popular: true
    },
    {
        id: 'ultra',
        name: 'Scale',
        price: '$99',
        desc: 'Best for large enterprises.',
        credits: 300,
        features: [
            '300 AI-generated videos',
            'Advanced editing tools',
            'Fast generation times',
            'Ultra HD output quality',
            'No watermarks'
        ]
    }
];

export const faqData = [
    {
        question: 'What services does your agency provide?',
        answer: 'We offer end-to-end digital services including brand strategy, UI/UX design, web and app development and growth-focused marketing solutions.'
    },
    {
        question: 'Do you work with startups or only large companies?',
        answer: 'We work with startups, growing businesses and established brands. Our process is flexible and tailored to match your goals and scale.'
    },
    {
        question: 'How long does a typical project take?',
        answer: 'Project timelines vary by scope, but most projects take between 2–6 weeks. We provide a clear timeline after the discovery phase.'
    },
    {
        question: 'Do you offer ongoing support after launch?',
        answer: 'Yes. We offer maintenance, optimization and growth support packages to ensure your product continues to perform and evolve.'
    }
];

export const footerLinks = [
    {
        title: "Company",
        links: [
            { name: "Home", url: "#" },
            { name: "Services", url: "#" },
            { name: "Work", url: "#" },
            { name: "Contact", url: "#" }
        ]
    },
    {
        title: "Legal",
        links: [
            { name: "Privacy Policy", url: "#" },
            { name: "Terms of Service", url: "#" }
        ]
    },
    {
        title: "Connect",
        links: [
            { name: "Twitter", url: "#" },
            { name: "LinkedIn", url: "#" },
            { name: "GitHub", url: "#" }
        ]
    }
];