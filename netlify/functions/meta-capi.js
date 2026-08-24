// =================================================================
// 🚀 NETLIFY SERVERLESS FUNCTION - META CONVERSIONS API (CAPI)
// =================================================================

const crypto = require('crypto');

function sha256(val) {
    if (!val) return '';
    return crypto.createHash('sha256').update(String(val).trim().toLowerCase()).digest('hex');
}

exports.handler = async function(event, context) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const pixelId = body.pixel_id || process.env.FB_PIXEL_ID || '';
        const accessToken = body.access_token || process.env.FB_ACCESS_TOKEN || '';
        const testEventCode = body.test_event_code || process.env.FB_TEST_EVENT_CODE || '';

        if (!pixelId || !accessToken) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: 'Missing Meta Pixel ID or Access Token in request'
                })
            };
        }

        const clientIp = event.headers['x-nf-client-connection-ip'] || 
                         event.headers['x-forwarded-for'] || 
                         body.client_ip || '';

        const clientUserAgent = event.headers['user-agent'] || body.client_user_agent || '';

        // Prepare User Data with SHA-256 Hashing
        const userData = {
            client_ip_address: clientIp,
            client_user_agent: clientUserAgent,
            fbp: body.fbp || '',
            fbc: body.fbc || ''
        };

        if (body.phone) {
            const cleanPhone = body.phone.replace(/[^0-9]/g, '');
            const bdPhone = cleanPhone.startsWith('88') ? cleanPhone : ('88' + cleanPhone);
            userData.ph = [sha256(bdPhone)];
        }

        if (body.email) {
            userData.em = [sha256(body.email)];
        }

        if (body.name) {
            userData.fn = [sha256(body.name.split(' ')[0] || '')];
        }

        // Prepare Event Payload
        const eventPayload = {
            event_name: body.event_name || 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            event_id: body.event_id || `capi_${Date.now()}_${Math.floor(Math.random()*10000)}`,
            event_source_url: body.event_source_url || '',
            action_source: 'website',
            user_data: userData,
            custom_data: {
                currency: body.currency || 'BDT',
                value: parseFloat(body.value) || 0,
                content_name: body.content_name || 'সুলতানা হাফেজা সেট',
                content_type: 'product',
                contents: body.contents || []
            }
        };

        const capiUrl = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;
        
        const payloadData = {
            data: [eventPayload]
        };

        if (testEventCode) {
            payloadData.test_event_code = testEventCode;
        }

        const fbResponse = await fetch(capiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadData)
        });

        const fbResult = await fbResponse.json();

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                meta_response: fbResult,
                event_id: eventPayload.event_id
            })
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                error: err.message
            })
        };
    }
};
