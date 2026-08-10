const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// 🚀 DineXpress Supabase Credentials
const supabaseUrl = 'https://knapkvcyanxqcrnaejlz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuYXBrdmN5YW54cWNybmFlamx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MDYyMTEsImV4cCI6MjA5MTk4MjIxMX0.2fz_rOQLrgofEhwe0crc61fNOEUd4XsfrcI1Jf7DY6w';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 🎯 Catch RFID Scans from ESP32
app.post('/rfid-scan', async (req, res) => {
    let { uid } = req.body;
    if (!uid) return res.status(400).send("No UID");

    uid = uid.toUpperCase().replace(/\s+/g, ' ').trim();
    console.log(`\n🎯 RFID Scan Received: [${uid}]`);

    try {
        // 🎯 1. FIND THE STUDENT (Ultra-Fuzzy Matching)
        const rawUid = uid.trim();
        const cleanUid = rawUid.replace(/\s+/g, '').toUpperCase();
        
        console.log(`🔎 Scan Pulse: [${rawUid}] -> Searching for Match...`);

        // Fetch all profiles to find any format match
        const { data: profiles, error: pError } = await supabase
            .from('profiles')
            .select('id, full_name, wallet_balance, rfid_uid');

        const profile = profiles?.find(p => {
            if (!p.rfid_uid) return false;
            const dbUid = p.rfid_uid.replace(/\s+/g, '').toUpperCase();
            return dbUid === cleanUid || p.rfid_uid === rawUid;
        });

        if (!profile) {
            console.error(`❌ DENIED: Card [${rawUid}] is NOT linked to any user in Supabase.`);
            console.log(`🛠️ FIX: Go to profiles, copy "${rawUid}" and paste it exactly into your rfid_uid.`);
            return res.status(200).json({ success: false, message: 'Card not registered' });
        }

        console.log(`👤 IDENTIFIED: ${profile.full_name} | Balance: ₹${profile.wallet_balance}`);

        // 🎯 2. TRIGGER APP TRIGGER
        await supabase.from('profiles').update({ last_tap_at: new Date().toISOString() }).eq('id', profile.id);

        // 🎯 3. EXECUTE FINANCIAL CONFORMANCE
        const { data, error } = await supabase.rpc('process_rfid_tap', { scanned_uid: profile.rfid_uid });
        
        console.log(`✅ CONFORMATION: ${data.message}`);
        return res.status(200).json(data);
        
        console.log(`✅ Bridge Result for ${profile.full_name}: ${data.message}`);
        return res.status(200).json(data);
    } catch (e) {
        console.error("❌ Bridge Crash:", e.message);
        res.status(500).send("Bridge Error");
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n💎 DineXpress RFID Bridge Running on port ${PORT}`);
    console.log(`📡 Set ESP32 serverUrl to: http://YOUR_LAPTOP_IP:3000/rfid-scan`);
});
