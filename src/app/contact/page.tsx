"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { track } from '@/lib/tracking';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube, FaPinterest } from 'react-icons/fa';

// Same icon set and styling as the Footer.
const SOCIALS = [
  { label: 'Facebook', icon: FaFacebookF },
  { label: 'Instagram', icon: FaInstagram },
  { label: 'WhatsApp', icon: FaWhatsapp },
  { label: 'YouTube', icon: FaYoutube },
  { label: 'Pinterest', icon: FaPinterest },
];

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const EMPTY_FORM: FormState = { name: '', email: '', subject: '', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Persists the message to Supabase (contact_messages, INSERT-only RLS —
  // the same pattern as the newsletter forms): inline validation, real
  // insert, friendly error messages, no native browser tooltips.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.message.trim().length < 5) {
      setError('Please write a slightly longer message.');
      return;
    }
    setSending(true);
    const { error: insertError } = await supabase.from('contact_messages').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    setSending(false);
    if (insertError) {
      setError('Something went wrong — please try again in a moment.');
      return;
    }
    setSubmitted(true);
    track('contact_submit');
  };

  const inputClasses =
    'w-full px-4 py-2 border border-text-heading/20 rounded-md text-text-heading placeholder-text-body focus:outline-none focus:ring-2 focus:ring-accent';

  return (
    <section className="min-h-[calc(100vh-64px)] bg-bg-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-text-heading mb-2">Contact Us</h1>
        <p className="text-text-body mb-10">
          Have a question, feedback, or a product you want us to review next? Tell us below —
          we read every message.
        </p>

        {/* items-start keeps both columns top-aligned. lg:mt-7 (28px) then anchors
            the sidebar to the FORM'S FIRST FIELD, not the column top: the Name
            label's line box (text-sm = 20px) + its mb-2 (8px) = 28px sit above the
            input, so the "Email us" card's top edge lands exactly on the input's
            top edge. If the Name label's size/margin ever changes, recompute this. */}
        <div className="grid gap-10 lg:grid-cols-5 lg:items-start">
          {/* Form (3/5 on desktop) */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div
                role="status"
                className="bg-text-on-dark border border-text-heading/10 rounded-lg p-8 text-center"
              >
                <div className="text-3xl mb-3">🎉</div>
                <h2 className="text-xl font-bold text-text-heading mb-2">Message sent!</h2>
                <p className="text-text-body mb-6">
                  Thanks for reaching out — your message is in our inbox and
                  we&apos;ll get back to you soon.
                </p>
                <button
                  onClick={() => {
                    setForm(EMPTY_FORM);
                    setSubmitted(false);
                  }}
                  className="px-6 py-2.5 border border-accent text-accent font-medium rounded-md hover:bg-accent/10 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-text-heading mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-text-heading mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-text-heading mb-2"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="What is it about?"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-text-heading mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Write your message…"
                    className={inputClasses}
                  />
                </div>
                {error && (
                  <p role="alert" className="text-sm text-danger">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className="px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Contact info (2/5 on desktop) — mt only on lg+ where the columns
              sit side by side; on mobile the sidebar stacks below the form */}
          <div className="lg:col-span-2 lg:mt-7 space-y-6">
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-5">
              <h2 className="text-base font-semibold text-text-heading mb-2">Email us</h2>
              <a
                href="mailto:hello@techbd.com"
                className="text-accent hover:text-accent-hover font-medium"
              >
                hello@techbd.com
              </a>
              <p className="text-xs text-text-body mt-2">
                Placeholder address — we&apos;ll swap in our real inbox once it&apos;s live.
              </p>
            </div>

            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-5">
              <h2 className="text-base font-semibold text-text-heading mb-3">Follow us</h2>
              <div className="flex flex-wrap gap-3">
                {SOCIALS.map(({ label, icon: Icon }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-bg-dark-secondary hover:bg-bg-dark-secondary/70"
                  >
                    <Icon className="h-5 w-5 text-text-on-dark" />
                  </a>
                ))}
              </div>
              <p className="text-xs text-text-body mt-3">
                Deal alerts, review updates and behind-the-scenes from our testing bench.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
