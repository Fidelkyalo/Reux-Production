
import React, { useState, useEffect } from 'react';
import { Star, Send, Loader2, MessageSquare } from 'lucide-react';
import { supabase, isConfigured } from '../conf/supabase';
import './RateUs.css';

export default function RateUs() {
    const [name, setName] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [clientType, setClientType] = useState('WEDDINGS');
    const [otherClientType, setOtherClientType] = useState('');
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const PREDEFINED_TYPES = [
        'WEDDINGS',
        'NATURE',
        'STUDIO',
        'BURIAL',
        'GRADUATION',
        'PROPOSAL',
        'DOWRY PAYMENT',
        'SHOOT',
        'WORK',
        'OPEN AIR',
        'LIVE RECORDING',
        'OTHER'
    ];

    useEffect(() => {
        if (isConfigured) {
            fetchReviews();
        }
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('client_reviews')
            .select('*')
            .filter('is_approved', 'eq', true)
            .order('created_at', { ascending: false })
            .limit(6);

        if (data) setReviews(data);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !comment) {
            setMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }

        if (clientType === 'OTHER' && !otherClientType) {
            setMessage({ type: 'error', text: 'Please specify your task/type' });
            return;
        }

        setSubmitting(true);
        const { error } = await supabase
            .from('client_reviews')
            .insert([{
                name,
                rating,
                comment,
                client_type: clientType,
                other_client_type: clientType === 'OTHER' ? otherClientType : null
            }]);

        if (error) {
            setMessage({ type: 'error', text: 'Failed to submit review. Please try again.' });
        } else {
            setMessage({ type: 'success', text: 'Thank you for your rating! It will be visible soon.' });
            setName('');
            setComment('');
            setRating(5);
            setClientType('WEDDINGS');
            setOtherClientType('');
            fetchReviews();
        }
        setSubmitting(false);

        // Clear message after 5 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    return (
        <section id="rate-us" className="section rate-us-section">
            <div className="container">
                <div className="rate-us-grid">
                    <div className="rate-us-form-container">
                        <div className="section-header">
                            <h2 className="section-title">Rate Our Work</h2>
                            <p>Your feedback helps us continue capturing masterpieces. Share your experience with us!</p>
                        </div>

                        <form onSubmit={handleSubmit} className="rate-form">
                            <div className="form-group-row">
                                <div className="form-group">
                                    <label>Your Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Type of Client</label>
                                    <select
                                        value={clientType}
                                        onChange={(e) => setClientType(e.target.value)}
                                        required
                                    >
                                        {PREDEFINED_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {clientType === 'OTHER' && (
                                <div className="form-group fade-in">
                                    <label>Specify Task / Client Type</label>
                                    <input
                                        type="text"
                                        value={otherClientType}
                                        onChange={(e) => setOtherClientType(e.target.value)}
                                        placeholder="e.g. Birthday Party, Corporate Event"
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Your Rating</label>
                                <div className="star-rating">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={`star-btn ${rating >= star ? 'active' : ''}`}
                                            onClick={() => setRating(star)}
                                        >
                                            <Star fill={rating >= star ? "#d4af37" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Your Experience</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us what you liked about REUX Production..."
                                    rows="10"
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className="btn-accent submit-btn" disabled={submitting}>
                                {submitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Submit Rating</>}
                            </button>

                            {message.text && (
                                <div className={`form-message ${message.type}`}>
                                    {message.text}
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="reviews-display">
                        <h3 className="flex items-center gap-2">
                            <MessageSquare className="text-accent" /> Recent Reviews
                        </h3>

                        {loading ? (
                            <div className="loading-reviews">
                                <Loader2 className="animate-spin" />
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="no-reviews">
                                <p>Be the first to leave a review!</p>
                            </div>
                        ) : (
                            <div className="reviews-list">
                                {reviews.map((review) => (
                                    <div key={review.id} className="review-item fade-in">
                                        <div className="review-top">
                                            <div>
                                                <h4>{review.name}</h4>
                                                <span className="client-badge">
                                                    {review.client_type === 'OTHER' ? review.other_client_type : review.client_type}
                                                </span>
                                            </div>
                                            <div className="review-stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        fill={i < review.rating ? "#d4af37" : "none"}
                                                        color={i < review.rating ? "#d4af37" : "#444"}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="review-comment-text">{review.comment}</p>
                                        <span className="review-date">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
