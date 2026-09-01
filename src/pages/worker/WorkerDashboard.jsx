import { Clock, Wallet, Sprout, Droplets, SprayCan, Axe } from 'lucide-react';

export default function WorkerDashboard() {
  return (
    // จำกัดความสูงทั้งหมดให้อยู่แค่ใน 1 หน้าจอ (h-[calc...])
    <div className="flex flex-col gap-3 h-[calc(100vh-115px)]">
      
      {/* 1. แถบแจ้งเตือนด้านบนสุด */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2.5 text-xs font-medium text-farm-text shadow-sm shrink-0">
        <Clock size={16} className="text-farm-accent" />
        <span>บันทึกงานล่าสุด: วันนี้ 08:40 น. • ทำงานแล้ว 18 วันในเดือนนี้</span>
      </div>

      {/* 2. การ์ดสีเขียวแสดงยอดเงิน (My Balance) */}
      <div className="bg-farm-primary rounded-xl p-5 text-white shadow-md relative overflow-hidden shrink-0">
        <div className="flex items-center gap-3 mb-2 relative z-10">
          <div className="bg-white text-farm-accent p-2 rounded-xl shadow-sm">
            <Wallet size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">My balance</h2>
            <p className="text-xs text-white/80 mt-0.5">Overview This month</p>
          </div>
        </div>
        <div className="text-3xl font-bold relative z-10">50,000 THB</div>
        
        {/* ลวดลายวงกลมจางๆ พื้นหลังการ์ด */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
      </div>

      {/* 3. การ์ดสรุปงาน 4 กล่อง */}
      <div className="grid grid-cols-4 gap-3 shrink-0">
        {[
          { title: 'ตัดอ้อย', value: '86 แถว', amount: '12,900 THB.', icon: Axe },
          { title: 'ปลูกอ้อย', value: '54 แถว', amount: '8,100 THB.', icon: Sprout },
          { title: 'รดน้ำ', value: '18 วัน', amount: '9,000 THB.', icon: Droplets },
          { title: 'พ่นยา', value: '10 ถัง', amount: '5,000 THB.', icon: SprayCan },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="bg-[#D1A344] w-10 h-10 rounded-lg flex items-center justify-center text-white mb-2">
              <item.icon size={20} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-farm-text mb-0.5">{item.title}</p>
              <p className="text-xs font-bold text-gray-500 mb-1">{item.value}</p>
              <p className="text-lg font-extrabold text-farm-text">{item.amount}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 4. พื้นที่ด้านล่าง (กราฟ + ประวัติล่าสุด) - ใช้ flex-1 เพื่อให้พอดีกับพื้นที่จอที่เหลือ */}
      <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
        
        {/* กล่องซ้าย: กราฟแท่ง */}
        <div className="col-span-6 bg-[#4A4238] rounded-2xl p-5 flex flex-col justify-end text-white shadow-md">
          <div className="flex justify-around items-end h-[85%] w-full">
            {[
              { month: 'มี.ค.', val: 34, height: 'h-[90%]' },
              { month: 'เม.ย.', val: 27, height: 'h-[60%]' },
              { month: 'พ.ค.', val: 32, height: 'h-[85%]' },
              { month: 'ก.ค.', val: 20, height: 'h-[40%]' },
              { month: 'ส.ค.', val: 24, height: 'h-[55%]' },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-12 h-full justify-end">
                <div className={`w-8 ${bar.height} bg-[#E5D4A4] rounded-t-lg rounded-b-sm shadow-inner`}></div>
                <div className="text-center mt-1">
                  <p className="text-xs font-bold text-white/90">{bar.val}</p>
                  <p className="text-[10px] text-white/60">{bar.month}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* กล่องขวา: ประวัติงานล่าสุด */}
        <div className="col-span-6 bg-[#4A4238] rounded-2xl p-5 text-white shadow-md flex flex-col min-h-0">
          <h3 className="text-lg font-bold mb-3 shrink-0">ประวัติงานล่าสุด</h3>
          <div className="flex flex-col gap-0 flex-1 overflow-y-auto pr-2">
            {[
              { title: 'ตัดอ้อย · 14 แถว', date: '13 ส.ค. 2569', amount: '+ 2,100', icon: Axe },
              { title: 'พ่นยา · 3 ถัง', date: '12 ส.ค. 2569', amount: '+ 1,500', icon: SprayCan },
              { title: 'ปลูกอ้อย · 9 แถว', date: '12 ส.ค. 2569', amount: '+ 500', icon: Sprout },
              { title: 'รดน้ำ · 1 วัน', date: '12 ส.ค. 2569', amount: '+ 1,350', icon: Droplets },
              { title: 'ตัดอ้อย · 10 แถว', date: '10 ส.ค. 2569', amount: '+ 1,500', icon: Axe },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between border-b border-white/10 py-3 first:pt-0 last:border-0 last:pb-0 hover:bg-white/5 px-2 -mx-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <activity.icon size={20} className="text-[#E5D4A4]" />
                  <div>
                    <p className="font-bold text-xs tracking-wide">{activity.title}</p>
                    <p className="text-[10px] text-white/60 mt-0.5">{activity.date}</p>
                  </div>
                </div>
                <div className="font-bold text-sm text-white">
                  {activity.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
