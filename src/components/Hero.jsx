import { useState } from "react";
import SearchBar from "./SearchBar";
import { motion as Motion } from "framer-motion";
import TrustStats from "./TrustStats";

export default function Hero({ clinicData }) {
  const [clinicTypeRequest, setClinicTypeRequest] = useState(null);

  const handleClinicTypeSelect = (clinicType) => {
    setClinicTypeRequest((current) => ({
      ...clinicType,
      requestId: (current?.requestId ?? 0) + 1,
    }));
  };

  return (
    <section className="hero-refined flex flex-col relative" style={{ minHeight: 'auto', paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div className="page-container relative z-1">
        <div className="-mx-3 flex flex-wrap justify-start text-start min-[992px]:justify-center min-[992px]:text-center">
          <div className="w-full min-w-0 px-3 min-[992px]:w-10/12 min-[1200px]:w-9/12">
            <Motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* 🔹 Punchy Headline (Zocdoc Style) */}
              <h1 className="text-h1 mb-6" >
                Мэргэжлийн эмнэлэгт
                <span className="text-navy-700 " > найдвартай онлайн цаг</span>
              </h1>

              {/* 🔹 Centered Search Focus */}
              <div className="mb-12 mt-4 px-1">
                <SearchBar clinicData={clinicData} clinicTypeRequest={clinicTypeRequest} />
              </div>
              <TrustStats variant="mini" onSelectClinicType={handleClinicTypeSelect} />

            </Motion.div>
          </div>
        </div>
      </div>

      {/* 🔮 Background Decorative Elements */}
      <div className="hero-blobs-container">
        <Motion.div
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="hero-blob blob-1"
        />
        <Motion.div
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="hero-blob blob-2"
        />
      </div>

    </section>
  );
}
