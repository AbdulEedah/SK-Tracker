import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16 text-white">
          <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">K</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Kano Portfolio</h1>
          <p className="text-xl opacity-90 mb-8">Comprehensive Startup Management Platform</p>
        </header>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-xl p-8 text-center mb-12 max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse mr-3"></div>
            <h2 className="text-2xl font-semibold text-gray-800">Application Status: Live & Ready</h2>
          </div>
          <p className="text-gray-600 mb-6">Your Next.js application is successfully deployed and running on Vercel</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/dashboard" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Go to Dashboard
            </Link>
            <Link 
              href="/auth/login" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Login
            </Link>
            <Link 
              href="/admin" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center text-white">
          <h4 className="text-xl font-semibold mb-4">Built with Modern Technologies</h4>
          <div className="flex flex-wrap justify-center gap-3">
            {['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Vercel'].map((tech) => (
              <span key={tech} className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-white/80 mt-16">
          <p>&copy; 2026 Kano Portfolio. Built with Next.js and deployed on Vercel.</p>
          <p className="mt-2">Startup Management Platform - Version 1.0</p>
        </footer>
      </div>
    </div>
  )
}