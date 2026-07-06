import React, { useState } from 'react';
import styles from './EulaView.module.css';

const EulaView = ({ onAccept }) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className={styles.eulaContainer}>
      <div className={styles.eulaBox}>
        <h1 className={styles.eulaTitle}>End User License Agreement</h1>
        <p className={styles.eulaSubtitle}>
          Please read and accept the terms before opening the application.
        </p>

        <div className={styles.eulaScrollContent}>
          <h3>1. Relationship to Spotify</h3>
          <p>
            This Service is an independent application. It uses the Spotify Web API but is not 
            endorsed, certified, or otherwise approved by Spotify Media S.E. or its affiliates ("Spotify").
          </p>

          <h3>2. Disclaimer of Warranties</h3>
          <p>
            No warranties or representations are made on behalf of Spotify. The developer and Spotify 
            expressly disclaim all implied warranties with respect to the Spotify Platform, Spotify 
            Service, and Spotify Content, including but not limited to the implied warranties of 
            merchantability, fitness for a particular purpose, and non-infringement.
          </p>

          <h3>3. Prohibited Conduct and Content Protection</h3>
          <p>
            You are strictly prohibited from modifying, altering, or creating derivative works based 
            on the Spotify Platform, Spotify Service, or Spotify Content. You shall not decompile, 
            reverse-engineering, disassemble, or otherwise reduce the Spotify Platform, Spotify 
            Service, or Spotify Content to source code or any other human-perceivable form to the 
            full extent allowed by law. Facilitating stream ripping or making permanent copies of 
            Spotify Content is absolutely forbidden.
          </p>

          <h3>4. Product Responsibility and Limitation of Liability</h3>
          <p>
            The developer is solely responsible for this application, its operation, and user support. 
            To the maximum extent permitted by applicable law, any and all liability on the part of 
            third parties, including Spotify, its affiliates, and content providers, is expressly disclaimed.
          </p>

          <h3>5. Third-Party Beneficiary</h3>
          <p>
            You expressly acknowledge and agree that Spotify is a third-party beneficiary of this 
            End User License Agreement (EULA) and our privacy practices. Spotify is legally entitled 
            to directly enforce the provisions, restrictions, and protections of this Agreement 
            against you.
          </p>

          <h3>6. Account Disconnection and Data Deletion</h3>
          <p>
            You can disconnect your Spotify account from this application at any time through the 
            provided user interface or by revoking permissions in your Spotify account settings. 
            Upon disconnection, the application will instantly cease requesting your data and will 
            permanently and securely erase all your stored Spotify Personal Data. The sale of any 
            Spotify Content or data obtained via this service is strictly prohibited.
          </p>

          <h3>7. Privacy Practices and Technical Cookies</h3>
          <p>
            Your data collection and use are strictly limited to the operation of this service. This 
            application does not use tracking, marketing, or analytical cookies, and does not allow 
            third parties to place cookies on your browser to monitor browsing activities. To provide 
            its core service, the application utilizes strictly necessary technical cookies and local 
            storage solely to securely manage your Spotify OAuth session and refresh tokens. You can 
            manage or disable these through your browser options, though doing so will disable the application. 
            For any inquiries regarding your data, you may contact the developer directly.
          </p>
          
          <h3>8. Governing Law and Jurisdiction</h3>
          <p>
            This Agreement and the relationship between you and the developer shall be governed by 
            and construed in accordance with the laws of the Republic of Poland. Any disputes arising 
            directly under this EULA shall be resolved by the competent courts in Poland. However, 
            you acknowledge that Spotify's intellectual property and platform integration remain 
            subject to Spotify's global terms and jurisdictions.
          </p>
          
          <div className={styles.pdfDownloadBox}>
            <a 
              href="/TestEULA.pdf" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.pdfLink}
            >
              📄 Open full EULA as PDF
            </a>
          </div>
        </div>

        <div className={styles.eulaForm}>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              className={styles.checkboxInput}
              checked={accepted} 
              onChange={() => setAccepted(!accepted)} 
            />
            <span className={styles.checkboxCustom}></span>
            <span className={styles.checkboxText}>
              I have read and I accept the EULA, and I acknowledge 
              the use of strictly necessary technical cookies.
            </span>
          </label>

          <button 
            className={styles.acceptButton} 
            onClick={onAccept} 
            disabled={!accepted}
          >
            Agree & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default EulaView;