import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

// สร้างข้อมูลจำลองแบบหลากหลายเพื่อเทสการกรอง
const mockData = [
  { id: 1, date: '2026-01-20', displayDate: '20/01/2569', type: 'ตัดอ้อย', quantity: '20 ท่อน' },
  { id: 2, date: '2026-01-21', displayDate: '21/01/2569', type: 'ปลูกอ้อย', quantity: '15 แถว' },
  { id: 3, date: '2026-01-25', displayDate: '25/01/2569', type: 'ตัดอ้อย', quantity: '30 ท่อน' },
  { id: 4, date: '2026-02-05', displayDate: '05/02/2569', type: 'รดน้ำ', quantity: '1 วัน' },
  { id: 5, date: '2026-02-10', displayDate: '10/02/2569', type: 'พ่นยา', quantity: '5 ถัง' },
  { id: 6, date: '2026-02-12', displayDate: '12/02/2569', type: 'ตัดอ้อย', quantity: '10 ท่อน' },
  { id: 7, date: '2026-02-15', displayDate: '15/02/2569', type: 'ปลูกอ้อย', quantity: '20 แถว' },
  { id: 8, date: '2026-02-18', displayDate: '18/02/2569', type: 'รดน้ำ', quantity: '1 วัน' },
  { id: 9, date: '2026-02-20', displayDate: '20/02/2569', type: 'ตัดอ้อย', quantity: '45 ท่อน' },
  { id: 10, date: '2026-02-25', displayDate: '25/02/2569', type: 'พ่นยา', quantity: '2 ถัง' },
];

export default function WorkerHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ฟังก์ชันคำนวณการกรองข้อมูล
  const filteredData = useMemo(() => {
    return mockData.filter(item => {
      // 1. กรองคำค้นหา (หาจากชื่องาน)
      const matchSearch = item.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. กรองวันที่เริ่มต้น
      const matchStartDate = startDate ? item.date >= startDate : true;
      
      // 3. กรองวันที่สิ้นสุด
      const matchEndDate = endDate ? item.date <= endDate : true;

      return matchSearch && matchStartDate && matchEndDate;
    });
  }, [searchTerm, startDate, endDate]);

  return (
    <div className="bg-[#4A4238] rounded-2xl p-6 flex flex-col h-[calc(100vh-120px)] shadow-md">
      
      {/* ส่วนค้นหาและกรองวันที่ */}
      <div className="flex items-center gap-4 mb-6">
        {/* ช่อง Search */}
        <div className="relative flex-1 max-w-[500px]">
          <input 
            type="text" 
            placeholder="search your activity (เช่น ตัดอ้อย)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-5 pr-10 py-3 bg-white rounded-xl text-farm-text outline-none text-sm placeholder:text-gray-400 shadow-sm"
          />
          <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* ช่องวันที่เริ่มต้น (ใช้ type="date" เพื่อเรียกปฏิทินของระบบขึ้นมา) */}
        <div className="relative w-[200px]">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-xl text-farm-text outline-none text-sm text-gray-600 shadow-sm"
          />
        </div>

        <span className="text-white font-medium text-lg px-1">ถึง</span>

        {/* ช่องวันที่สิ้นสุด */}
        <div className="relative w-[200px]">
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-xl text-farm-text outline-none text-sm text-gray-600 shadow-sm"
          />
        </div>
      </div>

      <h2 className="text-white text-2xl font-bold mb-4">Recent Activities</h2>

      {/* ตารางข้อมูล */}
      <div className="bg-white rounded-xl overflow-y-auto flex-1 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#D9D9D9] sticky top-0 z-10">
            <tr>
              <th className="py-4 px-6 text-farm-text font-bold text-lg border-b border-gray-300">Work Date</th>
              <th className="py-4 px-6 text-farm-text font-bold text-lg border-b border-gray-300">Work Type</th>
              <th className="py-4 px-6 text-farm-text font-bold text-lg border-b border-gray-300">Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 text-farm-text font-medium">{item.displayDate}</td>
                  <td className="py-3 px-6 text-farm-text font-medium">{item.type}</td>
                  <td className="py-3 px-6 text-farm-text font-medium">{item.quantity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-8 text-center text-gray-500 font-medium">
                  ไม่พบประวัติการทำงานที่คุณค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
