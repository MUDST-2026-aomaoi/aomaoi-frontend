import { Clock, Wallet, Sprout, Droplets, SprayCan, Axe } from 'lucide-react';

export default function WorkerDashboard() {
  return (
    <div className="flex flex-col gap-5">
      {/* 1. แถบแจ้งเตือนด้านบนสุด */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 text-sm font-medium text-farm-text shadow-sm">
        <Clock size={18} className="text-farm-accent" />
        <span>บันทึกงานล่าสุด: วันนี้ 08:40 น. • ทำงานแล้ว 18 วันในเดือนนี้</span>
      </div>

      {/* 2. การ์ดสีเขียวแสดงยอดเงิน (My Balance) */}
      <div className="bg-farm-primary rounded-xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center gap-4 mb-4 relative z-10">
          <div className="bg-white text-farm-accent p-3 rounded-xl shadow-sm">
            <Wallet size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight">My balance</h2>
            <p className="text-sm text-white/80 mt-1">Overview This month</p>
          </div>
        </div>
        <div className="text-5xl font-bold relative z-10 mt-2">50,000 THB</div>
        
        {/* ลวดลายวงกลมจางๆ พื้นหลังการ์ด */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
      </div>

      {/* 3. การ์ดสรุปงาน 4 กล่อง */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { title: 'ตัดอ้อย', value: '86 แถว', amount: '12,900 THB.', icon: Axe },
          { title: 'ปลูกอ้อย', value: '54 แถว', amount: '8,100 THB.', icon: Sprout },
          { title: 'รดน้ำ', value: '18 วัน', amount: '9,000 THB.', icon: Droplets },
          { title: 'พ่นยา', value: '10 ถัง', amount: '5,000 THB.', icon: SprayCan },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[160px] hover:shadow-md transition-shadow">
            <div className="bg-[#D1A344] w-12 h-12 rounded-xl flex items-center justify-center text-white mb-2">
              <item.icon size={24} />
            </div>
            <div>
              <p className="text-base font-bold text-farm-text mb-1">{item.title}</p>
              <p className="text-sm font-medium text-gray-500 mb-2">{item.value}</p>
              <p className="text-lg font-bold text-farm-text">{item.amount}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 4. พื้นที่ด้านล่าง (กราฟ + ประวัติล่าสุด) */}
      <div className="grid grid-cols-12 gap-5 mt-2 h-[340px]">
        
        {/* กล่องซ้าย: กราฟแท่ง */}
        <div className="col-span-6 bg-[#4A4238] rounded-2xl p-6 flex flex-col justify-end text-white shadow-md">
          <div className="flex justify-around items-end h-[220px] gap-4 w-full">
            {[
              { month: 'มี.ค.', val: 34, height: 'h-[90%]' },
              { month: 'เม.ย.', val: 27, height: 'h-[60%]' },
              { month: 'พ.ค.', val: 32, height: 'h-[85%]' },
              { month: 'ก.ค.', val: 20, height: 'h-[40%]' },
              { month: 'ส.ค.', val: 24, height: 'h-[55%]' },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-3 w-16 h-full justify-end">
                <div className={`w-12 ${bar.height} bg-[#E5D4A4] rounded-t-xl rounded-b-sm shadow-inner`}></div>
                <div className="text-center mt-1">
                  <p className="text-sm font-bold text-white/90">{bar.val}</p>
                  <p className="text-xs text-white/60 mt-1">{bar.month}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* กล่องขวา: ประวัติงานล่าสุด */}
        <div className="col-span-6 bg-[#4A4238] rounded-2xl p-8 text-white shadow-md overflow-hidden flex flex-col">
          <h3 className="text-xl font-bold mb-6">ประวัติงานล่าสุด</h3>
          <div className="flex flex-col gap-0 flex-1 overflow-y-auto pr-2">
            {[
              { title: 'ตัดอ้อย · 14 แถว', date: '13 ส.ค. 2569', amount: '+ 2,100', icon: Axe },
              { title: 'พ่นยา · 3 ถัง', date: '12 ส.ค. 2569', amount: '+ 1,500', icon: SprayCan },
              { title: 'ปลูกอ้อย · 9 แถว', date: '12 ส.ค. 2569', amount: '+ 500', icon: Sprout },
              { title: 'รดน้ำ · 1 วัน', date: '12 ส.ค. 2569', amount: '+ 1,350', icon: Droplets },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between border-b border-white/10 py-4 first:pt-0 last:border-0 last:pb-0 hover:bg-white/5 px-2 -mx-2 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <activity.icon size={26} className="text-[#E5D4A4]" />
                  <div>
                    <p className="font-bold text-sm tracking-wide">{activity.title}</p>
                    <p className="text-xs text-white/60 mt-1">{activity.date}</p>
                  </div>
                </div>
                <div className="font-bold text-base text-white">
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
