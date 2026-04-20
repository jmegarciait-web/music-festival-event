import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const CustomerPortal = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchTickets = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/user/reservations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setTickets(data.reservations);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#070707] text-white py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-display font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
              My Passes
            </h1>
            <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">
              Welcome, {localStorage.getItem('username')}
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold"
            >
              Back to Festival
            </button>
            <button 
              onClick={handleLogout}
              className="border border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black transition-all px-6 py-2 rounded-lg font-bold uppercase tracking-widest text-xs"
            >
              Log Out
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tickets.length === 0 ? (
              <div className="col-span-full text-center py-20 glass-panel rounded-2xl">
                <p className="text-gray-400 text-xl font-display uppercase">No passes found</p>
                <button onClick={() => navigate('/')} className="neon-button mt-6">Buy Passes</button>
              </div>
            ) : (
              tickets.map((ticket, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={ticket.id}
                  className="glass-panel p-0 rounded-2xl overflow-hidden neon-glow-border flex flex-col"
                >
                  <div className="bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 p-6 flex justify-between items-start">
                    <div>
                      <div className="text-neon-cyan font-bold uppercase tracking-widest text-xs mb-1">{ticket.tier} PASS</div>
                      <div className="text-white text-xl font-display font-black uppercase">
                        {ticket.guests} {ticket.guests > 1 ? 'Admissions' : 'Admission'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-xs font-bold tracking-widest uppercase">Order #{ticket.id}</div>
                      <div className="text-white mt-1 font-black">${ticket.totalPrice}</div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col items-center justify-center bg-black/40">
                    <div className="bg-white p-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] mb-4">
                      <QRCodeSVG 
                         value={JSON.stringify({ id: ticket.id, role: 'ticket', tier: ticket.tier, guests: ticket.guests })}
                         size={180}
                         level="H"
                         bgColor="#ffffff"
                         fgColor="#000000"
                      />
                    </div>
                    <div className="text-center w-full">
                      <p className="text-xs text-neon-pink uppercase tracking-widest font-bold mb-1">Scannable Code</p>
                      <p className="text-gray-400 text-[10px]">Valid for dates: {ticket.startDate} to {ticket.endDate}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
