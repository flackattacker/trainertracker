import Link from 'next/link';
import styles from '../page.module.css';

export default function About() {
  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1>Family Roots</h1>
              <span>Therapy & Wellness</span>
            </Link>
          </div>
          <div className={styles.navLinks}>
            <Link href="/about" className={styles.navLink}>About</Link>
            <Link href="/about#contact" className={styles.navLink}>Contact</Link>
          </div>
        </div>
      </nav>

      {/* About Section */}
      <section className={styles.aboutSection}>
        <div className={styles.sectionContent}>
          <h1 className={styles.aboutTitle}>About Family Roots</h1>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutContent}>
              <h2>Our Mission</h2>
              <p>
                At Family Roots Therapy and Wellness, we believe that true healing begins with understanding 
                the whole person. Our mission is to provide comprehensive therapy and wellness services that 
                address not just the symptoms, but the root causes of life's challenges.
              </p>
              
              <h2>Our Approach</h2>
              <p>
                We take a holistic approach to wellness, combining evidence-based therapeutic techniques 
                with personalized wellness programs. Our team of experienced professionals works together 
                to create integrated treatment plans that support your physical, mental, and emotional well-being.
              </p>
              
              <h2>Our Values</h2>
              <ul>
                <li><strong>Compassion:</strong> We approach every client with empathy and understanding</li>
                <li><strong>Excellence:</strong> We maintain the highest standards in all our services</li>
                <li><strong>Family-Centered:</strong> We recognize the importance of family in the healing process</li>
                <li><strong>Innovation:</strong> We continuously evolve our methods to provide the best care</li>
                <li><strong>Accessibility:</strong> We strive to make quality care available to everyone</li>
              </ul>
            </div>
            
            <div className={styles.aboutImage}>
              <div className={styles.imagePlaceholder}>
                <span>Team Photo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Our Team</h2>
          <div className={styles.teamGrid}>
            <div className={styles.teamCard}>
              <div className={styles.teamIcon}>👨‍⚕️</div>
              <h3>Licensed Therapists</h3>
              <p>Our team of licensed mental health professionals provides individual, family, and group therapy services.</p>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.teamIcon}>💪</div>
              <h3>Wellness Specialists</h3>
              <p>Certified fitness and wellness professionals who create personalized programs for physical health.</p>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.teamIcon}>👨‍👩‍👧‍👦</div>
              <h3>Family Counselors</h3>
              <p>Specialists in family dynamics who help strengthen relationships and improve communication.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={styles.contactSection}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Contact Us</h2>
          <div className={styles.contactGrid}>
            <div className={styles.contactInfo}>
              <h3>Get in Touch</h3>
              <p>Ready to begin your journey to wellness? We're here to help you take the first step.</p>
              
              <div className={styles.contactDetails}>
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>📍</span>
                  <div>
                    <h4>Address</h4>
                    <p>123 Wellness Way<br />Healing City, HC 12345</p>
                  </div>
                </div>
                
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>📞</span>
                  <div>
                    <h4>Phone</h4>
                    <p>(555) 123-4567</p>
                  </div>
                </div>
                
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>✉️</span>
                  <div>
                    <h4>Email</h4>
                    <p>info@familyrootswellness.com</p>
                  </div>
                </div>
                
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>🕒</span>
                  <div>
                    <h4>Hours</h4>
                    <p>Monday - Friday: 8:00 AM - 8:00 PM<br />
                    Saturday: 9:00 AM - 5:00 PM<br />
                    Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.contactForm}>
              <h3>Send us a Message</h3>
              <form className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Name *</label>
                  <input type="text" id="name" name="name" required />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email *</label>
                  <input type="email" id="email" name="email" required />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone</label>
                  <input type="tel" id="phone" name="phone" />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="service">Service Interest</label>
                  <select id="service" name="service">
                    <option value="">Select a service</option>
                    <option value="therapy">Therapy Services</option>
                    <option value="wellness">Wellness Programs</option>
                    <option value="family">Family Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="message">Message *</label>
                  <textarea id="message" name="message" rows={5} required></textarea>
                </div>
                
                <button type="submit" className={styles.primaryButton}>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>Family Roots Therapy & Wellness</h3>
            <p>Nurturing wellness, building strength, creating lasting change.</p>
          </div>
          <div className={styles.footerSection}>
            <h4>Quick Links</h4>
            <Link href="/" className={styles.footerLink}>Home</Link>
            <Link href="/about" className={styles.footerLink}>About Us</Link>
            <Link href="/about#contact" className={styles.footerLink}>Contact</Link>
            <Link href="/trainer" className={styles.footerLink}>Trainer Portal</Link>
            <Link href="/client" className={styles.footerLink}>Client Portal</Link>
          </div>
          <div className={styles.footerSection}>
            <h4>Contact Info</h4>
            <p>📍 123 Wellness Way, Healing City, HC 12345</p>
            <p>📞 (555) 123-4567</p>
            <p>✉️ info@familyrootswellness.com</p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2024 Family Roots Therapy & Wellness. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 