export function Features() {
  const features = [
    {
      icon: "⚡",
      title: "2-second response",
      description: "Clients get instant answers. No waiting, no missed leads.",
    },
    {
      icon: "🌙",
      title: "24/7 availability",
      description:
        "Works nights, weekends, and holidays. Never calls in sick.",
    },
    {
      icon: "📈",
      title: "Smart upselling",
      description:
        "Suggests complementary services to increase your average ticket.",
    },
    {
      icon: "🔔",
      title: "Appointment reminders",
      description:
        "Automatic reminders 24h and 2h before. Reduces no-shows by 60%.",
    },
    {
      icon: "🎯",
      title: "Lead scoring",
      description:
        "Automatically tags leads as hot, warm, or cold. Focus on what matters.",
    },
    {
      icon: "🤝",
      title: "Human handoff",
      description:
        "Seamlessly transfers to a real person when needed. No dead ends.",
    },
  ];

  return (
    <section className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Everything your receptionist does — minus the salary
        </h2>
        <p className="text-center text-gray-500 mb-12">
          A $3,000/month receptionist vs a $150/month AI that works 3x harder.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <span className="text-2xl">{f.icon}</span>
              <h3 className="text-base font-semibold text-gray-900 mt-3 mb-1">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
