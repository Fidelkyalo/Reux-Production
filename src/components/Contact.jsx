
import React from 'react';
import { Mail, Phone, MessageCircle } from 'lucide-react';
import './Contact.css';

export default function Contact() {
    return (
        <section id="contact" className="section contact-section">
            <div className="container">
                <div className="contact-info-focused">
                    <div className="section-header text-center">
                        <h2>Get In Touch</h2>
                        <p>Ready to capture your milestones? Contact us today for bookings and inquiries.</p>
                    </div>

                    <div className="contact-links-grid">
                        <div className="info-item">
                            <Mail className="icon" />
                            <div>
                                <h4>Email</h4>
                                <a href="mailto:reuxproduction@gmail.com">reuxproduction@gmail.com</a>
                            </div>
                        </div>

                        <div className="info-item">
                            <Phone className="icon" />
                            <div>
                                <h4>Phone</h4>
                                <a href="tel:+254757417140">+254 757 417140</a>
                            </div>
                        </div>

                        <div className="info-item">
                            <MessageCircle className="icon" />
                            <div>
                                <h4>WhatsApp</h4>
                                <a href="https://wa.me/254757417140" target="_blank" rel="noopener noreferrer">+254 757 417140</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="footer text-center">
                <p>&copy; {new Date().getFullYear()} REUX PRODUCTION. Crafted by <a href="https://fidel.pizzatechnologies.co.ke" target="_blank" rel="noopener noreferrer" className="footer-link">Fidel Kyalo</a>. All rights reserved.</p>
            </footer>
        </section>
    );
}
