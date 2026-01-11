// filepath: c:\Users\dante\salon-website\frontend\src\context\BookingContext.js
import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const resetBooking = () => {
    setSelectedService(null);
    setSelectedStaff(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  return (
    <BookingContext.Provider value={{
      selectedService, setSelectedService,
      selectedStaff, setSelectedStaff,
      selectedDate, setSelectedDate,
      selectedTime, setSelectedTime,
      resetBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
};