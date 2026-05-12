import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16 text-gray-800">
          <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center border-none shadow-lg">
            <span className="text-2xl font-medium text-emerald-600">K</span>
          </div>
          <h1 className="text-4xl font-medium mb-4 text-gray-900 font-display">Kano Portfolio</h1>
          <p className="text-lg text-gray-600 mb-8 font-medium font-sans">Comprehensive Startup Management Platform</p>
        </header>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-lg border-none p-8 text-center mb-12 max-w-2xl mx-auto hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-center mb-4">
            <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse mr-3 shadow-lg"></div>
            <h2 className="text-lg font-medium text-gray-800 font-display">Application Status: Live & Ready</h2>
          </div>
          <p className="text-gray-600 mb-6">Your Next.js application is successfully deployed and running with clean modern design</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/dashboard" 
              className="group bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden border-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10">Go to Dashboard</span>
            </Link>
            <Link 
              href="/auth/login" 
              className="group bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1 border-none shadow-md"
            >
              Login
            </Link>
            <Link 
              href="/admin" 
              className="group bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1 border-none shadow-md"
            >
              Admin Panel
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[
            { icon: '📋', title: 'Task Management', desc: 'Organize and track your startup tasks with intuitive project management tools.' },
            { icon: '📅', title: 'Event Planning', desc: 'Schedule and manage startup events, product launches, and important milestones.' },
            { icon: '🤝', title: 'Meeting Coordination', desc: 'Streamline your meeting processes with scheduling tools and agenda management.' },
            { icon: '📊', title: 'Analytics & Reports', desc: 'Generate insightful reports and analytics to track your startup progress.' },
            { icon: '👥', title: 'User Management', desc: 'Manage team members, roles, and permissions with comprehensive admin tools.' },
            { icon: '🔐', title: 'Admin Dashboard', desc: 'Comprehensive admin panel with full control over users, tasks, and system reports.' }
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg border-none p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-2xl border-none p-8 text-center text-gray-800 shadow-lg">
          <h4 className="text-xl font-semibold mb-4">Built with Modern Technologies</h4>
          <div className="flex flex-wrap justify-center gap-3">
            {['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Vercel'].map((tech) => (
              <span key={tech} className="bg-gray-50 px-4 py-2 rounded-full text-sm font-medium border-none hover:bg-gray-100 transition-all duration-300">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-600 mt-16">
          <p>&copy; 2026 Kano Portfolio. Built with Next.js and deployed on Vercel.</p>
          <p className="mt-2">Startup Management Platform - Version 2.0 with Clean Modern Design</p>
        </footer>
      </div>
    </div>
  )
}