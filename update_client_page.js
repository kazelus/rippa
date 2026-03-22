const fs = require('fs');
const p = 'app/products/[id]/ProductClient.tsx';
let d = fs.readFileSync(p, 'utf8');

// Normalize line endings to avoid regex cross-platform mismatch
d = d.split('\r\n').join('\n');

// 1. Add state variable
d = d.replace(
  '  const [activeParamTab, setActiveParamTab] = useState(0);',
  '  const [activeParamTab, setActiveParamTab] = useState(0);\n  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);'
);

// 2. Add JSON-LD script compilation
const jsonLdScript = `
  // Generate FAQ Schema
  const faqSchema = model?.faqs && model.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": model.faqs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;
`;

d = d.replace(
  '  const hasVariants =\n    model && model.variantGroups && model.variantGroups.length > 0;',
  jsonLdScript + '\n  const hasVariants =\n    model && model.variantGroups && model.variantGroups.length > 0;'
);

// 3. Inject FAQ Schema into the DOM top
d = d.replace(
  '    <div className="min-h-screen bg-[#0a0d14] text-white selection:bg-[#1b3caf] selection:text-white font-sans overflow-x-hidden relative">',
  '    <div className="min-h-screen bg-[#0a0d14] text-white selection:bg-[#1b3caf] selection:text-white font-sans overflow-x-hidden relative">\n      {faqSchema && (\n        <script\n          type="application/ld+json"\n          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}\n        />\n      )}'
);

// 4. Inject FAQ Section before CTA section
const faqSection = `
        {/* FAQ Section */}
        {model?.faqs && model.faqs.length > 0 && (
          <section className="py-24 bg-[#0a0d14] border-t border-white/10 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Często zadawane pytania
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] mx-auto" />
              </div>
              
              <div className="space-y-4">
                {model.faqs.map((faq: { question: string, answer: string }, index: number) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div 
                      key={index}
                      className={\`bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 \${isOpen ? 'border-[#1b3caf]/50 bg-white/10' : 'hover:border-white/20'}\`}
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none"
                      >
                        <span className="text-lg font-semibold text-white pr-8">{faq.question}</span>
                        <ChevronDown className={\`w-5 h-5 text-[#8b92a9] transition-transform duration-300 flex-shrink-0 \${isOpen ? 'rotate-180 text-[#1b3caf]' : ''}\`} />
                      </button>
                      <div 
                        className={\`transition-all duration-300 ease-in-out \${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}\`}
                      >
                        <div className="px-6 pb-5 text-[#b0b0b0] leading-relaxed whitespace-pre-wrap">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
`;

d = d.replace(
  '        {/* CTA Section */}',
  faqSection + '\n        {/* CTA Section */}'
);

fs.writeFileSync(p, d, 'utf8');
console.log('SUCCESS');
