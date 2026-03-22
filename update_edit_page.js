const fs = require('fs');
const p = 'app/admin/models/[id]/edit/page.tsx';
let d = fs.readFileSync(p, 'utf8');
d = d.split('\r\n').join('\n'); // normalize to LF

d = d.replace(
  '      variantGroups,\n      activeTab,\n    };\n    try {\n      localStorage.setItem(storageKey, JSON.stringify(draft));\n    } catch (err) {}\n  }, [modelId, isLoading, formData, images, heroImageId, sections, downloads, featureValues, parameterValues, variantGroups, activeTab]);',
  '      variantGroups,\n      faqs,\n      activeTab,\n    };\n    try {\n      localStorage.setItem(storageKey, JSON.stringify(draft));\n    } catch (err) {}\n  }, [modelId, isLoading, formData, images, heroImageId, sections, downloads, featureValues, parameterValues, variantGroups, faqs, activeTab]);'
);

d = d.replace(
  '  // Accessories state (linked model IDs)\n  const [linkedAccessoryIds, setLinkedAccessoryIds] = useState<string[]>([]);\n  const [allModels, setAllModels] = useState<\n    Array<{ id: string; name: string; imageUrl?: string | null }>\n  >([]);\n  const [accessorySearch, setAccessorySearch] = useState("");',
  '  // Accessories state (linked model IDs)\n  const [linkedAccessoryIds, setLinkedAccessoryIds] = useState<string[]>([]);\n  const [allModels, setAllModels] = useState<\n    Array<{ id: string; name: string; imageUrl?: string | null; category?: any }>\n  >([]);\n  const [accessorySearch, setAccessorySearch] = useState("");\n  const [accessoryFilter, setAccessoryFilter] = useState<"machines" | "accessories" | "all">("machines");\n\n  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);\n\n  const ACCESSORY_KEYWORDS = ["akcesor", "accessori", "accessory"];\n  const isAccessory = (model: any) => {\n    const cat = model.category;\n    if (!cat) return false;\n    const haystack = `${cat.name ?? ""} ${cat.slug ?? ""}`.toLowerCase();\n    return ACCESSORY_KEYWORDS.some((kw) => haystack.includes(kw));\n  };'
);

d = d.replace(
  '    { id: 4, name: "Pliki" },\n    { id: 5, name: "Warianty" },\n    { id: 6, name: "Akcesoria" },\n  ];',
  '    { id: 4, name: "Pliki" },\n    { id: 5, name: "Warianty" },\n    { id: 6, name: "Akcesoria" },\n    { id: 7, name: "FAQ" },\n  ];'
);

d = d.replace(
  '      setDownloads(draft?.downloads ?? data.downloads ?? []);',
  '      setDownloads(draft?.downloads ?? data.downloads ?? []);\n      setFaqs(draft?.faqs ?? data.faqs ?? []);'
);

d = d.replace(
  '                imageUrl: m.images?.[0]?.url || null,\n              })),\n          );',
  '                imageUrl: m.images?.[0]?.url || null,\n                category: m.category,\n              })),\n          );'
);

d = d.replace(
  '          parameters: Object.keys(parameterValues).map((k) => ({\n            parameterId: k,\n            value: parameterValues[k],\n          })),\n        }),',
  '          parameters: Object.keys(parameterValues).map((k) => ({\n            parameterId: k,\n            value: parameterValues[k],\n          })),\n          faqs,\n        }),'
);

// Tab 6 and 7 replacements:
d = d.replace(
  `                  {/* Search */}\n                  <div className="mb-6">\n                    <input\n                      type="text"\n                      placeholder="Szukaj modelu..."\n                      value={accessorySearch}\n                      onChange={(e) => setAccessorySearch(e.target.value)}\n                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#8b92a9] focus:outline-none focus:ring-2 focus:ring-[#1b3caf]"\n                    />\n                  </div>`,
  `                  {/* Search and Filter */}\n                  <div className="mb-6 flex gap-4">\n                    <input\n                      type="text"\n                      placeholder="Szukaj modelu..."\n                      value={accessorySearch}\n                      onChange={(e) => setAccessorySearch(e.target.value)}\n                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#8b92a9] focus:outline-none focus:ring-2 focus:ring-[#1b3caf]"\n                    />\n                    <select\n                      value={accessoryFilter}\n                      onChange={(e) => setAccessoryFilter(e.target.value as "machines" | "accessories" | "all")}\n                      className="px-4 py-3 bg-[#0f1419] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1b3caf]"\n                    >\n                      <option value="machines">Główne (bez akcesoriów)</option>\n                      <option value="accessories">Tylko akcesoria</option>\n                      <option value="all">Wszystkie</option>\n                    </select>\n                  </div>`
);

