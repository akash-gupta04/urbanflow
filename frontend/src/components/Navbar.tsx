export default function Navbar() {
  return (
    <nav className="mb-8 flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-3xl px-6 py-4 shadow-[0_0_30px_rgba(59,130,246,0.06)]">
      <div>
        <h1 className="text-2xl font-bold">
          🌆 UrbanFlow
        </h1>

        <p className="text-zinc-500 text-sm">
          Smart City Intelligence Platform
        </p>
      </div>

      <div className="hidden md:flex items-center gap-4">
        <button className="text-zinc-300 hover:text-white transition">
          Dashboard
        </button>

        <button className="text-zinc-500 hover:text-white transition">
          Emergency
        </button>

        <button className="text-zinc-500 hover:text-white transition">
          Analytics
        </button>
      </div>

      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />

        <span className="text-sm text-green-400">
          Live
        </span>
      </div>
    </nav>
  );
}