import { useEffect, useState } from "react";
import "./App.css";
import girlPic from "./girl.jpg";

function App() {
  // Right-side notifications
  const rightNotifications = [
    {
      text: "Can someone grab milk on the way home? We're running low. Thanks!🥛",
      type: "milk",
    },
    {
      text: "🚮 It's your turn to take out the trash this week!",
      type: "trash",
    },
  ];

  // Left-side notifications (added packageDelivered)
  const leftNotifications = [
    { type: "poll" },
    { type: "newMember", text: "Simone just joined your household. Say Hi! 👋", img: girlPic },
    { type: "packageDelivered", text: "Oscar, your package has been delivered! 📦" },
  ];

  // States for current visible notifications
  const [rightIndex, setRightIndex] = useState(0);
  const [leftIndex, setLeftIndex] = useState(0);

  const [showRight, setShowRight] = useState(true);
  const [showLeft, setShowLeft] = useState(true);

  // Right notifications alternation
  useEffect(() => {
    const interval = setInterval(() => {
      setShowRight(false);
      setTimeout(() => {
        setRightIndex((prev) => (prev + 1) % rightNotifications.length);
        setShowRight(true);
      }, 500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Left notifications alternation (staggered)
  useEffect(() => {
    const interval = setInterval(() => {
      setShowLeft(false);
      setTimeout(() => {
        setLeftIndex((prev) => (prev + 1) % leftNotifications.length);
        setShowLeft(true);
      }, 500);
    }, 9000); // slightly different timing from right for staggering
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      {/* HEADER */}
      <header className="header">
        <h1 className="logo">ParcelPantry</h1>
        <button className="login-btn">Login</button>
      </header>

      {/* HERO */}
      <div className="hero">
        <h2 className="title">The Household Logistics Engine</h2>
        <p className="subtitle">
          Manage groceries, track packages, stay connected with your roommates. All in one place.
        </p>

        {/* CTA BUTTONS */}
        <div className="cta-buttons">
          <button className="btn primary">Get Started</button>
          <button className="btn secondary">Join Household</button>
        </div>
      </div>

      {/* LEFT NOTIFICATIONS */}
      {showLeft && (
        <div
          className={`notification left float ${leftNotifications[leftIndex].type}`}
        >
          {leftNotifications[leftIndex].type === "poll" && (
            <>
              <h4>🎬 Movie Night?</h4>
              <p>Any ideas for movie night this week?</p>
              <div className="options">
                <div className="option selected">The Lion King</div>
                <div className="option">Toy Story</div>
                <div className="option">Frozen</div>
                <div className="option">Aladdin</div>
              </div>
            </>
          )}

          {leftNotifications[leftIndex].type === "newMember" && (
            <>
              <img
                src={leftNotifications[leftIndex].img}
                alt="Simone"
                className="member-pic"
              />
              <span>{leftNotifications[leftIndex].text}</span>
            </>
          )}

          {leftNotifications[leftIndex].type === "packageDelivered" && (
            <span>{leftNotifications[leftIndex].text}</span>
          )}
        </div>
      )}

      {/* RIGHT NOTIFICATIONS */}
      {showRight && (
        <div
          className={`notification right float ${rightNotifications[rightIndex].type}`}
        >
          {rightNotifications[rightIndex].text}
        </div>
      )}
    </div>
  );
}

export default App;