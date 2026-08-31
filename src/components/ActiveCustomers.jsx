import React from "react";

const ActiveCustomers = () => {
  const logos = [
    "src/assets/logos/global_greyscale.png",
    "src/assets/logos/gurvansor_greyscale.png",
    "src/assets/logos/niislel_greyscale.png",
    "src/assets/logos/premiumedited1.png",
    "src/assets/logos/prodent-greyscale.png",
  ];

  return (
    <section className="active-customers-section py-12 bg-gray-25">
      <div className="page-container text-center">
        <h3 className="text-h3 mb-12">
          Хамтран ажиллаж буй эмнэлгүүд
        </h3>
        <div className="logo-slider">
          <div className="logo-track">
            {logos.concat(logos).map((logo, index) => (
              <div className="logo-item" key={index}>
                <img src={logo} alt={`logo-${index}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActiveCustomers;
