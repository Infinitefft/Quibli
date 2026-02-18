import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <style>{`
        /* 1. Horizontal Movement: Linear Left to Right */
        @keyframes ball-run-x {
          0% { transform: translateX(-80px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(80px); opacity: 0; }
        }

        /* 2. Vertical Bouncing: Simulating gravity losses (Projectile -> Bounce -> Bounce -> Roll) */
        @keyframes ball-bounce-y {
          /* Initial Fall (The "Throw") */
          0% { transform: translateY(-40px); animation-timing-function: cubic-bezier(0.5, 0, 1, 1); } 
          25% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.5, 1); } /* Hit 1 */
          
          /* First Bounce */
          45% { transform: translateY(-25px); animation-timing-function: cubic-bezier(0.5, 0, 1, 1); } /* Peak 1 */
          65% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.5, 1); } /* Hit 2 */
          
          /* Second Bounce (Small) */
          80% { transform: translateY(-10px); animation-timing-function: cubic-bezier(0.5, 0, 1, 1); } /* Peak 2 */
          90% { transform: translateY(0); } /* Hit 3 */
          
          /* Roll out */
          100% { transform: translateY(0); } 
        }

        /* 3. Squash and Stretch: Deformation on impact for realism */
        @keyframes ball-squash {
          0%, 20% { transform: scale(1); }
          25% { transform: scale(1.4, 0.6); } /* Splat 1: Flatten on impact */
          30% { transform: scale(0.9, 1.1); } /* Stretch Up */
          
          45% { transform: scale(1); } /* Peak: Normal */
          
          62% { transform: scale(1); }
          65% { transform: scale(1.2, 0.8); } /* Splat 2 */
          68% { transform: scale(0.95, 1.05); }
          
          88% { transform: scale(1); }
          90% { transform: scale(1.1, 0.9); } /* Splat 3 */
          92% { transform: scale(1); }
          
          100% { transform: scale(1); }
        }

        /* 4. Shadow: Follows scale and opacity based on height */
        @keyframes ball-shadow {
          0% { transform: scale(0.5); opacity: 0.1; }
          25% { transform: scale(1); opacity: 0.3; } /* Hit 1 */
          45% { transform: scale(0.6); opacity: 0.1; }
          65% { transform: scale(1); opacity: 0.3; } /* Hit 2 */
          80% { transform: scale(0.8); opacity: 0.1; }
          90% { transform: scale(1); opacity: 0.3; } /* Hit 3 */
          100% { transform: scale(1); opacity: 0.3; }
        }

        .animate-ball-x {
          animation: ball-run-x 0.8s linear infinite;
        }

        .animate-ball-y {
          animation: ball-bounce-y 0.8s linear infinite;
        }
        
        .animate-ball-squash {
          animation: ball-squash 0.8s linear infinite;
        }

        .animate-ball-shadow {
          animation: ball-shadow 0.8s linear infinite;
        }
      `}</style>
      
      {/* Animation Stage */}
      <div className="flex flex-col items-center">
        
        {/* Wide container to allow horizontal travel */}
        <div className="relative w-48 h-20 flex items-center justify-center mb-6">
          
          {/* X Axis Wrapper: Controls Left-to-Right movement */}
          <div className="animate-ball-x flex flex-col items-center">
            
            {/* Y Axis Wrapper: Controls Bouncing */}
            <div className="animate-ball-y mb-1">
              {/* Deform Wrapper: Controls Squash & Stretch */}
              <div className="animate-ball-squash">
                <div className="w-5 h-5 bg-black rounded-full shadow-sm"></div>
              </div>
            </div>

            {/* Shadow Wrapper: Stays on 'ground' but follows X */}
            <div className="w-5 h-1.5 bg-black rounded-[100%] blur-[2px] animate-ball-shadow"></div>
            
          </div>

        </div>

        {/* Text */}
        <div className="text-black text-xs font-bold tracking-[0.3em] uppercase opacity-70">
          Loading...
        </div>

      </div>

    </div>
  );
};

export default Loading;