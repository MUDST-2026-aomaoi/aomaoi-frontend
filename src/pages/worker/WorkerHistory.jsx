import { Search, Calendar } from 'lucide-react';

export default function WorkerHistory() {
  // สร้างข้อมูลจำลอง (Mock Data) สำหรับตาราง
  const dummyHistory = Array.from({ length: 15 }).map((_, idx) => ({
    id: idx,
    date: '20/01/2569',
    type: 'ตัดอ้อย',
    quantity: '20 ท่อน'
  }));

  return (
    <div className="bg-[#4A4238] rounded-2xl p-6 flex flex-col h-[calc(100vh-120px)] shadow-md">
      
      {/* ส่วนค้นหาและกรองวันที่ */}
      <div className="flex items-center gap-4 mb-6">
        {/* ช่อง Search */}
        <div className="relative flex-1 max-w-[500px]">
          <input 
            type="text" 
            placeholder="search your activity" 
            className="w-full pl-5 pr-10 py-3 bg-white rounded-xl text-farm-text outline-none text-sm placeholder:text-gray-400 shadow-sm"
          />
          <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* ช่องวันที่เริ่มต้น */}
        <div className="relative w-[220px]">
          <input 
            type="text" 
            placeholder="search your date" 
            className="w-full pl-4 pr-10 py-3 bg-white rounded-xl text-farm-text outline-none text-sm placeholder:text-gray-400 shadow-sm"
          />
          <Calendar size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <span className="text-white font-medium text-lg px-1">ถึง</span>

        {/* ช่องวันที่สิ้นสุด */}
        <div className="relative w-[220px]">
          <input 
            type="text" 
            placeholder="search your date" 
            className="w-full pl-4 pr-10 py-3 bg-white rounded-xl text-farm-text outline-none text-sm placeholder:text-gray-400 shadow-sm"
          />
          <Calendar size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
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
            {dummyHistory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-6 text-farm-text font-medium">{item.date}</td>
                <td className="py-3 px-6 text-farm-text font-medium">{item.type}</td>
                <td className="py-3 px-6 text-farm-text font-medium">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
