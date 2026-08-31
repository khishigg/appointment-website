import { motion } from "framer-motion";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

const doctors = [
  { id: 1, name: "Др. Алтанцэцэг", spec: "Шүдний эмч", img: "/doctors/doc1.jpg", rating: 4.9, reviews: 230, time: "Өнөөдөр 15:30" },
  { id: 2, name: "Др. Мөнх-Эрдэнэ", spec: "Мэдрэлийн эмч", img: "/doctors/doc2.jpg", rating: 4.8, reviews: 180, time: "Маргааш 09:00" },
  { id: 3, name: "Др. Энхжаргал", spec: "Дотор эмч", img: "/doctors/doc3.jpg", rating: 4.9, reviews: 205, time: "Өнөөдөр 17:00" },
];

export default function ExpertsSection() {
  return (
    <section className="py-12 bg-white">
      <div className="page-container">
        <div className="text-center mb-12">
          <motion.h2
            className="text-h2 mb-2"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Манай мэргэжилтнүүд
          </motion.h2>
          <motion.p
            className="text-legacy-body text-gray-600 mx-auto max-w-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            250+ туршлагатай эмч, сувилагч таны эрүүл мэндэд тусална.
          </motion.p>
        </div>

        <div className="-mx-3 flex flex-wrap justify-center gap-y-6">
          {doctors.map((doc, i) => (
            <div className="w-full min-w-0 px-3 min-[576px]:w-10/12 md:w-1/2 min-[992px]:w-1/3" key={doc.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card variant="default" className="h-full flex flex-col text-center p-6">
                  {/* 📷 Doctor Portrait */}
                  <div className="relative inline-block mx-auto mb-4">
                    <img
                      src={doc.img}
                      alt={doc.name}
                      className="rounded-full shadow-sm"
                      style={{ width: 100, height: 100, objectFit: "cover", border: '3px solid var(--primary-50)' }}
                    />
                    <div className="absolute bottom-0 end-0 bg-success-500 border border-white rounded-full" style={{ width: 14, height: 14 }} title="Online"></div>
                  </div>

                  {/* 📝 Doctor Info */}
                  <div className="mb-4">
                    <h3 className="text-h3 mb-1">{doc.name}</h3>
                    <p className="text-legacy-body-sm text-gray-500 mb-2">{doc.spec}</p>

                    <div className="flex justify-center items-center gap-2">
                      <Badge variant="primary" size="sm">
                        <span className="text-warning-500 me-1">★</span> {doc.rating} ({doc.reviews})
                      </Badge>
                    </div>
                  </div>

                  {/* ⏰ Availability */}
                  <div className="mt-auto pt-6 border-t border-gray-100 mb-6">
                    <div className="flex justify-between items-center">
                      <div className="text-start">
                        <span className="text-body-xs block text-gray-400">Боломжит цаг:</span>
                        <span className="text-legacy-body-sm font-bold text-navy-900">{doc.time}</span>
                      </div>
                      <Badge variant="success" size="sm">Нээлттэй</Badge>
                    </div>
                  </div>

                  <Button variant="primary" size="md" className="w-full">
                    Цаг захиалах
                  </Button>
                </Card>
              </motion.div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Бүх эмчийг харах
          </Button>
        </div>
      </div>
    </section>
  );
}
