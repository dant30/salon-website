import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isBefore, startOfDay, addDays } from 'date-fns';
import './BookingCalendar.css';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock } from 'react-icons/fi';

const BookingCalendar = ({ 
  selectedDate, 
  onDateSelect, 
  unavailableDates = [], 
  minDate = new Date(),
  maxDate = addMonths(new Date(), 3),
  showTimeSlots = false,
  timeSlots = [],
  selectedTime,
  onTimeSelect
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Handle previous/next month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    if (isBefore(addMonths(currentMonth, 1), maxDate)) {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  // Check if date is unavailable
  const isDateUnavailable = (date) => {
    const today = startOfDay(new Date());
    return (
      isBefore(date, today) || 
      unavailableDates.some(unavailableDate => 
        isSameDay(new Date(unavailableDate), date)
      )
    );
  };

  // Check if date is selectable
  const isDateSelectable = (date) => {
    return !isDateUnavailable(date) && isBefore(date, maxDate);
  };

  // Handle date selection
  const handleDateClick = (date) => {
    if (isDateSelectable(date)) {
      onDateSelect(date);
      
      // Filter available time slots for selected date
      if (showTimeSlots && timeSlots.length > 0) {
        const daySlots = timeSlots.filter(slot => 
          isSameDay(new Date(slot.date), date) && slot.is_available
        );
        setAvailableTimeSlots(daySlots);
      }
    }
  };

  // Generate day headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate disabled state for navigation
  const isPrevDisabled = isBefore(subMonths(currentMonth, 1), startOfMonth(minDate));
  const isNextDisabled = isBefore(maxDate, addMonths(currentMonth, 1));

  return (
    <div className="booking-calendar">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button 
          className="nav-button" 
          onClick={prevMonth}
          disabled={isPrevDisabled}
          aria-label="Previous month"
        >
          <FiChevronLeft />
        </button>
        
        <div className="current-month">
          <FiCalendar className="month-icon" />
          <span>{format(currentMonth, 'MMMM yyyy')}</span>
        </div>
        
        <button 
          className="nav-button" 
          onClick={nextMonth}
          disabled={isNextDisabled}
          aria-label="Next month"
        >
          <FiChevronRight />
        </button>
      </div>

      {/* Day Headers */}
      <div className="day-headers">
        {dayHeaders.map(day => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="calendar-days">
        {/* Empty cells for days before month start */}
        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day empty"></div>
        ))}

        {/* Month Days */}
        {daysInMonth.map(day => {
          const isUnavailable = isDateUnavailable(day);
          const isSelectable = isDateSelectable(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={day.toString()}
              className={`calendar-day 
                ${!isCurrentMonth ? 'other-month' : ''}
                ${isToday ? 'today' : ''}
                ${isSelected ? 'selected' : ''}
                ${isUnavailable ? 'unavailable' : ''}
                ${isSelectable ? 'selectable' : ''}
              `}
              onClick={() => isSelectable && handleDateClick(day)}
              role="button"
              tabIndex={isSelectable ? 0 : -1}
              onKeyDown={(e) => {
                if (isSelectable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleDateClick(day);
                }
              }}
              aria-label={`${format(day, 'MMMM d, yyyy')}${isUnavailable ? ' - Unavailable' : ''}`}
              aria-selected={isSelected}
              aria-disabled={!isSelectable}
            >
              <div className="day-number">{format(day, 'd')}</div>
              {isToday && <div className="today-indicator">Today</div>}
              {isSelected && <div className="selected-indicator"></div>}
              {isUnavailable && <div className="unavailable-indicator"></div>}
            </div>
          );
        })}

        {/* Empty cells for days after month end */}
        {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
          <div key={`empty-end-${index}`} className="calendar-day empty"></div>
        ))}
      </div>

      {/* Time Slots (if enabled) */}
      {showTimeSlots && selectedDate && (
        <div className="time-slots-section">
          <div className="time-slots-header">
            <FiClock className="time-icon" />
            <h4>Available Times for {format(selectedDate, 'EEEE, MMMM d')}</h4>
          </div>
          
          {availableTimeSlots.length > 0 ? (
            <div className="time-slots-grid">
              {availableTimeSlots.map((slot, index) => (
                <button
                  key={index}
                  className={`time-slot ${selectedTime === slot.start_time ? 'selected' : ''}`}
                  onClick={() => onTimeSelect(slot.start_time)}
                >
                  {slot.start_time}
                </button>
              ))}
            </div>
          ) : (
            <div className="no-time-slots">
              <p>No available time slots for this date</p>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>Today</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected"></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-color unavailable"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;