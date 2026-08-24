/**
 * =================================================================
 * 🚀 GOOGLE APPS SCRIPT - SULTANA HAFEJA SET & JERIN FASHION BACKEND
 * =================================================================
 * কীভাবে সেটআপ করবেন:
 * ১. একটি নতুন Google Sheet খুলুন (https://sheets.new)
 * ২. মেনু থেকে Extensions > Apps Script এ ক্লিক করুন
 * ৩. কোড এডিটরের সব কোড মুছে দিয়ে এই পুরো ফাইলটির কোড পেস্ট করুন
 * ৪. ওপরের Deploy বাটনে ক্লিক করে New Deployment সিলেক্ট করুন
 * ৫. Select type > Web App সিলেক্ট করুন:
 *    - Description: Order Sync Web App
 *    - Execute as: Me (your Google account)
 *    - Who has access: Anyone (যেকোনো ব্যক্তি)
 * ৬. Deploy বাটনে ক্লিক করে получен "Web App URL" কপি করে অ্যাডমিন প্যানেলের Settings এ পেস্ট করুন।
 * =================================================================
 */

function setupSheetHeaders(sheet) {
  const headers = [
    'Order ID',
    'তারিখ ও সময়',
    'কাস্টমার নাম',
    'ফোন নম্বর',
    'ঠিকানা',
    'অর্ডারকৃত পণ্য',
    'ডেলিভারি এরিয়া',
    'সর্বমোট বিল',
    'উৎস',
    'স্ট্যাটাস',
    'কাস্টমার আইপি'
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#0d9488');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

function getActiveOrdersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Orders');
  if (!sheet) {
    sheet = ss.insertSheet('Orders');
  }
  setupSheetHeaders(sheet);
  return sheet;
}

// Handle GET requests (Admin Panel fetching orders)
function doGet(e) {
  try {
    const sheet = getActiveOrdersSheet();
    const data = sheet.getDataRange().getValues();
    const orders = [];

    // Skip header row (index 0)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue; // Skip empty rows

      orders.push({
        orderId: String(row[0]),
        timestamp: String(row[1]),
        name: String(row[2]),
        phone: String(row[3]),
        address: String(row[4]),
        product: String(row[5]),
        delivery: String(row[6]),
        total: String(row[7]),
        source: String(row[8] || 'Direct'),
        status: String(row[9] || 'Processing'),
        ip: String(row[10] || '')
      });
    }

    // Return latest orders first
    orders.reverse();

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      orders: orders
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle POST requests (New orders from landing page / admin)
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const sheet = getActiveOrdersSheet();

    // 1. UPDATE STATUS ACTION
    if (payload.action === 'update_status' && payload.orderId) {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(payload.orderId)) {
          sheet.getRange(i + 1, 10).setValue(payload.status || 'Processing');
          return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: 'Status updated successfully'
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // 2. NEW ORDER ACTION
    const orderId = payload.orderId || ('JF-' + Math.floor(10000 + Math.random() * 90000));
    const timestamp = payload.timestamp || new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    const name = payload.name || '';
    const phone = payload.phone || '';
    const address = payload.address || '';
    const product = payload.product || '';
    const delivery = payload.delivery || '';
    const total = payload.total || '';
    const source = payload.source || 'Direct';
    const status = payload.status || 'Processing';
    const ip = payload.ip || '';

    sheet.appendRow([
      orderId,
      timestamp,
      name,
      phone,
      address,
      product,
      delivery,
      total,
      source,
      status,
      ip
    ]);

    // 3. OPTIONAL META CONVERSION API (CAPI) FORWARDING FROM GOOGLE SCRIPT
    if (payload.capi_token && payload.pixel_id) {
      try {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const bdPhone = cleanPhone.startsWith('88') ? cleanPhone : ('88' + cleanPhone);
        const hashedPhone = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bdPhone)
          .map(function(b) { return ('0' + (b & 0xFF).toString(16)).slice(-2); }).join('');

        const numericTotal = parseFloat(String(total).replace(/[^0-9.]/g, '')) || 0;

        const capiData = {
          data: [{
            event_name: 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            event_id: payload.event_id || ('gas_capi_' + Date.now()),
            event_source_url: payload.event_source_url || '',
            action_source: 'website',
            user_data: {
              client_ip_address: ip,
              client_user_agent: payload.user_agent || '',
              fbp: payload.fbp || '',
              fbc: payload.fbc || '',
              ph: [hashedPhone]
            },
            custom_data: {
              currency: 'BDT',
              value: numericTotal,
              content_name: product
            }
          }]
        };

        if (payload.test_event_code) {
          capiData.test_event_code = payload.test_event_code;
        }

        UrlFetchApp.fetch('https://graph.facebook.com/v19.0/' + payload.pixel_id + '/events?access_token=' + payload.capi_token, {
          method: 'post',
          contentType: 'application/json',
          payload: JSON.stringify(capiData),
          muteHttpExceptions: true
        });
      } catch (capiErr) {
        Logger.log('CAPI Forwarding Error: ' + capiErr.toString());
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      orderId: orderId,
      message: 'Order placed successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
