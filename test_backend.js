const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://knapkvcyanxqcrnaejlz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuYXBrdmN5YW54cWNybmFlamx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MDYyMTEsImV4cCI6MjA5MTk4MjIxMX0.2fz_rOQLrgofEhwe0crc61fNOEUd4XsfrcI1Jf7DY6w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runDiagnostics() {
    console.log("🚀 Starting DineXpress Backend Diagnostic...");
    
    // 1. Check Connection & Products
    console.log("\n📡 Checking Products Table...");
    const { data: products, error: pError } = await supabase.from('products').select('name').limit(5);
    if (pError) {
        console.error("❌ Products Table Error:", pError.message);
    } else {
        console.log("✅ Products Table Online. Found items like:", products.map(p => p.name).join(', '));
    }

    // 2. Check Profiles table
    console.log("\n👤 Checking Profiles Table...");
    const { error: prError } = await supabase.from('profiles').select('id').limit(1);
    if (prError) {
        console.error("❌ Profiles Table Error (Probably empty or RLS issue):", prError.message);
    } else {
        console.log("✅ Profiles Table Accessible.");
    }

    // 3. Test Write Access (Audit Logs)
    console.log("\n📝 Testing Write Access (Audit Logs)...");
    const { error: lError } = await supabase.from('user_logs').insert([{ 
        email: 'diagnostic@test.com', 
        event_type: 'backend_pulse_test' 
    }]);
    if (lError) {
        console.error("❌ Write Access Failed:", lError.message);
    } else {
        console.log("✅ Write Access Success! Backend is fully writeable.");
    }

    // 4. Check Orders Table
    console.log("\n🍜 Checking Orders Table Schema...");
    const { error: oError } = await supabase.from('orders').select('id').limit(1);
    if (oError) {
        console.error("❌ Orders Table Error:", oError.message);
    } else {
        console.log("✅ Orders Table Schema Valid.");
    }

    console.log("\n--- Final Status ---");
    if (!pError && !lError && !oError) {
        console.log("💎 BACKEND IS WORKING PROPERLY 💎");
    } else {
        console.log("⚠️ Backend has issues. Please run master_database_fix.sql.");
    }
}

runDiagnostics();
