

function App() {
  return(
    
      <div className="min-h-screen flex flex-col justify-center p-4 bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 ease-in-out">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">Welcome to GenAI ChatApp!</h1>
          <p className="text-lg text-gray-700 dark:text-gray-400">Frontend is up and running with Tailwind CSS and Dark Mode.</p>
        <p className="text-md text-gray-600 dark:text-gray-500 mt-2">Next: Integrate Firebase and Chat UI.</p>
      </header>

    {/* This is where our chat interface components will eventually go */}
      <div className="chat-interface-placeholder p-6 border border-dashed rounded-lg
                      border-blue-500 dark:border-blue-700
                      bg-gray-100 dark:bg-gray-800
                      text-blue-700 dark:text-blue-200">
        <h2 className="text-2xl font-semibold mb-2">Chat Interface Placeholder</h2>
        <p className="text-sm">Authentication, message input, and display will be built here.</p>
        <p className="text-sm mt-1">API Base URL: <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded text-xs">
          {import.meta.env.VITE_API_BASE_URL || 'Not set'}
        </code></p>
      </div>
      </div>
    
  )
}

export default App;