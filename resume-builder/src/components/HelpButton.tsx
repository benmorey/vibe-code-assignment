import React, { useState } from 'react';

const HelpButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('/Little_Dude_Animations/Blink1Talk1.png');
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [displayedQuestions, setDisplayedQuestions] = useState<{question: string, answer: string}[]>([]);

  // Handle typing animation for questions when FAQ opens
  React.useEffect(() => {
    if (isOpen && currentQuestionIndex < faqs.length) {
      if (currentQuestionIndex === -1) {
        // Start with first question
        setCurrentQuestionIndex(0);
        setIsTyping(true);
        return;
      }

      const currentFaq = faqs[currentQuestionIndex];
      const fullText = currentFaq.question + ' ' + currentFaq.answer;
      let currentIndex = 0;
      let displayQuestion = '';
      let displayAnswer = '';

      const typeInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          currentIndex++;
          const typedText = fullText.substring(0, currentIndex);

          if (typedText.length <= currentFaq.question.length) {
            displayQuestion = typedText;
            displayAnswer = '';
          } else {
            displayQuestion = currentFaq.question;
            displayAnswer = typedText.substring(currentFaq.question.length + 1);
          }

          setDisplayedQuestions(prev => {
            const newArray = [...prev];
            newArray[currentQuestionIndex] = { question: displayQuestion, answer: displayAnswer };
            return newArray;
          });
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          // Move to next question after a brief delay
          setTimeout(() => {
            if (currentQuestionIndex < faqs.length - 1) {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
              setIsTyping(true);
            }
          }, 200);
        }
      }, 30); // 30ms per character

      return () => clearInterval(typeInterval);
    } else if (!isOpen) {
      setCurrentQuestionIndex(-1);
      setDisplayedQuestions([]);
      setIsTyping(false);
    }
  }, [isOpen, currentQuestionIndex]);

  // Handle character animation - rapid cycling while typing
  React.useEffect(() => {
    if (isTyping) {
      const talkFrames = [
        '/Little_Dude_Animations/Blink1Talk1.png',
        '/Little_Dude_Animations/Talk2.png'
      ];
      let frameIndex = 0;
      let frameCount = 0;

      const animationInterval = setInterval(() => {
        frameCount++;
        // Blink occasionally (every 20 frames = about every 2 seconds)
        if (frameCount % 20 === 0 && Math.random() < 0.3) {
          setCurrentImage('/Little_Dude_Animations/Blink2.png');
          setTimeout(() => {
            frameIndex = (frameIndex + 1) % talkFrames.length;
            setCurrentImage(talkFrames[frameIndex]);
          }, 100);
        } else {
          frameIndex = (frameIndex + 1) % talkFrames.length;
          setCurrentImage(talkFrames[frameIndex]);
        }
      }, 100); // Change frame every 100ms

      return () => clearInterval(animationInterval);
    } else {
      // When not typing, occasionally blink
      const scheduleAnimation = () => {
        const randomDelay = Math.random() * 3000 + 2000;
        setTimeout(() => {
          const shouldBlink = Math.random() < 0.3;

          if (shouldBlink) {
            setCurrentImage('/Little_Dude_Animations/Blink2.png');
            setTimeout(() => {
              setCurrentImage('/Little_Dude_Animations/Blink1Talk1.png');
              scheduleAnimation();
            }, 150);
          } else {
            scheduleAnimation();
          }
        }, randomDelay);
      };

      scheduleAnimation();
    }
  }, [isTyping]);

  const faqs = [
    {
      question: "How do I populate my profile from a PDF?",
      answer: "Click 'Populate with Resume' in the sidebar, then upload your existing resume PDF. Our AI will automatically extract and populate your information."
    },
    {
      question: "How do I generate a custom resume?",
      answer: "Go to 'Generate Resume', paste a job description, and click 'Generate Custom Resume'. The AI will tailor your resume to match the job requirements."
    },
    {
      question: "Can I edit the generated resume?",
      answer: "Yes! The resume preview is fully editable. Click on any text to edit it directly, then download as PDF when ready."
    },
    {
      question: "How do I save my profile?",
      answer: "Your profile is automatically saved as you type. You can also manually save anytime, and export your profile as a JSON file for backup."
    },
    {
      question: "What's the Interview Tutor feature?",
      answer: "Interview Tutor (coming soon) will help you practice mock interviews with AI-generated questions based on your profile and target role."
    },
    {
      question: "How does the Job Search work?",
      answer: "Job Search lets you browse remote job listings. Use filters to narrow results, or click 'Recommended Jobs' to see positions matching your profile."
    }
  ];

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
          border: 'none',
          color: '#FFFFFB',
          fontSize: '32px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
      >
        <img
          src={currentImage}
          alt="Help"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%'
          }}
        />
      </button>

      {/* FAQ Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '106px',
            right: '24px',
            width: '380px',
            maxHeight: '500px',
            background: '#FFFFFB',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            zIndex: 999,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, #16442d 0%, #3a855b 100%)',
            color: '#FFFFFB'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '500'
            }}>
              Frequently Asked Questions
            </h3>
          </div>

          <div style={{
            overflowY: 'auto',
            padding: '16px',
            flex: 1
          }}>
            {displayedQuestions.map((faq, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '16px',
                  paddingBottom: '16px',
                  borderBottom: index !== displayedQuestions.length - 1 ? '1px solid #e5e7eb' : 'none'
                }}
              >
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#003a1d'
                }}>
                  {faq.question}
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: '300',
                  color: '#003a1d',
                  lineHeight: '1.6'
                }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div style={{
            padding: '16px',
            borderTop: '1px solid #e5e7eb',
            background: '#f8f9fa',
            textAlign: 'center'
          }}>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: '300'
            }}>
              Need more help? Contact support@resumebuilder.com
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default HelpButton;
