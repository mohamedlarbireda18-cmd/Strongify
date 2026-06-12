
import React from 'react';
import { useContactForm } from '../../../hooks/useContactForm';
import './Contact.css';

const faqs = [
  {
    q: 'How does workout tracking work?',
    a: 'Simply log your exercises, sets, reps, and weights during your workout. Our app automatically calculates volume, tracks progression, and identifies new personal records.'
  },
  {
    q: 'Can I create custom exercises?',
    a: 'Yes! In addition to our library of 100+ exercises, you can create custom exercises with your own parameters and tracking preferences.'
  },
  {
    q: 'Is there a mobile version?',
    a: 'Our app is fully responsive and works great on mobile devices. A native mobile app is also in development.'
  },
  {
    q: 'Can I import my previous workouts?',
    a: 'Yes, you can import data from CSV files or connect with popular fitness apps to transfer your workout history.'
  },
  {
    q: 'Is the app free?',
    a: 'We offer a free tier with core features. Premium features including advanced analytics and custom programs are available with our Pro plan.'
  },
  {
    q: 'How are PRs calculated?',
    a: 'PRs are automatically detected based on your historical data for each exercise, considering max weight, max reps at a given weight, and estimated 1RM.'
  }
];

export const Contact: React.FC = () => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const { formData, formState, updateField, handleSubmit, resetForm } = useContactForm();

  const getButtonContent = () => {
    if (formState.isSubmitting) {
      return (
        <>
          <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10" />
          </svg>
          Sending...
        </>
      );
    }

    if (formState.isSuccess) {
      return '✅ Message Sent Successfully!';
    }

    return 'Send Message';
  };

  return (
    <section id="contact" className="contact">
      <div className="section-container">
        <div className="section-header animate-on-scroll">
          <div className="section-badge">💬 Contact</div>
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">
            Questions, feedback, or partnership inquiries? We'd love to hear from you.
          </p>
        </div>
        
        <div className="contact-grid">
          <div className="animate-on-scroll">
            <form className="contact-form" onSubmit={handleSubmit}>
              {/* Message d'erreur */}
              {formState.isError && (
                <div className="form-message form-message-error">
                  <span>⚠️</span>
                  <p>{formState.errorMessage}</p>
                  <button 
                    type="button" 
                    className="form-message-close"
                    onClick={() => resetForm()}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Message de succès */}
              {formState.isSuccess && (
                <div className="form-message form-message-success">
                  <span>🎉</span>
                  <p>Thank you for your message! We'll get back to you soon.</p>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                  disabled={formState.isSubmitting}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={e => updateField('email', e.target.value)}
                  disabled={formState.isSubmitting}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={e => updateField('subject', e.target.value)}
                  disabled={formState.isSubmitting}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Your message..."
                  value={formData.message}
                  onChange={e => updateField('message', e.target.value)}
                  disabled={formState.isSubmitting}
                  rows={5}
                  required 
                />
              </div>

              <button 
                type="submit" 
                className={`form-submit ${formState.isSubmitting ? 'submitting' : ''} ${formState.isSuccess ? 'success' : ''}`}
                disabled={formState.isSubmitting}
              >
                {getButtonContent()}
              </button>
            </form>
          </div>
          
          <div className="animate-on-scroll">
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
                  <button 
                    className="faq-question"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    {faq.q}
                    <span className="faq-icon">+</span>
                  </button>
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
