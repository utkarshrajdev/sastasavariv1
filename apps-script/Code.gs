/**
 * SastaSavari – Lead Capture Script
 * Saves every website lead into this Google Sheet, emails you a notification,
 * AND emails the customer a confirmation with their SastaSavari reference code
 * (if they gave an email address on the form).
 *
 * SETUP: paste this whole file into the Apps Script editor (Extensions > Apps
 * Script) attached to your Google Sheet, replacing the old Code.gs. Then
 * Deploy > Manage deployments > Edit (pencil icon) > New version > Deploy.
 * You do NOT need a new Web App URL — index.html / get-price.html keep using
 * the same SHEETS_URL.
 *
 * SENDER ADDRESS: for emails to actually come "From: sastasavari@gmail.com"
 * (FROM_EMAIL below), one of these must be true:
 *   (a) This Sheet + Apps Script project is owned by / opened while logged
 *       into the sastasavari@gmail.com Google account itself — nothing
 *       further needed, emails send as that account automatically.
 *   (b) The Sheet is owned by a different account (e.g. the one that
 *       receives NOTIFY_EMAIL below), in which case sastasavari@gmail.com
 *       must be added as a verified "Send mail as" alias on that account:
 *       Gmail → ⚙️ Settings → Accounts and Import → "Send mail as" →
 *       Add another email address → follow the verification email.
 * If FROM_EMAIL isn't a valid alias for the account running the script,
 * MailApp throws "Invalid 'from' address" — run testEmail() below after
 * setup to confirm before relying on it live.
 */

// ====== EDIT THESE LINES ======
var NOTIFY_EMAIL = "champaranconsultancyservices@gmail.com"; // email that receives lead alerts
var FROM_EMAIL   = "sastasavari@gmail.com";                  // address customer emails are sent FROM (see SENDER ADDRESS note above)
var FROM_NAME    = "SastaSavari";                             // friendly display name on outgoing emails
// ===============================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Leads")
             || SpreadsheetApp.getActiveSpreadsheet().insertSheet("Leads");

    // Add header row once
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Ref Code", "Name", "Phone", "Email", "Brand", "Category", "Buying Plan", "Area", "Message", "Source Page"]);
      sheet.getRange("A1:K1").setFontWeight("bold").setBackground("#e63912").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }

    // The client generates the reference code (so it can show it to the user
    // instantly without waiting on this no-cors call's unreadable response).
    // Fall back to generating one here in case an older cached page posts
    // without it.
    var refCode = data.refCode || genRefCode();

    sheet.appendRow([
      data.timestamp || new Date().toLocaleString("en-IN"),
      refCode,
      data.name || "",
      "'" + (data.phone || ""),   // apostrophe keeps leading digits as text
      data.email || "",
      data.brand || "",
      data.vehicle || "",
      data.buyplan || "",
      data.location || "",
      data.message || "",
      data.source || ""
    ]);

    // Email notification to admin
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      from: FROM_EMAIL,
      name: FROM_NAME,
      subject: "🏍️ New Lead [" + refCode + "]: " + data.name + " – " + data.vehicle,
      htmlBody:
        "<h2 style='color:#e63912'>New SastaSavari Lead</h2>" +
        "<table cellpadding='6' style='border-collapse:collapse;font-family:Arial'>" +
        row("Ref Code", refCode) +
        row("Name", data.name) +
        row("Phone", "<a href='tel:+91" + data.phone + "'>" + data.phone + "</a>") +
        row("WhatsApp", "<a href='https://wa.me/91" + data.phone + "'>Chat now</a>") +
        row("Email", data.email || "-") +
        row("Brand", data.brand) +
        row("Category", data.vehicle) +
        row("Buying Plan", data.buyplan) +
        row("Area", data.location) +
        row("Message", data.message || "-") +
        row("Time", data.timestamp) +
        "</table>"
    });

    // Confirmation email to the customer (only if they gave an email address)
    if (data.email) {
      try {
        MailApp.sendEmail({
          to: data.email,
          from: FROM_EMAIL,
          name: FROM_NAME,
          subject: "✅ SastaSavari – We got your query! Ref: " + refCode,
          htmlBody:
            "<h2 style='color:#e63912'>Thanks for reaching out to SastaSavari, " + (data.name || "") + "!</h2>" +
            "<p>We've received your query and our team will call/WhatsApp you within 30 minutes (9 AM – 8 PM).</p>" +
            "<p style='font-size:16px'>Your reference code: <strong style='background:#fdecea;color:#e63912;padding:4px 10px;border-radius:6px'>" + refCode + "</strong></p>" +
            "<p>Please quote this code whenever you call or WhatsApp us about this query.</p>" +
            "<table cellpadding='6' style='border-collapse:collapse;font-family:Arial'>" +
            row("Brand", data.brand) +
            row("Category", data.vehicle) +
            row("Buying Plan", data.buyplan) +
            row("Area", data.location) +
            row("Message", data.message || "-") +
            "</table>" +
            "<p>Need us sooner? WhatsApp us directly: <a href='https://wa.me/919523619389'>Chat now</a></p>" +
            "<p style='color:#888;font-size:12px'>SastaSavari – Motihari & Bettiah, East &amp; West Champaran</p>"
        });
      } catch (userMailErr) {
        // Don't fail the whole request if the customer's email bounces/is invalid
        Logger.log("Customer confirmation email failed: " + userMailErr);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true, refCode: refCode }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function row(label, value) {
  return "<tr><td style='border:1px solid #ddd;font-weight:bold'>" + label +
         "</td><td style='border:1px solid #ddd'>" + (value || "") + "</td></tr>";
}

// Server-side fallback ref-code generator (mirrors the client-side one in
// index.html / get-price.html) — only used if a request arrives without refCode.
function genRefCode() {
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I
  var code = "";
  for (var i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return "SS-" + code;
}

// Quick test: run this once from the editor to verify email + the
// FROM_EMAIL alias both work. Check the received email's "From" address —
// if it's NOT sastasavari@gmail.com, the alias isn't set up yet (see the
// SENDER ADDRESS note at the top of this file).
function testEmail() {
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    from: FROM_EMAIL,
    name: FROM_NAME,
    subject: "SastaSavari test",
    body: "Lead capture script is working! This should arrive From: " + FROM_EMAIL
  });
}
