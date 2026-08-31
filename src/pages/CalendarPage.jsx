import React, { useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { mn } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import CalendarLabel from "../components/CalendarLabel";

// ---- Localizer ----
const locales = { mn };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// ---- Responsive Custom Toolbar ----
function CustomToolbar({ onNavigate, onView }) {
  return (
    <div
      className="flex flex-col md:flex-row justify-between items-center mb-4 p-2 border-b"
      style={{ backgroundColor: "#f8f9fa", borderRadius: "6px" }}
    >
      {/* Navigation */}
      <div className="mb-2 md:mb-0 flex justify-center md:justify-start">
        <Button variant="outline" size="sm" onClick={() => onNavigate("PREV")}>
          Өмнөх
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="ms-2"
          onClick={() => onNavigate("TODAY")}
        >
          Өнөөдөр
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="ms-2"
          onClick={() => onNavigate("NEXT")}
        >
          Дараах
        </Button>
      </div>

      {/* View buttons */}
      <div className="flex justify-center flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="me-1 mb-1"
          onClick={() => onView("month")}
        >
          Сар
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="me-1 mb-1"
          onClick={() => onView("week")}
        >
          7 хоног
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="mb-1"
          onClick={() => onView("day")}
        >
          Өдөр
        </Button>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [calendarLabel, setCalendarLabel] = useState(format(new Date(), "MMMM yyyy"));

  const events = [
    {
      title: "30 минутын уулзалт",
      start: new Date(2025, 8, 18, 9, 30),
      end: new Date(2025, 8, 18, 10, 0),
    },
  ];

  const messages = {
    allDay: "Өдөр бүр",
    previous: "Өмнөх",
    next: "Дараах",
    today: "Өнөөдөр",
    month: "Сар",
    week: "7 хоног",
    day: "Өдөр",
    agenda: "Жагсаалт",
  };

  const times = ["9:30 am", "10:00 am", "10:30 am", "11:00 am"];

  return (
    <div className="page-container p-6" style={{ maxWidth: "1200px" }}>
      {/* Гол label-г тусдаа харуулах */}
      {/* Desktop: CalendarLabel дээр гарна */}
      <div className="hidden md:block">
        <CalendarLabel label={calendarLabel} />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Зүүн тал */}
        <div className="col-span-12 min-w-0 md:col-span-2">
          <Card className="p-4 shadow-sm h-full">
            <h6 className="mb-2 text-base font-medium text-muted">Ц. Батгаа</h6>
            <h4 className="mb-2 text-2xl font-medium leading-tight">30 минут</h4>
            <p className="text-muted mb-1">
              Товлосон цаг <br />
              9-8, 2025 <br /> 11:00 am
            </p>
            <input type="text" placeholder="address" className="w-full min-w-0 rounded-control border border-line bg-surface px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-focus" />
          </Card>
        </div>

        {/* Mobile/Tablet: Calendar-д дотор */}
        <div className="col-span-12 block md:hidden text-center mb-2">
          <h4 className="text-xl font-bold md:text-2xl">{calendarLabel}</h4>
        </div>

        {/* Calendar */}
        <div className="col-span-12 min-w-0 md:col-span-8">
          <Card className="p-4 shadow-sm h-full">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              culture="mn"
              style={{ height: 600 }}
              selectable
              onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start)}
              onNavigate={(date) => setCalendarLabel(format(date, "MMMM yyyy"))}
              messages={messages}
              defaultView="month"
              views={["month", "week", "day"]}
              components={{
                toolbar: CustomToolbar,
              }}
            />
          </Card>
        </div>

        {/* Баруун тал */}
        <div className="col-span-12 min-w-0 md:col-span-2">
          <Card className="p-4 shadow-sm h-full">
            <h6 className="mb-2 text-base font-medium leading-tight">
              {selectedDate.toLocaleDateString("mn-MN", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </h6>
            <div className="mb-2 flex justify-end">
              <Button variant="outline" size="sm">
                12
              </Button>
              <Button variant="outline" size="sm" className="ms-2">
                24
              </Button>
            </div>
            {times.map((time, idx) => (
              <Button
                key={idx}
                variant={selectedTime === time ? "primary" : "secondary"}
                className="block mb-2 w-full"
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </Button>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
