import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const HEADLINERS = [
  { name: 'The Weeknd', day: 'Friday', time: '11:00 PM', variant: 'from-neon-pink to-neon-purple', image: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/The_Weeknd_Portrait_by_Brian_Ziff.jpg' },
  { name: 'Daft Punk', day: 'Saturday', time: '10:30 PM', variant: 'from-neon-cyan to-neon-pink', image: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Daft_Punk_in_2013_2-_centered.jpg' },
  { name: 'Skrillex', day: 'Sunday', time: '9:00 PM', variant: 'from-neon-purple to-neon-cyan', image: 'https://upload.wikimedia.org/wikipedia/commons/9/99/From_First_To_Last_-_Emo_Nite_2_-_PH_Carl_Pocket_%28cropped%29.jpg' },
];

const SUPPORTING = [
  'Martin Garrix', 'Calvin Harris', 'Zedd', 'Odesza', 
  'Flume', 'Kavinsky', 'Justice', 'Gesaffelstein',
  'Deadmau5', 'Disclosure', 'Rufus Du Sol', 'DJ Snake'
];

export default function Lineup() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="relative py-24 px-6 overflow-hidden bg-dark">
      <div className="container mx-auto relative z-10" ref={containerRef}>
        
        {/* Section Header */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
            The Lineup
          </h2>
          <div className="w-24 h-1 bg-neon-cyan mx-auto shadow-[0_0_10px_theme('colors.neon.cyan')]" />
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-12"
        >
          {/* Headliners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {HEADLINERS.map((artist, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="group relative rounded-2xl border border-white/10 bg-dark overflow-hidden hover:border-neon-cyan transition-all duration-500 shadow-2xl h-[400px]"
              >
                {/* Image Background */}
                <div className="absolute inset-0 z-0">
                  <img src={artist.image} alt={artist.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-transparent" />
                </div>

                {/* Hover Gradient Overlay */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${artist.variant} mix-blend-overlay`} />

                {/* Content */}
                <div className="relative z-10 p-8 flex flex-col h-full justify-end">
                  <h4 className="text-xl font-bold uppercase tracking-widest text-neon-cyan mb-2 group-hover:text-white transition-colors">{artist.day}</h4>
                  <h3 className="text-4xl md:text-5xl font-display font-black leading-none mb-6">
                    {artist.name}
                  </h3>
                  <div className="inline-block self-start px-4 py-1 border border-white/20 rounded-full text-sm font-bold tracking-widest uppercase bg-dark/80 group-hover:border-white/50 transition-colors backdrop-blur-sm">
                    {artist.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Supporting Artists */}
          <motion.div variants={itemVariants} className="text-center max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xl md:text-2xl font-display font-bold uppercase text-gray-400">
              {SUPPORTING.map((artist, i) => (
                <span 
                  key={i} 
                  className="hover:text-white hover:text-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all cursor-crosshair"
                >
                  {artist}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
