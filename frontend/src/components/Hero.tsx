import { motion, useScroll, useTransform } from 'framer-motion';

const Hero = () => {
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityText = useTransform(scrollY, [0, 300], [1, 0]);

  const yVisual = useTransform(scrollY, [0, 500], [0, -100]);
  const yImage = useTransform(scrollY, [0, 500], [0, -40]);
  const yParticles1 = useTransform(scrollY, [0, 500], [0, -150]);
  const yParticles2 = useTransform(scrollY, [0, 500], [0, -250]);

  // Generate some random floating particles
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: Math.random() * 5 + 5,
    delay: Math.random() * 2,
    color: Math.random() > 0.5 ? 'bg-neon-pink' : 'bg-neon-cyan',
  }));

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-cyan/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-neon-pink/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Floating Particles (Parallax Layer 1) */}
      <motion.div style={{ y: yParticles1 }} className="absolute inset-0 pointer-events-none z-0">
        {particles.slice(0, 10).map((p) => (
          <motion.div
            key={p.id}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 1, 0.2]
            }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
            className={`absolute rounded-full ${p.color} shadow-[0_0_10px_currentColor]`}
            style={{ width: p.size, height: p.size, left: p.left, top: p.top }}
          />
        ))}
      </motion.div>

      {/* Floating Particles (Parallax Layer 2 - Faster) */}
      <motion.div style={{ y: yParticles2 }} className="absolute inset-0 pointer-events-none z-0">
        {particles.slice(10, 20).map((p) => (
          <motion.div
            key={p.id}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.8, 0.1]
            }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
            className={`absolute rounded-full ${p.color} shadow-[0_0_15px_currentColor]`}
            style={{ width: p.size * 1.5, height: p.size * 1.5, left: p.left, top: p.top }}
          />
        ))}
      </motion.div>

      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Typographic Block */}
        <motion.div
          style={{ y: yText, opacity: opacityText }}
          className="max-w-2xl"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-block px-4 py-1 border border-neon-cyan/50 rounded-full text-neon-cyan text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md bg-dark/50">
              Project 5: The Creative Campaign
            </div>
            <h1 
              data-text="Rule Breaking Energy"
              className="text-7xl md:text-9xl font-display font-black leading-[0.85] tracking-tighter uppercase mb-6 glitch-hover"
            >
              Rule<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-purple">Breaking</span><br />
              Energy
            </h1>
            <p className="text-gray-400 text-lg md:text-xl font-sans mb-10 max-w-md border-l-2 border-neon-pink pl-6">
              Step into a 3-day neon music festival experience where sound meets light.
            </p>
          </motion.div>
        </motion.div>

        {/* Abstract / Graphic Block */}
        <motion.div
          style={{ y: yVisual }}
          className="relative h-[600px] w-full hidden md:block z-10"
        >
          {/* Stock Image Layer with Parallax */}
          <motion.div
            style={{ y: yImage }}
            className="absolute inset-[15%] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(249,0,255,0.15)] z-10"
          >
            <img
              src="/concert_crowd.png"
              alt="Concert Crowd"
              className="w-full h-full object-cover mix-blend-lighten opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-90" />
            <div className="absolute inset-0 bg-neon-cyan/10 mix-blend-overlay" />
          </motion.div>

          {/* We use abstract geometric shapes animated with Framer Motion to represent the "electric" feel */}
          <motion.div
            animate={{
              rotate: [0, 90, 180, 270, 360],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-[1px] border-white/10 rounded-full border-dashed z-0"
          />

          <motion.div
            animate={{
              rotate: [360, 270, 180, 90, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[5%] border-2 border-neon-cyan/20 rounded-full z-0 pointer-events-none"
          />

          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px #f900ff",
                "0 0 60px #f900ff",
                "0 0 20px #f900ff"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-dark rounded-full border-4 border-neon-pink z-20 flex items-center justify-center backdrop-blur-xl"
          >
            <div className="text-center font-display uppercase tracking-widest text-xs font-bold leading-relaxed">
              Sep<br /><span className="text-3xl text-neon-pink">20-22</span><br />2024
            </div>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
};

export default Hero;
