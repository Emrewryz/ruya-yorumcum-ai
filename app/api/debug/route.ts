import { NextResponse } from "next/server";
import { SHOPIER_CONFIG } from "@/utils/shopier"; // Config dosyanı import et

export async function GET() {
  const apiKey = process.env.SHOPIER_API_KEY;
  const apiSecret = process.env.SHOPIER_API_SECRET;

  return NextResponse.json({
    status: "Check",
    apiKey_Durumu: apiKey ? "Yüklü ✅" : "YOK ❌",
    apiKey_Ilk3Hane: apiKey ? apiKey.substring(0, 3) : "---",
    apiSecret_Durumu: apiSecret ? "Yüklü ✅" : "YOK ❌",
    apiSecret_Ilk3Hane: apiSecret ? apiSecret.substring(0, 3) : "---",
    config_WebsiteIndex: SHOPIER_CONFIG.websiteIndex,
    config_Icinden_Key: SHOPIER_CONFIG.apiKey ? "Config Okuyor ✅" : "Config Okumuyor ❌"
  });
}