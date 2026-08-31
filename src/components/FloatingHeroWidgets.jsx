import { motion } from "framer-motion";
import { FiPlusSquare, FiUser, FiUsers, FiCalendar } from "react-icons/fi";

const floatAnimation = (delay) => ({
    y: [0, -12, 0],
    transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
    },
});

const WidgetCard = ({ icon: Icon, title, value, colorClass, style, delay }) => (
    <motion.div
        className="absolute hidden min-[992px]:flex items-center gap-4 bg-white shadow-sm pe-6 ps-4 py-2 rounded-pill"
        animate={floatAnimation(delay)}
        style={{
            zIndex: 10,
            border: '1px solid rgba(0,0,0,0.04)',
            ...style
        }}
    >
        <div
            className={`flex items-center justify-center rounded-full ${colorClass}`}
            style={{ width: 40, height: 40, background: 'var(--gray-50)' }}
        >
            <Icon size={18} />
        </div>
        <div className="flex flex-col text-start" style={{ lineHeight: 1.2 }}>
            <span className="font-bold text-gray-900" style={{ fontSize: '0.9rem' }}>{value}</span>
            <span className="text-gray-400" style={{ fontSize: '0.75rem', fontWeight: 500 }}>{title}</span>
        </div>
    </motion.div>
);

export default function FloatingHeroWidgets() {
    return (
        <>
            {/* 🏥 Top Left: Clinics */}
            <WidgetCard
                icon={FiPlusSquare}
                value="120+"
                title="Хамтрагч эмнэлэг"
                colorClass="text-primary-500"
                style={{ top: '20%', left: '5%' }}
                delay={0}
            />

            {/* 👨‍⚕️ Top Right: Doctors */}
            <WidgetCard
                icon={FiUser}
                value="500+"
                title="Мэргэжлийн эмч"
                colorClass="text-success-500"
                style={{ top: '15%', right: '5%' }}
                delay={1.5}
            />

            {/* 👥 Bottom Left: Customers */}
            <WidgetCard
                icon={FiUsers}
                value="50,000+"
                title="Үйлчлүүлэгч"
                colorClass="text-secondary-500"
                style={{ bottom: '30%', left: '3%' }}
                delay={0.8}
            />

            {/* 📅 Bottom Right: Appointments */}
            <WidgetCard
                icon={FiCalendar}
                value="15,000+"
                title="Захиалга"
                colorClass="text-warning-500"
                style={{ bottom: '25%', right: '3%' }}
                delay={2.2}
            />
        </>
    );
}
