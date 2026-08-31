import React from "react";

// ✅ Гол label-г тусдаа компонент болгосон
export default function CalendarLabel({ label }) {
  return (
    <div className="mb-4 text-center">
      <h4 className="text-xl font-bold md:text-2xl">{label}</h4>
    </div>
  );
}
