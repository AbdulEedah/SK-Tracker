const API_BASE_URL = 'http://localhost:3001/api/v1';

async function testAdminLogin() {
    console.log('Testing admin login and functionality...\n');
    
    try {
        // Test admin login
        console.log('1. Testing admin login...');
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'startupkano@gmail.com',
                password: '12345678sk'
            })
        });
        
        console.log('Login status:', loginResponse.status);
        const loginText = await loginResponse.text();
        
        if (loginResponse.ok) {
            const loginData = JSON.parse(loginText);
            console.log('✅ Admin login successful');
            console.log('User details:');
            console.log('- ID:', loginData.data.user.id);
            console.log('- Name:', loginData.data.user.full_name);
            console.log('- Email:', loginData.data.user.email);
            console.log('- Role:', loginData.data.user.role);
            
            const token = loginData.data.token;
            
            // Test admin endpoints
            console.log('\n2. Testing admin dashboard stats...');
            const statsResponse = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Stats status:', statsResponse.status);
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                console.log('✅ Admin stats:', statsData);
            } else {
                const statsError = await statsResponse.text();
                console.log('❌ Stats error:', statsError);
            }
            
            // Test admin users endpoint
            console.log('\n3. Testing admin users endpoint...');
            const usersResponse = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Users status:', usersResponse.status);
            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                console.log('✅ Admin users count:', usersData.data?.length || 'N/A');
            } else {
                const usersError = await usersResponse.text();
                console.log('❌ Users error:', usersError);
            }
            
        } else {
            console.log('❌ Admin login failed:', loginText);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAdminLogin();