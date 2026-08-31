// src/components/WhyChooseUsV2.jsx
import { FaClock, FaShieldAlt, FaLaptopMedical, FaUserCheck } from "react-icons/fa";
import { motion } from "framer-motion";

const reasons = [
  { icon: <FaClock size={26} />, title: "24/7 үйлчилгээ", text: "Онлайн цагийн хуваарь үргэлж нээлттэй." },
  { icon: <FaShieldAlt size={26} />, title: "Аюулгүй байдал", text: "Мэдээлэл тань шифрлэлтээр хамгаалагдана." },
  { icon: <FaLaptopMedical size={26} />, title: "Дэвшилтэт систем", text: "AI туслах оношилгоо-дэмжлэгтэй." },
  { icon: <FaUserCheck size={26} />, title: "Хялбар хэрэглээ", text: "3 алхмаар цаг авах энгийн урсгал." },
];

export default function WhyChooseUs() {
  return (
    <div className="w-full px-3 py-12 text-white hp-dark relative">
      <h2 className="text-center text-h2 text-white mb-12">Яагаад биднийг сонгох вэ?</h2>

      {/* connecting line */}
      <div className="absolute start-0 end-0" style={{ top: "58%", height: 2, background: "rgba(255,255,255,0.2)" }} />

      <div className="-mx-3 flex flex-wrap justify-center gap-y-6 text-center">
        {reasons.map((r, i) => (
          <div className="w-full min-w-0 px-3 min-[576px]:w-1/2 md:w-1/4 min-[992px]:w-1/6" key={r.title}>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="hp-glass text-white border-0 rounded-panel p-6"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div className="hp-icon mx-auto mb-4" style={{ background: "rgba(255,255,255,0.15)" }}>
                <span aria-hidden>{r.icon}</span>
              </div>
              <h6 className="mb-2 text-base font-bold leading-tight">{r.title}</h6>
              <p className="text-sm text-slate-50 mb-0">{r.text}</p>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
