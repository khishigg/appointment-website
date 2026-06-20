/**
 * BookingStore - Zustand state management for the dental booking flow
 * 
 * This store manages the entire booking journey:
 * Branch Selection → Doctor Selection → Service Selection → Time Slot Selection → Confirmation
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const initialState = {
    // Step tracking
    currentStep: 1, // 1: Branch, 2: Doctor, 3: Service, 4: Time, 5: Confirmation

    // Selected entities
    selectedClinic: null,      // { id, name }
    selectedBranch: null,      // { id, name, address, phone, ... }
    selectedDoctor: null,      // { id, clinicId, clinicNum, provNum, name, ... }
    selectedService: null,     // { id, name, price, duration, ... }
    selectedTimeSlot: null,    // { apiDate, time, operatoryNum, opName, rawSlot, ... }

    patientInfo: {
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        note: '',
    },

    // UI state
    isBookingModalOpen: false,
    isTimeSlotModalOpen: false,
    isBookingDetailsOpen: false, // New: for the service & patient info overlay
    initialScrollDate: null,    // New: to auto-scroll to a specific date
    isLoading: false,
    error: null,
};

export const useBookingStore = create(
    devtools(
        (set, get) => ({
            ...initialState,

            // ============ STEP NAVIGATION ============
            setStep: (step) => set({ currentStep: step }),

            nextStep: () => set((state) => ({
                currentStep: Math.min(state.currentStep + 1, 5)
            })),

            prevStep: () => set((state) => ({
                currentStep: Math.max(state.currentStep - 1, 1)
            })),

            // ============ SELECTION ACTIONS ============
            setSelectedClinic: (clinic) => set({
                selectedClinic: clinic,
            }),

            selectBranch: (branch) => set({
                selectedBranch: branch,
                // Reset downstream selections when branch changes
                selectedDoctor: null,
                selectedService: null,
                selectedTimeSlot: null,
            }),

            selectDoctor: (doctor) => set({
                selectedDoctor: doctor,
                // Reset downstream selections when doctor changes
                selectedService: null,
                selectedTimeSlot: null,
            }),

            selectService: (service) => set({
                selectedService: service,
                // Reset time slot when service changes (different durations)
                selectedTimeSlot: null,
            }),

            selectTimeSlot: (timeSlot) => set({
                selectedTimeSlot: timeSlot
            }),

            // ============ PATIENT INFO ============
            setPatientInfo: (info) => set((state) => ({
                patientInfo: { ...state.patientInfo, ...info }
            })),

            // ============ MODAL CONTROL ============
            openBookingModal: () => set({ isBookingModalOpen: true }),
            closeBookingModal: () => set({ isBookingModalOpen: false }),

            openTimeSlotModal: (date) => set({
                isTimeSlotModalOpen: true,
                initialScrollDate: date || null
            }),
            closeTimeSlotModal: () => set({
                isTimeSlotModalOpen: false,
                initialScrollDate: null
            }),

            openBookingDetails: () => set({ isBookingDetailsOpen: true }),
            closeBookingDetails: () => set({ isBookingDetailsOpen: false }),

            // ============ LOADING & ERROR STATE ============
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),

            // ============ COMPUTED VALUES (via get) ============
            getBookingSummary: () => {
                const state = get();
                return {
                    clinic: state.selectedClinic?.name || 'Сонгогдоогүй',
                    branch: state.selectedBranch?.name || 'Сонгогдоогүй',
                    doctor: state.selectedDoctor?.name || 'Сонгогдоогүй',
                    service: state.selectedService?.name || 'Сонгогдоогүй',
                    time: state.selectedTimeSlot
                        ? `${state.selectedTimeSlot.formattedDate} ${state.selectedTimeSlot.time}`
                        : 'Сонгогдоогүй',
                    patient: `${state.patientInfo.lastName} ${state.patientInfo.firstName}`.trim() || 'Мэдээлэлгүй',
                };
            },

            // Check if booking can proceed
            canProceed: () => {
                const state = get();
                switch (state.currentStep) {
                    case 1: return !!state.selectedBranch;
                    case 2: return !!state.selectedDoctor;
                    case 3: return !!state.selectedService;
                    case 4: return !!state.selectedTimeSlot;
                    case 5: return state.patientInfo.firstName && state.patientInfo.lastName && state.patientInfo.phone;
                    default: return false;
                }
            },

            // ============ RESET ============
            resetBooking: () => set(initialState),
        }),
        { name: 'BookingStore' } // DevTools label
    )
);

export default useBookingStore;
