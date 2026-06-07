// api/save-booking.js — 予約をSupabaseに保存
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase環境変数が未設定です' });
  }

  const {
    bookingNumber, menuName, durationMin, price, total,
    locationType, hotelName, roomNumber, address,
    date, timeSlot,
    firstName, lastName, email, phone, snsId, notes,
    paymentMethod, language, paymentIntentId, nominationFee,
  } = req.body;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        booking_number:  bookingNumber,
        status:          'confirmed',
        menu_name:       menuName,
        duration_min:    durationMin,
        price:           price,
        total:           total,
        location_type:   locationType,
        hotel_name:      hotelName   || null,
        room_number:     roomNumber  || null,
        address:         address     || null,
        date:            date,
        time_slot:       timeSlot,
        first_name:      firstName,
        last_name:       lastName,
        email:           email,
        phone:           phone,
        sns_id:          snsId       || null,
        notes:           notes       || null,
        payment_method:  paymentMethod,
        language:        language    || 'ja',
        nomination_fee:  nominationFee || 0,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, booking: data[0] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
