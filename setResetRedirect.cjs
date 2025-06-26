require('dotenv').config({ path: '.env.local' });
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Appwrite setup
const endpoint = 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const adminKey = process.env.EXPO_PUBLIC_APPWRITE_ADMIN_API_KEY;

// 🛠 FIXED: Use correct path string
const path = `/projects/${projectId}/auth/email-password`;

async function setRedirectUrl() {
    try {
        const res = await fetch(`${endpoint}${path}`, {
            method: 'PATCH',
            headers: {
                'X-Appwrite-Project': projectId,
                'X-Appwrite-Key': adminKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                enabled: true,
                passwordRecovery: {
                    enabled: true,
                    url: 'rolamax://reset-password',
                },
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Failed to update auth settings');
        }

        console.log('✅ Redirect URL updated:', data);
    } catch (err) {
        console.error('❌ Error updating redirect URL:', err.message || err);
    }
}

setRedirectUrl();
