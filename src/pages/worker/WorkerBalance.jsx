import { Search, Calendar, HandCoins, ArrowDownToLine, ArrowRight } from 'lucide-react';

export default function WorkerBalance() {
  // ข้อมูลจำลองสำหรับ Progress Bar
  const workStats = [
    { name: 'ตัดอ้อย · 86 แถว', amount: '12,900', pct: '60%' },
    { name: 'ปลูกอ้อย · 54 แถว', amount: '8,100', pct: '40%' },
    { name: 'รดน้ำ · 18 วัน', amount: '9,000', pct: '25%' },
    { name: 'พ่นยา · 10 ถัง', amount: '5,000', pct: '15%' },
  ];

  // ข้อมูลจำลองสำหรับตาราง
  const dummyTable = Array.from({ length: 15 }).map((_, idx) => ({
    id: idx,
    date: '20/01/2569',
    type: 'ตัดอ้อย',
    quantity: '20 ท่อน',
    balance: '10000 THB'
  }));

  return (
    <div className="bg-[#4A4238] rounded-2xl p-6 flex flex-col h-[calc(100vh-120px)] shadow-md overflow-hidden">
      
      {/* 1. ส่วนบน (การ์ดยอดเงิน & การ์ดสถานะ) */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        
        {/* ซ้าย: My Balance */}
        <div className="bg-farm-primary rounded-xl p-6 pb-4 text-white flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white text-farm-accent p-2 rounded-xl shadow-sm">
                <HandCoins size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold leading-tight">My balance</h2>
                <p className="text-sm text-white/80 mt-1">Overview This month</p>
              </div>
            </div>
            <div className="text-4xl font-bold mt-2">50,000 THB</div>
          </div>
          
          <div className="relative z-10 border-t border-white/20 mt-6 pt-3 flex justify-between items-center text-sm font-medium text-white/80 cursor-pointer hover:text-white transition-colors">
            <span>See details</span>
            <ArrowRight size={16} />
          </div>

          {/* ลวดลายวงกลมจางๆ พื้นหลังการ์ด */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        </div>

        {/* ขวา: สถานะการจ่ายเงิน */}
        <div className="bg-white rounded-xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <p className="text-gray-500 font-bold mb-2">สถานะการจ่ายเงิน</p>
            <div className="bg-[#EADDB5] text-[#91712A] px-4 py-2 rounded-full font-bold flex items-center gap-2 w-max text-sm">
              <div className="border-2 border-[#91712A] rounded-full p-0.5">
                <ArrowDownToLine size={12} strokeWidth={3} />
              </div>
              รอจ่าย
            </div>
          </div>
          <p className="text-gray-400 font-medium text-sm">รอบจ่ายถัดไป: 31 สิงหาคม 2569</p>
        </div>
      </div>

      {/* 2. ส่วนกลาง (แยกยอดตามประเภทงาน) */}
      <div className="bg-white rounded-xl p-6 mb-4 shadow-sm shrink-0">
        <h3 className="text-farm-text font-extrabold text-lg mb-5">แยกยอดตามประเภทงาน</h3>
        <div className="flex flex-col gap-4">
          {workStats.map((stat, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-2">
                <p className="text-farm-text font-bold text-sm">{stat.name}</p>
                <p className="text-farm-text font-bold">{stat.amount}</p>
              </div>
              <div className="w-full bg-[#F3EFE6] rounded-full h-3">
                <div 
                  className="bg-[#D1A344] h-3 rounded-full" 
                  style={{ width: stat.pct }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. ส่วนล่าง (ตารางรายการทั้งหมด) */}
      <div className="bg-white rounded-xl p-6 flex-1 flex flex-col shadow-sm overflow-hidden">
        
        {/* Header ตาราง + ตัวกรอง */}
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="text-farm-text font-extrabold text-lg">รายการทั้งหมด</h3>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-[240px] border border-gray-200 rounded-lg overflow-hidden flex items-center">
              <input 
                type="text" 
                placeholder="search your activity" 
                className="w-full pl-4 pr-10 py-2 text-farm-text outline-none text-sm placeholder:text-gray-400 bg-transparent"
              />
              <Search size={16} className="absolute right-3 text-gray-400" />
            </div>

            {/* Date */}
            <div className="relative w-[180px] border border-gray-200 rounded-lg overflow-hidden flex items-center">
              <input 
                type="date" 
                className="w-full pl-3 pr-8 py-2 text-farm-text outline-none text-sm text-gray-600 bg-transparent relative z-20 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <Calendar size={16} className="absolute right-3 text-gray-400 z-10 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ตาราง */}
        <div className="overflow-y-auto flex-1 rounded-t-xl border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#E5E7EB] sticky top-0 z-10">
              <tr>
                <th className="py-4 px-6 text-gray-500 font-bold text-lg">Work Date</th>
                <th className="py-4 px-6 text-gray-500 font-bold text-lg">Work Type</th>
                <th className="py-4 px-6 text-gray-500 font-bold text-lg text-center">Quantity</th>
                <th className="py-4 px-6 text-gray-500 font-bold text-lg text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dummyTable.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-6 text-farm-text font-medium">{item.date}</td>
                  <td className="py-3 px-6 text-farm-text font-medium">{item.type}</td>
                  <td className="py-3 px-6 text-farm-text font-medium text-center">{item.quantity}</td>
                  <td className="py-3 px-6 text-farm-text font-medium text-right">{item.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
