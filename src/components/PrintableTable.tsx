import React, { useState } from 'react';
import { format, parseISO, differenceInMinutes, isWithinInterval } from 'date-fns';
import { Event } from '../stores/eventStore';
import html2pdf from 'html2pdf.js';

interface PrintableTableProps {
  events: Event[];
  reportType: 'regular' | 'night' | 'phone' | 'summary';
  onClose: () => void;
  startDate: string;
  endDate: string;
}

const PracticeInfo = () => (
  <div className="text-sm mb-6">
    <p>Praktyka Lekarska Michał Puchalski</p>
    <p>63 - 400 Ostrów Wielkopolski</p>
    <p>ul. Nowa Krępa 137</p>
    <p>Tel: 691-22-50-60</p>
    <p>NIP: 622-243-88-69; REGON: 30027140</p>
  </div>
);

function PrintableTable({ events, reportType, onClose, startDate, endDate }: PrintableTableProps) {
  const [fontSize, setFontSize] = useState(0.8);

  const tableCellStyle = {
    fontSize: `${fontSize}em`,
    padding: '8px 16px',
    lineHeight: '1.4',
    verticalAlign: 'middle' as const,
    height: 'auto',
    display: 'table-cell' as const,
  };

  const formatDateTime = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, 'dd.MM.yyyy HH:mm');
  };

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, 'dd.MM.yyyy');
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    const totalMinutes = differenceInMinutes(endDate, startDate);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const calculateTotalHours = (events: Event[]) => {
    const totalMinutes = events.reduce((acc, event) => {
      if (event.title.toLowerCase().includes('u')) {
        return acc + 0;
      } else if (event.title.toLowerCase().includes('p')) {
        return acc + 7 * 60;
      }
      return acc + differenceInMinutes(parseISO(event.end), parseISO(event.start));
    }, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const filteredEvents = events
    .filter(event => {
      const eventDate = parseISO(event.start);
      const filterStart = parseISO(startDate);
      const filterEnd = parseISO(endDate);
      return isWithinInterval(eventDate, { start: filterStart, end: filterEnd });
    })
    .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());

  const renderRegularTable = () => {
    const regularEvents = filteredEvents.filter(event => {
      const title = event.title.toLowerCase();
      return title.includes('n') || title.includes('u') || title.includes('p');
    });

    return (
      <>
        <h2 className="text-center text-sm mb-6">
          ZAŁĄCZNIK A<br />
          /ODDZIAŁ CHIRURGII DZIECIĘCEJ/<br /><br />
          Specyfikacja godzin pracy etatowej w zakresie świadczenia usług<br />
          medycznych za okres od {format(parseISO(startDate), 'dd.MM.yyyy')} do {format(parseISO(endDate), 'dd.MM.yyyy')}
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="border px-4 py-2 text-left w-16"
                style={tableCellStyle}
                valign="middle"
              >
                Lp.
              </th>
              <th
                className="border px-4 py-2 text-left"
                style={tableCellStyle}
                valign="middle"
              >
                Data rozpoczęcia
              </th>
              <th
                className="border px-4 py-2 text-left"
                style={tableCellStyle}
                valign="middle"
              >
                Data zakończenia
              </th>
              <th
                className="border px-4 py-2 text-left"
                style={tableCellStyle}
                valign="middle"
              >
                Liczba godzin
              </th>
            </tr>
          </thead>
          <tbody>
            {regularEvents.map((event, index) => {
              const isSpecialEvent = event.title.toLowerCase().includes('u') || event.title.toLowerCase().includes('p');
              const isFreeDay = event.title.toLowerCase().includes('u');
              const isFreePaidDay = event.title.toLowerCase().includes('p');
              
              return (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td
                    className="border px-4 py-2 text-gray-600"
                    style={tableCellStyle}
                    valign="middle"
                  >
                    {index + 1}
                  </td>
                  <td
                    className="border px-4 py-2"
                    style={tableCellStyle}
                    valign="middle"
                  >
                    {isSpecialEvent ? formatDate(event.start) : formatDateTime(event.start)}
                  </td>
                  <td
                    className="border px-4 py-2"
                    style={tableCellStyle}
                    valign="middle"
                  >
                    {isSpecialEvent ? (isFreeDay ? 'urlop bezpłatny' : 'urlop płatny') : formatDateTime(event.end)}
                  </td>
                  <td
                    className="border px-4 py-2"
                    style={tableCellStyle}
                    valign="middle"
                  >
                    {isFreeDay ? '00:00' : (isFreePaidDay ? '07:00' : calculateDuration(event.start, event.end))}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-gray-50 font-semibold">
              <td
                colSpan={3}
                className="border px-4 py-2 text-right"
                style={tableCellStyle}
                valign="middle"
              >
                Suma godzin:
              </td>
              <td
                className="border px-4 py-2"
                style={tableCellStyle}
                valign="middle"
              >
                {calculateTotalHours(regularEvents)}
              </td>
            </tr>
          </tbody>
        </table>
      </>
    );
  };

  const renderNightShiftTable = () => {
    const nightEvents = filteredEvents.filter(event => event.title.toLowerCase().includes('d'));

    return (
      <>
        <h2 className="text-center text-sm mb-6">
          ZAŁĄCZNIK B<br />
          /ODDZIAŁ CHIRURGII DZIECIĘCEJ/<br /><br />
          § 1<br />
          Specyfikacja godzin pracy dyżurowej w zakresie świadczenia usług<br />
          medycznych za okres od {format(parseISO(startDate), 'dd.MM.yyyy')} do {format(parseISO(endDate), 'dd.MM.yyyy')}
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="border px-4 py-2 text-left w-16"
                style={tableCellStyle}
                valign="middle"
              >
                Lp.
              </th>
              <th
                className="border px-4 py-2 text-left"
                style={tableCellStyle}
                valign="middle"
              >
                Data rozpoczęcia
              </th>
              <th
                className="border px-4 py-2 text-left"
                style={tableCellStyle}
                valign="middle"
              >
                Data zakończenia
              </th>
              <th
                className="border px-4 py-2 text-left"
                style={tableCellStyle}
                valign="middle"
              >
                Liczba godzin
              </th>
            </tr>
          </thead>
          <tbody>
            {nightEvents.map((event, index) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td
                  className="border px-4 py-2 text-gray-600"
                  style={tableCellStyle}
                  valign="middle"
                >
                  {index + 1}
                </td>
                <td
                  className="border px-4 py-2"
                  style={tableCellStyle}
                  valign="middle"
                >
                  {formatDateTime(event.start)}
                </td>
                <td
                  className="border px-4 py-2"
                  style={tableCellStyle}
                  valign="middle"
                >
                  {formatDateTime(event.end)}
                </td>
                <td
                  className="border px-4 py-2"
                  style={tableCellStyle}
                  valign="middle"
                >
                  {calculateDuration(event.start, event.end)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td
                colSpan={3}
                className="border px-4 py-2 text-right"
                style={tableCellStyle}
                valign="middle"
              >
                Suma godzin:
              </td>
              <td
                className="border px-4 py-2"
                style={tableCellStyle}
                valign="middle"
              >
                {calculateTotalHours(nightEvents)}
              </td>
            </tr>
          </tbody>
        </table>
      </>
    );
  };

  const renderPhoneCallTable = () => {
    const phoneEvents = filteredEvents.filter(event => {
      const title = event.title.toLowerCase();
      return title.includes('t') && !title.includes('u') && !title.includes('p');
    });
    
    const workEvents = filteredEvents.filter(event => {
      const title = event.title.toLowerCase();
      return title.includes('w') && !title.includes('u') && !title.includes('p');
    });

    const calculateAdjustedDuration = (phoneEvent: Event) => {
      let totalMinutes = differenceInMinutes(parseISO(phoneEvent.end), parseISO(phoneEvent.start));
      
      workEvents.forEach(workEvent => {
        const workStart = parseISO(workEvent.start);
        const workEnd = parseISO(workEvent.end);
        const phoneStart = parseISO(phoneEvent.start);
        const phoneEnd = parseISO(phoneEvent.end);

        if (workStart <= phoneEnd && workEnd >= phoneStart) {
          const overlapStart = workStart > phoneStart ? workStart : phoneStart;
          const overlapEnd = workEnd < phoneEnd ? workEnd : phoneEnd;
          const overlapMinutes = differenceInMinutes(overlapEnd, overlapStart);
          totalMinutes -= overlapMinutes;
        }
      });

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const calculatePhoneTotalHours = () => {
      let totalMinutes = 0;
      phoneEvents.forEach(event => {
        let eventMinutes = differenceInMinutes(parseISO(event.end), parseISO(event.start));
        
        workEvents.forEach(workEvent => {
          const workStart = parseISO(workEvent.start);
          const workEnd = parseISO(workEvent.end);
          const phoneStart = parseISO(event.start);
          const phoneEnd = parseISO(event.end);

          if (workStart <= phoneEnd && workEnd >= phoneStart) {
            const overlapStart = workStart > phoneStart ? workStart : phoneStart;
            const overlapEnd = workEnd < phoneEnd ? workEnd : phoneEnd;
            const overlapMinutes = differenceInMinutes(overlapEnd, overlapStart);
            eventMinutes -= overlapMinutes;
          }
        });
        
        totalMinutes += eventMinutes;
      });

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    return (
      <>
         <h2 className="text-center text-sm mb-6">
          ZAŁĄCZNIK B<br />
          /ODDZIAŁ CHIRURGII DZIECIĘCEJ/<br /><br />
           § 2<br />
          Specyfikacja godzin pozostawania w gotowości do świadczenia usług<br />
          medycznych za okres od {format(parseISO(startDate), 'dd.MM.yyyy')} do {format(parseISO(endDate), 'dd.MM.yyyy')}
        </h2>
        <table className="w-full border-collapse mb-8">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="border px-4 py-2 text-left w-16"
                style={tableCellStyle}
                valign="middle"
              >
                Lp.
              </th>
              <th
                className="border px-4 py-2 text-left"
                style={tableCellStyle}
                valign="middle"
              >
                Data rozpoczęcia
              </th>
              <th
                className="border px-4 py-2 text-left"
                style={tableCellStyle}
                valign="middle"
              >
                Data zakończenia
              </th>
              <th
                className="border px-4 py-2 text-left"
                style={tableCellStyle}
                valign="middle"
              >
                Liczba godzin
              </th>
            </tr>
          </thead>
          <tbody>
            {phoneEvents.map((event, index) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td
                  className="border px-4 py-2 text-gray-600"
                  style={tableCellStyle}
                  valign="middle"
                >
                  {index + 1}
                </td>
                <td
                  className="border px-4 py-2"
                  style={tableCellStyle}
                  valign="middle"
                >
                  {formatDateTime(event.start)}
                </td>
                <td
                  className="border px-4 py-2"
                  style={tableCellStyle}
                  valign="middle"
                >
                  {formatDateTime(event.end)}
                </td>
                <td
                  className="border px-4 py-2 align-middle"
                  style={tableCellStyle}
                  valign="middle"
                >
                  {calculateAdjustedDuration(event)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td
                colSpan={3}
                className="border px-4 py-2 text-right"
                style={tableCellStyle}
                valign="middle"
              >
                Suma godzin:
              </td>
              <td
                className="border px-4 py-2 align-middle"
                style={tableCellStyle}
                valign="middle"
              >
                {calculatePhoneTotalHours()}
              </td>
            </tr>
          </tbody>
        </table>

        <h2 className="text-center text-sm mb-6">
           § 3<br />
           Specyfikacja godzin świadczenia usług medycznych na wezwanie<br />
          za okres od {format(parseISO(startDate), 'dd.MM.yyyy')} do {format(parseISO(endDate), 'dd.MM.yyyy')}
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="border px-4 py-2 text-left w-16"
                style={tableCellStyle}
                valign="middle"
              >
                Lp.
              </th>
              <th
                className="border px-4 py-2 text-left"
                style={tableCellStyle}
                valign="middle"
              >
                Data rozpoczęcia
              </th>
              <th
                className="border px-4 py-2 text-left"
                style={tableCellStyle}
                valign="middle"
              >
                Data zakończenia
              </th>
              <th
                className="border px-4 py-2 text-left"
                style={tableCellStyle}
                valign="middle"
              >
                Liczba godzin
              </th>
            </tr>
          </thead>
          <tbody>
            {workEvents.map((event, index) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td
                  className="border px-4 py-2 text-gray-600"
                  style={tableCellStyle}
                  valign="middle"
                >
                  {index + 1}
                </td>
                <td
                  className="border px-4 py-2"
                  style={tableCellStyle}
                  valign="middle"
                >
                  {formatDateTime(event.start)}
                </td>
                <td
                  className="border px-4 py-2"
                  style={tableCellStyle}
                  valign="middle"
                >
                  {formatDateTime(event.end)}
                </td>
                <td
                  className="border px-4 py-2 align-middle"
                  style={tableCellStyle}
                  valign="middle"
                >
                  {calculateDuration(event.start, event.end)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td
                colSpan={3}
                className="border px-4 py-2 text-right"
                style={tableCellStyle}
                valign="middle"
              >
                Suma godzin:
              </td>
              <td
                className="border px-4 py-2 align-middle"
                style={tableCellStyle}
                valign="middle"
              >
                {calculateTotalHours(workEvents)}
              </td>
            </tr>
          </tbody>
        </table>
      </>
    );
  };

  const renderSummaryTable = () => {
    const regularEvents = filteredEvents.filter(event => event.title.toLowerCase().includes('n') || event.title.toLowerCase().includes('u') || event.title.toLowerCase().includes('p'));
    const nightEvents = filteredEvents.filter(event => event.title.toLowerCase().includes('d'));
    const phoneEvents = filteredEvents.filter(event => event.title.toLowerCase().includes('t'));
    const workEvents = filteredEvents.filter(event => event.title.toLowerCase().includes('w'));

    const regularHours = calculateTotalHours(regularEvents);
    const nightHours = calculateTotalHours(nightEvents);
    const workHours = calculateTotalHours(workEvents);

    let totalPhoneMinutes = 0;
    phoneEvents.forEach(event => {
      let eventMinutes = differenceInMinutes(parseISO(event.end), parseISO(event.start));
      
      workEvents.forEach(workEvent => {
        const workStart = parseISO(workEvent.start);
        const workEnd = parseISO(workEvent.end);
        const phoneStart = parseISO(event.start);
        const phoneEnd = parseISO(event.end);

        if (workStart <= phoneEnd && workEnd >= phoneStart) {
          const overlapStart = workStart > phoneStart ? workStart : phoneStart;
          const overlapEnd = workEnd < phoneEnd ? workEnd : phoneEnd;
          const overlapMinutes = differenceInMinutes(overlapEnd, overlapStart);
          eventMinutes -= overlapMinutes;
        }
      });
      
      totalPhoneMinutes += eventMinutes;
    });

    const phoneHours = `${Math.floor(totalPhoneMinutes / 60).toString().padStart(2, '0')}:${(totalPhoneMinutes % 60).toString().padStart(2, '0')}`;

    const calculateValue = (hours: string, rate: number) => {
      const [h, m] = hours.split(':').map(Number);
      const totalHours = h + m / 60;
      return (totalHours * rate).toFixed(2);
    };

    return (
      <>
        <h2 className="text-xl font-bold mb-6">Raport podsumowujący</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-4 py-2 text-left">Typ</th>
              <th className="border px-4 py-2 text-left">Liczba godzin</th>
              <th className="border px-4 py-2 text-left">Stawka</th>
              <th className="border px-4 py-2 text-left">Wartość</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Dni robocze</td>
              <td className="border px-4 py-2">{regularHours}</td>
              <td className="border px-4 py-2">160</td>
              <td className="border px-4 py-2">{calculateValue(regularHours, 160)}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Dyżury nocne</td>
              <td className="border px-4 py-2">{nightHours}</td>
              <td className="border px-4 py-2">160</td>
              <td className="border px-4 py-2">{calculateValue(nightHours, 160)}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Dyżury pod telefonem</td>
              <td className="border px-4 py-2">{phoneHours}</td>
              <td className="border px-4 py-2">50</td>
              <td className="border px-4 py-2">{calculateValue(phoneHours, 50)}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Wezwania do pracy</td>
              <td className="border px-4 py-2">{workHours}</td>
              <td className="border px-4 py-2">160</td>
              <td className="border px-4 py-2">{calculateValue(workHours, 160)}</td>
            </tr>
            <tr className="font-bold bg-gray-50">
              <td className="border px-4 py-2">Suma</td>
              <td className="border px-4 py-2"></td>
              <td className="border px-4 py-2"></td>
              <td className="border px-4 py-2">
                {(
                  Number(calculateValue(regularHours, 160)) +
                  Number(calculateValue(nightHours, 160)) +
                  Number(calculateValue(phoneHours, 50)) +
                  Number(calculateValue(workHours, 160))
                ).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </>
    );
  };

  const generatePDF = () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `raport-${reportType}-${format(parseISO(startDate), 'yyyy-MM-dd')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        windowWidth: 1920,  // Added for consistent rendering
        onclone: (document) => {
          // Add custom styles to the cloned document
          const style = document.createElement('style');
          style.innerHTML = `
            td, th {
              padding: 5px 5px !important;  // Adjust these values as needed
            }
          `;
          document.head.appendChild(style);
        }
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      },
      pagebreak: { 
        mode: ['css', 'legacy'] 
      },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex justify-end items-center space-x-4 mb-8">
          <div className="flex items-center gap-2">
            <label htmlFor="fontSize" className="text-sm">Rozmiar tekstu:</label>
            <input
              type="range"
              id="fontSize"
              min="0.6"
              max="1.2"
              step="0.02"
              value={fontSize}
              onChange={(e) => setFontSize(parseFloat(e.target.value))}
              className="w-32"
            />
          </div>
          <button
            onClick={generatePDF}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Generuj PDF
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Drukuj
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Zamknij
          </button>
        </div>

        <div id="report-content">
          <div className="mb-8">
            <PracticeInfo />
          </div>
          {reportType === 'regular' && renderRegularTable()}
          {reportType === 'night' && renderNightShiftTable()}
          {reportType === 'phone' && renderPhoneCallTable()}
          {reportType === 'summary' && renderSummaryTable()}
        </div>
      </div>
    </div>
  );
}

export default PrintableTable;