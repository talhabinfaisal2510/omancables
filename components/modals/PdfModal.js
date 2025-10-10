import { useState } from "react";

const A6_WIDTH = 297.6;
const A6_HEIGHT = 419.5;

export default function A6BadgeTest() {
  const [showPdf, setShowPdf] = useState(false);
  const [qrCode, setQrCode] = useState("");

  const generateQR = async () => {
    try {
      const QRCode = await import("qrcode");
      const url = await QRCode.default.toDataURL("TEST-TOKEN-12345", {
        width: 300,
        margin: 1,
      });
      setQrCode(url);
      setShowPdf(true);
    } catch (err) {
      alert("QR generation failed: " + err.message);
    }
  };

  const handlePrint = () => {
    const iframe = document.querySelector("iframe");
    if (iframe?.contentWindow) {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        alert("Print failed: " + err.message);
      }
    } else {
      alert("No iframe found");
    }
  };

  const styles = {
    container: {
      padding: "20px",
      maxWidth: "600px",
      margin: "0 auto",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    button: {
      padding: "12px 24px",
      fontSize: "16px",
      backgroundColor: "#2196f3",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      margin: "8px",
      minWidth: "120px",
    },
    buttonSecondary: {
      padding: "12px 24px",
      fontSize: "16px",
      backgroundColor: "#666",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      margin: "8px",
      minWidth: "120px",
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: "8px",
      width: "95%",
      height: "95%",
      maxWidth: "800px",
      maxHeight: "90vh",
      position: "relative",
      overflow: "hidden",
    },
    header: {
      position: "absolute",
      top: "8px",
      right: "8px",
      zIndex: 10,
      display: "flex",
      gap: "8px",
      backgroundColor: "rgba(255,255,255,0.95)",
      padding: "8px",
      borderRadius: "6px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    iconButton: {
      width: "40px",
      height: "40px",
      border: "none",
      backgroundColor: "transparent",
      cursor: "pointer",
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
    },
    iframeContainer: {
      width: "100%",
      height: "100%",
    },
  };

  const BadgePDFContent = () => {
    if (!qrCode) return null;

    const pdfStyles = `
      @page { size: ${A6_WIDTH}pt ${A6_HEIGHT}pt; margin: 0; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        width: ${A6_WIDTH}pt; 
        height: ${A6_HEIGHT}pt; 
        padding: 20pt;
        font-family: Arial, sans-serif;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .header {
        border-bottom: 2pt solid #2196f3;
        padding-bottom: 10pt;
        margin-bottom: 15pt;
      }
      .title {
        font-size: 18pt;
        font-weight: bold;
        color: #2196f3;
        text-align: center;
        margin-bottom: 5pt;
      }
      .event-name {
        font-size: 10pt;
        color: #666;
        text-align: center;
      }
      .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12pt;
      }
      .qr-section {
        text-align: center;
        margin: 10pt 0;
      }
      .qr-image {
        width: 120pt;
        height: 120pt;
      }
      .info-section {
        display: flex;
        flex-direction: column;
        gap: 8pt;
      }
      .info-row {
        margin-bottom: 6pt;
      }
      .label {
        font-size: 8pt;
        color: #666;
        text-transform: uppercase;
        margin-bottom: 2pt;
      }
      .value {
        font-size: 12pt;
        color: #333;
        font-weight: bold;
      }
      .token-section {
        background-color: #f5f5f5;
        padding: 8pt;
        border-radius: 4pt;
        text-align: center;
        margin-top: 10pt;
      }
      .token {
        font-size: 14pt;
        font-weight: bold;
        color: #2196f3;
        letter-spacing: 2pt;
      }
      .footer {
        margin-top: 15pt;
        padding-top: 10pt;
        border-top: 1pt solid #e0e0e0;
        text-align: center;
      }
      .footer-text {
        font-size: 7pt;
        color: #999;
      }
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Event Badge</title>
          <style>${pdfStyles}</style>
        </head>
        <body>
          <div class="header">
            <div class="title">EVENT BADGE</div>
            <div class="event-name">Tech Conference 2025</div>
          </div>

          <div class="main-content">
            <div class="qr-section">
              <img src="${qrCode}" class="qr-image" alt="QR Code" />
            </div>

            <div class="info-section">
              <div class="info-row">
                <div class="label">Name</div>
                <div class="value">John Doe</div>
              </div>

              <div class="info-row">
                <div class="label">Company</div>
                <div class="value">Tech Solutions Inc.</div>
              </div>

              <div class="info-row">
                <div class="label">Title</div>
                <div class="value">Senior Developer</div>
              </div>

              <div class="info-row">
                <div class="label">Badge ID</div>
                <div class="value">BADGE-001</div>
              </div>
            </div>

            <div class="token-section">
              <div class="token">TEST-12345</div>
            </div>
          </div>

          <div class="footer">
            <div class="footer-text">
              This badge is valid for the duration of the event
            </div>
          </div>
        </body>
      </html>
    `;

    return htmlContent;
  };

  return (
    <div style={styles.container}>
      <h1 style={{ marginBottom: "20px" }}>A6 Badge Print Test</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <p style={{ marginBottom: "10px", color: "#666" }}>
          Click the button below to generate and view an A6-sized badge.
          Then use the print button to test printing on your mobile device.
        </p>
        <p style={{ fontSize: "14px", color: "#999" }}>
          <strong>A6 Size:</strong> 105mm × 148mm (4.1" × 5.8")
        </p>
      </div>

      <button style={styles.button} onClick={generateQR}>
        Generate Badge
      </button>

      {showPdf && (
        <div style={styles.modal} onClick={() => setShowPdf(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.header}>
              <button
                style={{ ...styles.iconButton, color: "#2196f3" }}
                onClick={handlePrint}
                title="Print Badge"
              >
                🖨️
              </button>
              <button
                style={styles.iconButton}
                onClick={() => setShowPdf(false)}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div style={styles.iframeContainer}>
              <iframe
                srcDoc={BadgePDFContent()}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                title="Badge Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}