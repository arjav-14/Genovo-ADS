import Title from './Title';
import { PricingTable } from '@clerk/clerk-react';

export default function Pricing() {
    return (
        <section id="pricing" className="py-20 bg-white/3 border-t border-white/6">
            <div className="max-w-6xl mx-auto px-4">

                <Title
                    title="Pricing"
                    heading="Flexible agency packages"
                    description="Choose the perfect plan for your needs and budget."
                />

                <div className="max-w-5xl mx-auto">
                    <PricingTable 
                        appearance={{
                            elements: {
                                rootBox: "bg-transparent",
                                backdrop: "bg-black/95",
                                modalContent: "bg-black/95 border border-white/10 rounded-xl",
                                modalTitle: "text-white",
                                modalSubtitle: "text-gray-300",
                                priceText: "text-white",
                                priceDescription: "text-gray-300",
                                planButton: "bg-indigo-600 hover:bg-indigo-700 text-white",
                                planButtonActive: "bg-indigo-500 hover:bg-indigo-600 text-white",
                                planTitle: "text-white",
                                planDescription: "text-gray-300",
                                planFeatures: "text-gray-300",
                                planFeaturesItem: "text-gray-300",
                                planFeaturesItemIcon: "text-indigo-400",
                                planCard: "bg-black/60 backdrop-blur-md border border-white/10 rounded-xl",
                                planCardActive: "bg-indigo-900/30 backdrop-blur-md border border-indigo-500/50 rounded-xl",
                            }
                        }}
                    />
                </div>
            </div>
        </section>
    );
}