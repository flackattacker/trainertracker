'use client';

import Link from 'next/link';
import styles from './page.module.css';
import { ThemeToggle } from '../src/components/ThemeToggle';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <img 
              src="/logo.png" 
              alt="Family Roots Therapy & Wellness Logo" 
              className={styles.logoImage}
            />
          </div>
          <div className={styles.navLinks}>
            <Link href="/about" className={styles.navLink}>About</Link>
            <Link href="/about#contact" className={styles.navLink}>Contact</Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Nurturing Wellness, 
            <span className={styles.highlight}> Building Strength</span>
          </h1>
          <p className={styles.heroSubtitle}>
            At Family Roots Therapy and Wellness, we believe in creating lasting change through 
            personalized therapy and wellness programs that address the whole person.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/trainer" className={styles.primaryButton}>
              Trainer Portal
            </Link>
            <Link href="/client" className={styles.secondaryButton}>
              Client Portal
            </Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <img 
            src="/hero-image.jpg" 
            alt="Personal Training and Wellness" 
            className={styles.heroImage}
          />
        </div>
      </section>

      {/* Services Section */}
      <section className={styles.services}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Our Services</h2>
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>🧘</div>
              <h3>Therapy Services</h3>
              <p>Comprehensive mental health support through individual, family, and group therapy sessions.</p>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>💪</div>
              <h3>Wellness Programs</h3>
              <p>Personalized fitness and wellness programs designed to improve physical and mental health.</p>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>👨‍👩‍👧‍👦</div>
              <h3>Family Support</h3>
              <p>Specialized programs to strengthen family bonds and improve communication.</p>
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
            <Link href="/about" className={styles.footerLink}>About Us</Link>
            <Link href="/about#contact" className={styles.footerLink}>Contact</Link>
            <Link href="/trainer" className={styles.footerLink}>Trainer Portal</Link>
            <Link href="/client" className={styles.footerLink}>Client Portal</Link>
          </div>
          <div className={styles.footerSection}>
            <h4>Contact Info</h4>
            <p>📍 [Address Placeholder]</p>
            <p>📞 [Phone Placeholder]</p>
            <p>✉️ [Email Placeholder]</p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2024 Family Roots Therapy & Wellness. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
