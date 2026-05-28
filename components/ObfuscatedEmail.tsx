"use client";

import { useEffect, useState } from "react";

export function ObfuscatedEmail() {
  const [address, setAddress] = useState("");

  useEffect(() => {
    const codes = [
      104, 101, 108, 108, 111, 64, 116, 104, 101, 114, 97, 105, 110, 98, 111, 119, 104, 117, 98, 46, 99, 111, 109,
    ];
    setAddress(String.fromCharCode(...codes));
  }, []);

  return (
    <p className="obfuscated-email">
      {address ? (
        <a href={`mailto:${address}`}>{address}</a>
      ) : (
        <span aria-live="polite">Email address loading...</span>
      )}
    </p>
  );
}
