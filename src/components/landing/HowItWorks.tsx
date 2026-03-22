export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Describe your business",
      description: "Enter your business name, services, and pricing.",
    },
    {
      number: "02",
      title: "Upload knowledge",
      description:
        "Drop your price list, FAQ, or any document — PDF, Excel, Word.",
    },
    {
      number: "03",
      title: "Launch your agent",
      description: "Your AI receptionist is live. It answers clients 24/7.",
    },
  ];

  return (
    <section className="py-28 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          How it works
        </h2>
        <p className="text-center text-gray-500 mb-12">
          Three steps. Five minutes. Done.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white p-10 rounded-2xl border border-gray-200"
            >
              <span className="text-4xl font-bold text-gray-200">
                {step.number}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
