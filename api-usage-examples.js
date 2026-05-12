// Backend API Usage Examples
const { BackendAPIClient } = require('./test-api.js')

async function demonstrateAPIUsage() {
  console.log('🎯 Backend API Usage Examples')
  console.log('=' .repeat(50))
  
  const client = new BackendAPIClient()
  
  try {
    // Example 1: Check API health
    console.log('\n1️⃣ Checking API Health')
    const health = await client.getHealth()
    console.log('Health:', health)
    
    // Example 2: User Registration (uncomment to test)
    /*
    console.log('\n2️⃣ User Registration')
    const newUser = await client.signup({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'securePassword123',
      role: 'user' // optional
    })
    console.log('New user created:', newUser)
    */
    
    // Example 3: User Login (uncomment and update credentials to test)
    /*
    console.log('\n3️⃣ User Login')
    const loginResult = await client.login('john.doe@example.com', 'securePassword123')
    console.log('Login successful:', loginResult.user)
    console.log('Access token received:', !!loginResult.access_token)
    */
    
    // Example 4: Get user profile (requires authentication)
    /*
    console.log('\n4️⃣ Get My Profile')
    const profile = await client.getMyProfile()
    console.log('My profile:', profile)
    */
    
    // Example 5: Create a task (requires authentication)
    /*
    console.log('\n5️⃣ Create Task')
    const newTask = await client.createTask({
      title: 'Complete API integration',
      description: 'Integrate the backend API with the frontend application',
      priority: 'high',
      due_date: '2026-05-10T00:00:00Z'
    })
    console.log('Task created:', newTask)
    */
    
    // Example 6: Get my tasks (requires authentication)
    /*
    console.log('\n6️⃣ Get My Tasks')
    const myTasks = await client.getMyTasks({ status: 'pending' })
    console.log('My tasks:', myTasks)
    */
    
    // Example 7: Get events (requires authentication based on API response)
    /*
    console.log('\n7️⃣ Get Events')
    const events = await client.getEvents({ type: 'workshop' })
    console.log('Events:', events)
    */
    
    // Example 8: Get notifications (requires authentication)
    /*
    console.log('\n8️⃣ Get Notifications')
    const notifications = await client.getNotifications()
    console.log('Notifications:', notifications)
    */
    
    console.log('\n✨ Examples completed!')
    console.log('\n💡 To run authenticated examples:')
    console.log('   1. Uncomment the signup example and run to create an account')
    console.log('   2. Uncomment the login example with your credentials')
    console.log('   3. Uncomment other examples to test authenticated endpoints')
    
  } catch (error) {
    console.error('❌ Error during API demonstration:', error.message)
  }
}

// Advanced usage example with error handling
async function advancedAPIExample() {
  console.log('\n🔧 Advanced API Usage with Error Handling')
  console.log('=' .repeat(50))
  
  const client = new BackendAPIClient()
  
  // Example: Login with error handling
  async function loginWithErrorHandling(email, password) {
    try {
      const result = await client.login(email, password)
      console.log('✅ Login successful')
      return result
    } catch (error) {
      console.log('❌ Login failed:', error.message)
      return null
    }
  }
  
  // Example: Create task with validation
  async function createTaskSafely(taskData) {
    try {
      // Validate required fields
      if (!taskData.title) {
        throw new Error('Task title is required')
      }
      
      const task = await client.createTask(taskData)
      console.log('✅ Task created successfully:', task.data?.title)
      return task
    } catch (error) {
      console.log('❌ Task creation failed:', error.message)
      return null
    }
  }
  
  // Example: Bulk operations with progress tracking
  async function bulkTaskCreation(tasks) {
    console.log(`📝 Creating ${tasks.length} tasks...`)
    const results = []
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      console.log(`Creating task ${i + 1}/${tasks.length}: ${task.title}`)
      
      const result = await createTaskSafely(task)
      results.push(result)
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    const successful = results.filter(r => r !== null).length
    console.log(`✅ Created ${successful}/${tasks.length} tasks successfully`)
    
    return results
  }
  
  console.log('Advanced examples ready to use!')
  console.log('Call loginWithErrorHandling(), createTaskSafely(), or bulkTaskCreation() after authentication')
}

// File upload example
async function fileUploadExample() {
  console.log('\n📁 File Upload Example')
  console.log('=' .repeat(30))
  
  const client = new BackendAPIClient()
  
  // Note: This is a conceptual example - you'd need actual file data
  console.log('To upload a file:')
  console.log('1. Ensure you are authenticated (logged in)')
  console.log('2. Create a File object or use FormData')
  console.log('3. Call client.uploadFile(file, category, isPublic)')
  
  /*
  // Example with actual file (uncomment when you have a file to upload)
  const fileInput = document.getElementById('fileInput') // In browser
  const file = fileInput.files[0]
  
  const uploadResult = await client.uploadFile(file, 'documents', false)
  console.log('File uploaded:', uploadResult)
  */
}

// Run examples
if (require.main === module) {
  demonstrateAPIUsage()
    .then(() => advancedAPIExample())
    .then(() => fileUploadExample())
}

module.exports = {
  demonstrateAPIUsage,
  advancedAPIExample,
  fileUploadExample
}