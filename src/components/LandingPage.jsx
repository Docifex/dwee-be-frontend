// src/components/LandingPage.jsx

/**
 * LandingPage.jsx
 * Renders the Dwee.be landing page with animated bouncing balls,
 * header, panels for MSAL login and access request form.
 * Authentication via AuthWrapper (Azure AD B2C).
 */
import React, { useRef, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import AuthWrapper from './AuthWrapper';
import { COLOR_ARRAY } from '../theme/colors.js';
import DWEEbeInteractiveStory from './dweebeInteractiveStory.js';

// Returns a random number between min and max
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

// Ball represents a bouncing circle with text
class Ball {
  constructor(x, y, vx, vy, r, ballColor, textColor) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.r = r; this.color = ballColor;
    this.textColor = textColor;
    this.text = 'DWEE.BE';
    this.strokeColor = '#f7f7b0ff';
    this.strokeWidth = 0.5;
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.lineWidth = this.strokeWidth;
    ctx.strokeStyle = this.strokeColor;
    ctx.stroke();

    ctx.fillStyle = this.textColor;
    // below sets the font size and style for the text 'DWEE.BE'
    ctx.font = `bold ${this.r * 0.6}px 'Arial Rounded MT Bold', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }

  update(canvas, others) {
    const headerHeight = this.r * 2;
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off vertical walls
    if (this.x - this.r < 0 || this.x + this.r > canvas.width) this.vx *= -1;
    // Bounce off header or bottom
    if (this.y - this.r < headerHeight) {
      this.vy *= -1;
      this.y = headerHeight + this.r;
    } else if (this.y + this.r > canvas.height) {
      this.vy *= -1;
    }
    // Ball collisions
    others.forEach(other => {
      if (other === this) return;
      const dx = other.x - this.x;
      const dy = other.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < this.r + other.r) {
        [this.vx, other.vx] = [other.vx, this.vx];
        [this.vy, other.vy] = [other.vy, this.vy];
      }
    });
  }
}

/**
 * LandingPageUI: core animation and panel interactions
 */
function LandingPageUI() {
  const { instance } = useMsal();
  const canvasRef = useRef(null);
  const [showPanels, setShowPanels] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  // Track click for Sign-In button
  const [clickedSignIn, setClickedSignIn] = useState(false);

  // Handler for sign-in click
  const handleSignIn = async () => {
    console.log('Sign-in button clicked');
    setClickedSignIn(true);
    //alert('You clicked on me!');
    try {
      await instance.loginRedirect();
    } catch (e) {
      console.error('Login redirect error:', e);
      alert(`Login failed: ${e.errorCode || e.message}`);
    }
  };
  

  const BALL_RADIUS = 24;
  const BALL_DIAMETER = BALL_RADIUS * 2;
  const PANEL_SIZE = BALL_DIAMETER * 6;

  // Canvas animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

// Create 55 bouncing balls with distinct colors
    // Use COLOR_ARRAY for ball and text colors 

// Indices of colors we want to avoid for text (e.g., too dark against the dark background)
    // We can list multiple indices separated by commas
    const disallowedTextIndices = [0, 8, 10, 11, 14];

// Indicies of color pairs we want to avoid for text and ball color due to contrast issues
    // For example, if we want to avoid pairing pink with red, we can list those indices
    const forbiddenPairs = [ [2 ,6], [6,2], [6,7], [7,6], [10,11], [11,10], [0,14], [14,0], [0,11], 
    [11,0], [10,14],[11,14], [3,12], [12,3], [3,6], [7,6], [6,7], [6,3], [4,5], [5,4], [1,5], [5,1], 
    [1,4], [4,1], [2,9], [9,2], [3,7], [7,3] ];

    // Generate balls with distinct ball and text colors
    const balls = Array.from({ length: 55 }, () => {
      const ballIdx = Math.floor(Math.random() * COLOR_ARRAY.length);
      let textIdx;
      do {
        textIdx = Math.floor(Math.random() * COLOR_ARRAY.length);
      } while (
        textIdx === ballIdx ||
        disallowedTextIndices.includes(textIdx) ||
        forbiddenPairs.some(([bIdx, tIdx]) => bIdx === ballIdx && tIdx === textIdx)
      );

  return new Ball(
    randomBetween(BALL_RADIUS, width - BALL_RADIUS),
    randomBetween(BALL_RADIUS, height - BALL_RADIUS),
    randomBetween(-2, 2),
    randomBetween(-2, 2),
    BALL_RADIUS,
    COLOR_ARRAY[ballIdx],  // ball color
    COLOR_ARRAY[textIdx]   // text color
  );
});

    let anim;
    const render = () => {
      ctx.fillStyle = COLOR_ARRAY[14];
      ctx.fillRect(0, 0, width, height);
      balls.forEach(b => { b.update(canvas, balls); b.draw(ctx); });
      anim = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Style objects
  const headerStyle = {
    position: 'absolute', top: 0, left: 0, width: '100%',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    // independent paddings:
    paddingTop: '0px',
    paddingBottom: '0px',
    paddingLeft: '10px',   // adjust left padding as needed
    paddingRight: '30px',  // adjust right padding as needed
    //height: `${BALL_DIAMETER}px`,  
    background: COLOR_ARRAY[11], color: '#fff', zIndex: 2, height: `${BALL_DIAMETER}px`,
    //background: COLOR_ARRAY[11], color: '#fff', zIndex: 2
  };
  /** 
  const buttonStyle = { 
    width: `${BALL_DIAMETER}px`, height: `${BALL_DIAMETER}px`, borderRadius: '50%',
    border: 'none', backgroundColor: COLOR_ARRAY[4], color: '#fff', cursor: 'pointer', fontWeight: 'bold'
    // the code above sets the button to be a circle with the same diameter as the balls 
  };
  */

  const buttonStyle = {
    padding: '8px 16px', borderRadius: '4px',
    border: 'none', backgroundColor: COLOR_ARRAY[4], color: COLOR_ARRAY[12],
    cursor: 'pointer', fontWeight: 'bold',
    fontSize: '1em', marginRight: '10px'
  };

   const buttonStyleAboutUs = {
    padding: '8px 16px', borderRadius: '4px',
    border: 'none', backgroundColor: COLOR_ARRAY[3], color: COLOR_ARRAY[15],
    cursor: 'pointer', fontWeight: 'bold',
    fontSize: '1em', marginRight: '10px'
  };

  const panelContainerStyle = {
    position: 'absolute', top: `${BALL_DIAMETER}px`, left: 0,
    width: '100%', height: `calc(100vh - ${BALL_DIAMETER}px)`,
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3
  };
  const panelStyle = {
    width: `${PANEL_SIZE}px`, height: `${PANEL_SIZE}px`, borderRadius: '50%',
    background: COLOR_ARRAY[3], display: 'flex', flexDirection: 'column', justifyContent: 'center',
    alignItems: 'center', margin: '0 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  };

  const panelStyle1 = { 
    ...panelStyle, background: COLOR_ARRAY[4] 
  };

  const applyButtonStyle = {
    width: '75%', padding: '16px', background: COLOR_ARRAY[10],
    color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'
  };
  const submitButtonStyle = {
    width: '60%', padding: '12px', background: COLOR_ARRAY[10],
    color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'
  };
  const confirmationStyle = {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4
  };
  const messageBoxStyle = { background: '#fff', padding: '20px', borderRadius: '8px', textAlign: 'center', maxWidth: '300px' };

  return (

    
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <header style={headerStyle}>
        <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>DWEE.BE</div>
        <button style={buttonStyle} onClick={() => setShowPanels(!showPanels)}>ALPHA PHASE ACCESS</button>
      </header>
        <header style={headerStyle}>
         <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>DWEE.BE</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           {/* About Us in the center */}
           <button
             style={buttonStyleAboutUs}
             onClick={() => setShowAbout(true)}
           >
             ABOUT US
           </button>
           {/* Alpha-Phase toggle on the right */}
           <button
             style={buttonStyle}
             onClick={() => setShowPanels(p => !p)}
           >
             ALPHA PHASE ACCESS
           </button>
         </div>
       </header>

    {/* 2️⃣ The About-Us “modal” */}
     {showAbout && (
        <DWEEbeInteractiveStory
         onExit={() => setShowAbout(false)}
        />
      )}


      {showPanels && (
        <div style={panelContainerStyle}>
          <div style={panelStyle}>
            <h2 style={{ textAlign: 'center', marginBottom: '16px', color: COLOR_ARRAY[15] }}>ALPHA PHASE LOGIN</h2>
           <button
            style={applyButtonStyle}
            onClick={handleSignIn} > APPROVED USERS SIGN IN</button>
           </div>


          <div style={panelStyle1}>
            <h2 style={{ textAlign: 'center', marginBottom: '16px', color: COLOR_ARRAY[12] }}>INVITED<br/>ALPHA USERS</h2>
            {!showApplyForm ? (
              <button style={{ width: '75%', padding: '12px 0', background: COLOR_ARRAY[10], color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setShowApplyForm(true)}>APPLY FOR ACCESS</button>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setShowConfirmation(true); }} style={{ width: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', margin: '8px 0', padding: '8px' }} />
                <input type="email" placeholder="Email Address" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} style={{ width: '100%', margin: '8px 0', padding: '8px' }} />
                <textarea placeholder="Enter Your Invite Code" rows={1} value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} style={{ width: '100%', margin: '8px 0', padding: '8px' }} />
                <button type="submit" style={{ width: '60%', padding: '12px 0', background: COLOR_ARRAY[10], color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Submit Request</button>
              </form>
            )}
          </div>
        </div>
      )}


      {showConfirmation && (
        <div style={confirmationStyle}>
          <div style={messageBoxStyle}>
            <p>A member of our team will email you with further instructions</p>
            <button
              onClick={() => { setShowConfirmation(false); setShowApplyForm(false); setFullName(''); setEmailAddress(''); setInviteCode(''); }}
              style={buttonStyle}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default function LandingPage() {
  console.log('🔥 LandingPage render');
  
  return (
    <AuthWrapper>
      {/* Ensure this wrapper fills the viewport regardless of parent content */}
      <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <LandingPageUI />
      </div>
    </AuthWrapper>
  );
}


/** TEST CODE BELOW
 * ***********************************************************************
 * This is a simplified version of the LandingPage component
 * It only renders a blue background with black text.
 * It is used to confirm that the basic React, Vite, and the 
 * module wiring all work correctly without any additional complexity.
 * 
 * The issue is that MSAL is not functioning correctly in the original code,
 * which means that AUthWrapper.jsx is keeping the UI from rendering while it
 * waits on MSAL to finish what it is doing.

import React from 'react';
import AuthWrapper from './AuthWrapper';

/**
 * Simplified LandingPage: forced blue background and black text

function LandingPageContent() {
  console.log('LandingPage content rendering');
  return (
    <div
      style={{
        backgroundColor: 'blue',
        color: 'black',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1>Black text on blue background</h1>
    </div>
  );
}

export default function LandingPage() {
  console.log('LandingPage component loaded');
  return (
    <AuthWrapper>
      <LandingPageContent />
    </AuthWrapper>
  );
}

*/