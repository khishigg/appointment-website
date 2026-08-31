// src/components/DoctorsStatsV2.jsx
import CountUp from "react-countup";
import { motion } from "framer-motion";

export default function DoctorsStats() {
  return (
    <div className="page-container py-12 text-center">
      <motion.div
        className="hp-glass rounded-panel py-12 px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.45 }}
      >
        <h3 className="text-h3 mb-2">
          <CountUp end={250} duration={2.5} suffix="+" /> эмч &nbsp;·&nbsp;
          <CountUp end={50} duration={2.2} suffix="+" /> эмнэлэг &nbsp;·&nbsp;
          <CountUp end={1200} duration={2.8} suffix="+" /> амжилттай захиалга
        </h3>
        <p className="text-legacy-body text-gray-500 mb-0">Live data update-тайгаар итгэлийг нэмэгдүүлнэ.</p>
      </motion.div>
    </div>
  );
}
