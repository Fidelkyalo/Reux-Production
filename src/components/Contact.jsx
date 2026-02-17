
import React from 'react';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import './Contact.css';

export default function Contact() {
    return (
        <section id="contact" className="section contact-section">
            <div className="container">
                <div className="contact-grid">
                    <div className="contact-info">
                        <h2>Get In Touch</h2>
                        <p>Ready to start your project? Contact us today for a consultation.</p>

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

                        <div className="info-item">
                            <MapPin className="icon" />
                            <div>
                                <h4>Location</h4>
                                <p>Nairobi, Kenya</p>
                            </div>
                        </div>
                    </div>

                    <form
                        className="contact-form"
                        action="https://formsubmit.co/reuxproduction@gmail.com"
                        method="POST"
                    >
                        {/* Honeypot for spammers */}
                        <input type="text" name="_honey" style={{ display: 'none' }} />

                        {/* Disable Captcha to keep it simple */}
                        <input type="hidden" name="_captcha" value="false" />

                        {/* Success URL (optional, stay on page or go to thank you) */}
                        <input type="hidden" name="_next" value="http://localhost:5173" />

                        <div className="form-group">
                            <input type="text" name="name" placeholder="Your Name" required />
                        </div>
                        <div className="form-group">
                            <input type="email" name="email" placeholder="Your Email" required />
                        </div>
                        <div className="form-group">
                            <select name="service_type">
                                <option>Wedding Photography</option>
                                <option>Video Production</option>
                                <option>Portrait Session</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <textarea name="message" rows="5" placeholder="Tell us about your project" required></textarea>
                        </div>
                        <button type="submit" className="btn btn-accent">Send Message</button>
                    </form>
                </div>
            </div>

            <footer className="footer text-center">
                <p>&copy; {new Date().getFullYear()} REUX PRODUCTION. Crafted by <a href="https://fidel.pizzatechnologies.co.ke" target="_blank" rel="noopener noreferrer" className="footer-link">Fidel Kyalo</a>. All rights reserved.</p>
            </footer>
        </section>
    );
}
