// CharityAvatar.js

// to be deleted

import React from "react";

interface CharityProfileProps {
  name: string;
  imageUrl: string;
}

function CharityAvatar({ name, imageUrl }: CharityProfileProps) {

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column", // Arrange items vertically
        alignItems: "flex-start", // Align items to the left
        marginTop: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column", // Arrange items vertically
          alignItems: "center", // Align items to the left
        }}
      >
        <img
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid ",
          }}
          src={imageUrl}
          alt={`Profile of ${name}`}
        />
        <div
          style={{
            marginTop: "10px",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
            textAlign: "center", // Center the text horizontally
          }}
        >
          {name}
        </div>
      </div>
    </div>
  );
}

export default CharityAvatar;