d = d.replace(
  '                              <span className="text-white text-sm font-medium flex-1 truncate">\n                                {m.name}\n                              </span>',
  '                              <span className="text-white text-sm font-medium flex-1 break-words text-wrap">\n                                {m.name}\n                              </span>'
);

d = d.replace(
  '                      .filter(\n                        (m) =>\n                          !linkedAccessoryIds.includes(m.id) &&\n                          m.name\n                            .toLowerCase()\n                            .includes(accessorySearch.toLowerCase()),\n                      )',
  '                      .filter((m) => {\n                        if (linkedAccessoryIds.includes(m.id)) return false;\n                        if (!m.name.toLowerCase().includes(accessorySearch.toLowerCase())) return false;\n                        if (accessoryFilter === "machines" && isAccessory(m)) return false;\n                        if (accessoryFilter === "accessories" && !isAccessory(m)) return false;\n                        return true;\n                      })'
);

d = d.replace(
  '                          <span className="text-[#b0b0b0] text-sm font-medium flex-1 truncate">\n                            {m.name}\n                          </span>',
  '                          <span className="text-[#b0b0b0] text-sm font-medium flex-1 break-words text-wrap">\n                            {m.name}\n                          </span>'
);

d = d.replace(
  '                    {allModels.filter(\n                      (m) =>\n                        !linkedAccessoryIds.includes(m.id) &&\n                        m.name\n                          .toLowerCase()\n                          .includes(accessorySearch.toLowerCase()),\n                    ).length === 0 && (',
  '                    {allModels.filter((m) => {\n                      if (linkedAccessoryIds.includes(m.id)) return false;\n                      if (!m.name.toLowerCase().includes(accessorySearch.toLowerCase())) return false;\n                      if (accessoryFilter === "machines" && isAccessory(m)) return false;\n                      if (accessoryFilter === "accessories" && !isAccessory(m)) return false;\n                      return true;\n                    }).length === 0 && ('
);

const tab7 = `              )}

              {/* Tab 7: FAQ */}
              {activeTab === 7 && (
                <div className="p-6 animate-fadeIn">
                  <h3 className="text-xl font-semibold text-white mb-6">Pytania i Odpowiedzi (FAQ)</h3>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-lg flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-white font-medium">Pytanie #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => setFaqs(prev => prev.filter((_, i) => i !== index))}
                            className="text-red-400 hover:text-red-300 text-sm focus:outline-none"
                          >
                            Usuń
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Treść pytania..."
                          value={faq.question}
                          onChange={(e) => setFaqs(prev => prev.map((f, i) => i === index ? { ...f, question: e.target.value } : f))}
                          className="w-full px-4 py-2 bg-[#0f1419] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1b3caf]"
                        />
                        <textarea
                          placeholder="Odpowiedź..."
                          value={faq.answer}
                          onChange={(e) => setFaqs(prev => prev.map((f, i) => i === index ? { ...f, answer: e.target.value } : f))}
                          rows={3}
                          className="w-full px-4 py-2 bg-[#0f1419] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1b3caf]"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFaqs(prev => [...prev, { question: "", answer: "" }])}
                      className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition focus:outline-none"
                    >
                      + Dodaj kolejne pytanie
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation buttons - always visible */}`;

d = d.replace(
  '              )}\n\n              {/* Navigation buttons - always visible */',
  tab7.replace('Navigation buttons - always visible */', 'Navigation buttons - always visible */')
);

fs.writeFileSync(p, d, 'utf8');
console.log('SUCCESS');
