import React from 'react';

export default function SummaryHeader({ patientInfo, selectedService, selectedBranch, selectedTimeSlot }) {
    return (
        <div className="sticky top-0 z-30 bg-gray-50 border-b border-gray-200 px-4 py-4">
            <h2 className="text-center text-base font-semibold text-gray-800 mb-3">
                Захиалгын мэдээлэл
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <span className="text-gray-500 text-xs">Өвчтөн</span>
                    <p className="font-medium text-gray-900 truncate">
                        {patientInfo.lastName} {patientInfo.firstName}
                    </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <span className="text-gray-500 text-xs">Үйлчилгээ</span>
                    <p className="font-medium text-gray-900 truncate">
                        {selectedService?.name || '-'}
                    </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <span className="text-gray-500 text-xs">Салбар</span>
                    <p className="font-medium text-gray-900 truncate">
                        {selectedBranch?.name || '-'}
                    </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <span className="text-gray-500 text-xs">Огноо & Цаг</span>
                    <p className="font-medium text-gray-900 truncate">
                        {selectedTimeSlot?.date} • {selectedTimeSlot?.time}
                    </p>
                </div>
            </div>
        </div>
    );
}
