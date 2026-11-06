import React, { useState } from 'react';
import { submitFeedback } from '../lib/api';
import { Locale } from '../lib/i18n';
import { Star, MessageSquareHeart, X, CheckCircle2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  showToast: (msg: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  locale,
  showToast,
}) => {
  const [role, setRole] = useState<'donor' | 'receiver'>('donor');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isHi = locale === 'hi';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast(isHi ? 'कृपया अपना संदेश या अनुभव साझा करें' : 'Please enter your feedback message');
      return;
    }

    setSubmitting(true);
    try {
      await submitFeedback({ role, rating, message });
      showToast(isHi ? 'आपकी प्रतिक्रिया के लिए धन्यवाद!' : 'Thank you for your valuable feedback!');
      onClose();
      setMessage('');
      setRating(5);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <MessageSquareHeart className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-base">
              {isHi ? 'प्रतिक्रिया एवं सुझाव' : 'Platform Feedback & Suggestions'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isHi ? 'आपकी भूमिका' : 'Your Role with UDAAN'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('donor')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  role === 'donor'
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {isHi ? 'रक्तदाता (Donor)' : 'Blood Donor'}
              </button>
              <button
                type="button"
                onClick={() => setRole('receiver')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  role === 'receiver'
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {isHi ? 'मरीज परिजन (Receiver)' : 'Patient / Attendant'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isHi ? 'अनुभव रेटिंग (1 - 5 सितारे)' : 'Experience Rating'}
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isHi ? 'अपने विचार या सुधार के सुझाव साझा करें *' : 'Feedback Message *'}
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isHi
                  ? 'उड़ान के साथ आपका अनुभव कैसा रहा? हम इसे और बेहतर कैसे बना सकते हैं?'
                  : 'How was your experience using UDAAN? Any improvements or suggestions?'
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
          >
            {submitting ? 'Submitting...' : isHi ? 'प्रतिक्रिया भेजें' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};
