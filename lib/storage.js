const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const root = process.cwd();
const localDataPath = path.join(root, "data", "latest-dashboard.json");
const localUploadDir = path.join(root, "uploads");

function hasSupabase() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function client() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
}

async function getLatestDashboard() {
  if (hasSupabase()) {
    const supabase = client();
    const { data, error } = await supabase
      .from("dashboard_snapshots")
      .select("payload")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error && data?.payload) return data.payload;
  }

  return JSON.parse(fs.readFileSync(localDataPath, "utf8"));
}

async function saveDashboard(payload) {
  if (hasSupabase()) {
    const supabase = client();
    await supabase.from("dashboard_snapshots").update({ is_active: false }).eq("is_active", true);
    const { error } = await supabase.from("dashboard_snapshots").insert({
      is_active: true,
      payload
    });
    if (error) throw error;
    return;
  }

  fs.mkdirSync(path.dirname(localDataPath), { recursive: true });
  fs.writeFileSync(localDataPath, JSON.stringify(payload, null, 2));
}

async function saveUploadedFile(kind, file) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const originalName = file.originalFilename || `${kind}.xlsx`;
  const safeName = originalName.replace(/[^\w.\-]+/g, "_");
  const storagePath = `${kind}/${stamp}-${safeName}`;

  if (hasSupabase()) {
    const supabase = client();
    const bucket = process.env.SUPABASE_BUCKET || "produtividade-excel";
    const buffer = fs.readFileSync(file.filepath);
    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType: file.mimetype || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        upsert: false
      });
    if (error) throw error;
    return { kind, originalName, storagePath };
  }

  fs.mkdirSync(path.join(localUploadDir, kind), { recursive: true });
  const target = path.join(localUploadDir, kind, `${stamp}-${safeName}`);
  fs.copyFileSync(file.filepath, target);
  return { kind, originalName, storagePath: target };
}

module.exports = { getLatestDashboard, saveDashboard, saveUploadedFile };
