const SHEET_PINS = "Pins";
const SHEET_REG = "Registrations";
const MAX_PINS_PER_PHONE = 5;
const REQUEST_DELAY_MS = 3000; // 3 seconds between requests

// ===== Serve Default Page =====
function doGet(e) {
  const page = (e?.parameter?.page) || "index"; // Default to index.html
  return HtmlService.createTemplateFromFile(page)
    .evaluate()
    .setTitle(getTitle(page));
}

function getTitle(page) {
  if (page === "admin") return "Admin Panel";
  if (page === "register") return "Delegate Registration";
  return "Welcome to SUDAI Youth Wing Camp 2025";
}

// ===== PIN Generation (Admin) =====
function generatePin(phone, adminKey) {
  try {
    const cache = CacheService.getUserCache();
    const lastGen = cache.get("lastGen");
    if (lastGen && (Date.now() - Number(lastGen) < REQUEST_DELAY_MS)) {
      return { success: false, message: "Please wait before generating another PIN." };
    }
    cache.put("lastGen", Date.now(), 60);

    phone = phone?.trim();
    adminKey = adminKey?.trim();
    const validKey = PropertiesService.getScriptProperties().getProperty("ADMIN_KEY");
    if (adminKey !== validKey) return { success: false, message: "Invalid Admin Key." };

    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    if (!phoneRegex.test(phone)) return { success: false, message: "Invalid phone number format." };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_PINS);
    if (!sheet) return { success: false, message: `"${SHEET_PINS}" sheet not found.` };

    const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    const count = rows.filter(r => r[0] === phone).length;
    if (count >= MAX_PINS_PER_PHONE) {
      return { success: false, message: `Max of ${MAX_PINS_PER_PHONE} PINs reached for this phone.` };
    }

    const pin = `SUDYW-${Utilities.getUuid()}`;
    sheet.appendRow([phone, pin, new Date(), "No"]);

    return { success: true, pin };
  } catch (err) {
    return { success: false, message: `Error: ${err.message}` };
  }
}

// ===== Delegate Registration =====
function registerDelegate(data) {
  try {
    const cache = CacheService.getUserCache();
    const lastReg = cache.get("lastReg");
    if (lastReg && (Date.now() - Number(lastReg) < REQUEST_DELAY_MS)) {
      return { success: false, message: "Please wait before submitting again." };
    }
    cache.put("lastReg", Date.now(), 60);

    const required = ["name", "phone", "pin", "gender", "address", "zone", "branch", "status"];
    for (let f of required) {
      if (!data[f]?.trim()) return { success: false, message: `Missing: ${f}` };
    }

    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    if (!phoneRegex.test(data.phone.trim())) return { success: false, message: "Invalid phone number format." };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const pinsSheet = ss.getSheetByName(SHEET_PINS);
    const regSheet = ss.getSheetByName(SHEET_REG);
    if (!pinsSheet || !regSheet) return { success: false, message: "Sheets missing." };

    const regPhones = regSheet.getRange(2, 2, regSheet.getLastRow() - 1, 1).getValues();
    if (regPhones.some(r => r[0] === data.phone.trim())) {
      return { success: false, message: "Phone number already registered." };
    }

    const all = pinsSheet.getDataRange().getValues();
    let rowIndex = -1;
    for (let i = 1; i < all.length; i++) {
      if (all[i][1] === data.pin && all[i][3] === "No") {
        rowIndex = i + 1;
        break;
      }
    }
    if (rowIndex < 0) return { success: false, message: "PIN invalid or already used." };

    regSheet.appendRow([
      data.name.trim(),
      data.phone.trim(),
      data.pin,
      data.gender.trim(),
      data.address.trim(),
      data.zone.trim(),
      data.branch.trim(),
      data.status.trim(),
      (data.email?.trim() || ""),
      new Date()
    ]);
    pinsSheet.getRange(rowIndex, 4).setValue("Yes");

    return { success: true, message: "Registration successful!" };
  } catch (err) {
    return { success: false, message: `Error: ${err.message}` };
  }
}
function testRegisterDelegate() {
  const data = {
    name: "John Doe",
    phone: "08012345678",
    pin: "SUDYW-xxxx-xxxx-xxxx", // use a real PIN from your Pins sheet
    gender: "Male",
    address: "Lagos",
    zone: "Zone A",
    branch: "Branch 1",
    status: "Active",
    email: "john@example.com"
  };
  const result = registerDelegate(data);
  Logger.log(result);
}
function testGeneratePin() {
  const result = generatePin("08012345678", "1234"); // phone, adminKey
  Logger.log(result);
}
