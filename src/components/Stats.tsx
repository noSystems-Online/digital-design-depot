
const Stats = () => {
  const stats = [
    { number: "10,000+", label: "Happy Customers" },
    { number: "1,500+", label: "Digital Products" },
    { number: "50+", label: "Expert Sellers" },
    { number: "99.9%", label: "Uptime" }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-blue-100 text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
