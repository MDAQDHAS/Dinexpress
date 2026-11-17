const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

const supabaseUrl = 'https://knapkvcyanxqcrnaejlz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuYXBrdmN5YW54cWNybmFlamx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MDYyMTEsImV4cCI6MjA5MTk4MjIxMX0.2fz_rOQLrgofEhwe0crc61fNOEUd4XsfrcI1Jf7DY6w';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const handleScan = async (req, res) => {
    let { uid } = req.body;
    if (!uid) return res.status(400).send("No UID");

    uid = uid.toUpperCase().replace(/\s+/g, ' ').trim();
    console.log(`🎯 RFID Scan Received: [${uid}]`);

    try {
        // Find the student profile
        const rawUid = uid.trim();
        const cleanUid = rawUid.replace(/\s+/g, '').toUpperCase();
        
        const { data: profiles, error: pError } = await supabase
            .from('profiles')
            .select('id, full_name, wallet_balance, rfid_uid');

        if (pError) {
            console.error("Supabase Profiles Fetch Error:", pError);
            return res.status(500).json({ success: false, message: 'Database fetch error' });
        }

        const profile = profiles?.find(p => {
            if (!p.rfid_uid) return false;
            const dbUid = p.rfid_uid.replace(/\s+/g, '').toUpperCase();
            return dbUid === cleanUid || p.rfid_uid === rawUid;
        });

        if (!profile) {
            console.error(`❌ DENIED: Card [${rawUid}] is NOT linked to any user in Supabase.`);
            return res.status(200).json({ success: false, message: 'Card not registered' });
        }

        console.log(`👤 IDENTIFIED: ${profile.full_name} | Balance: ₹${profile.wallet_balance}`);

        // Update the last tap time
        await supabase.from('profiles').update({ last_tap_at: new Date().toISOString() }).eq('id', profile.id);

        // Process the tap
        const { data, error } = await supabase.rpc('process_rfid_tap', { scanned_uid: profile.rfid_uid });
        
        if (error) {
            console.error("Supabase RPC Error:", error);
            return res.status(500).json({ success: false, message: 'RPC execution failed' });
        }

        console.log(`✅ CONFORMATION: ${data.message}`);
        return res.status(200).json(data);
    } catch (e) {
        console.error("❌ Bridge Crash:", e.message);
        res.status(500).send("Bridge Error");
    }
};

// Route requests to the scanner logic
app.post('*', handleScan);

module.exports = app;
