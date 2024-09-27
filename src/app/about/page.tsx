"use client";
import Link from "next/link";
import React from "react";
import TestComponent from "../components/TestComponent";

const AboutPage = () => {
  return (
    <div>
      <div>
        <Link href="/">
          Back
        </Link>
      </div>
      <TestComponent />
    </div>
  );
};

export default AboutPage;
