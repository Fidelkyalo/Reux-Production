
import React from 'react';
import './Testimonials.css';

export default function Testimonials() {
    const testimonials = [
        {
            id: 1,
            name: "Sarah & James",
            text: "Reux Production captured our wedding beautifully. The attention to detail was amazing! We are so happy with our photos/video.",
            role: "Wedding Clients"
        },
        {
            id: 2,
            name: "Michael K.",
            text: "Professional, creative, and easy to work with. Highly recommended for any event. The team made us feel very comfortable.",
            role: "Event Client"
        },
        {
            id: 3,
            name: "Emily R.",
            text: "The best videography team we've worked with. The final video was cinematic and emotional. Totally worth it!",
            role: "Creative Director"
        }
    ];

    return (
        <section id="testimonials" className="section testimonials-section">
            <div className="container">
                <h2 className="section-title text-center">Client Words</h2>
                <div className="testimonials-grid">
                    {testimonials.map((t) => (
                        <div key={t.id} className="testimonial-card">
                            <div className="quote-icon">“</div>
                            <p className="testimonial-text">{t.text}</p>
                            <div className="testimonial-author">
                                <h4>{t.name}</h4>
                                <span>{t.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
