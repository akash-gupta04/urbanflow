"use client";

import { useEffect, useState } from "react";

export default function Navbar() {

  const [active,
    setActive] =
    useState("dashboard");

  const navItems = [
    {
      name: "Dashboard",
      href: "dashboard",
    },
    {
      name: "Map",
      href: "map",
    },
    {
      name: "Emergency",
      href: "alerts",
    },
    {
      name: "AI",
      href: "ai",
    },
  ];

  useEffect(() => {

    const handleScroll =
      () => {

      const sections =
        navItems.map(
          (item) =>
            document.getElementById(
              item.href
            )
        );

      let current =
        "dashboard";

      sections.forEach(
        (section) => {

          if (!section)
            return;

          const top =
            section.offsetTop;

          if (
            window.scrollY >=
            top - 180
          ) {
            current =
              section.id;
          }
        }
      );

      setActive(
        current
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );

  }, []);

  return (
    <nav className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl px-8 py-5 shadow-[0_0_40px_rgba(59,130,246,0.08)] flex items-center justify-between">

      {/* Left */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          🌆 UrbanFlow
        </h1>

        <p className="text-zinc-500 text-sm mt-1">
          Smart City Intelligence Platform
        </p>
      </div>

      {/* Navigation */}
      <div className="hidden md:flex items-center gap-8">

        {navItems.map(
          (item) => {

            const isActive =
              active ===
              item.href;

            return (
              <button
                key={item.name}
                onClick={() => {
                  document
                    .getElementById(
                      item.href
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    });
                }}
                className={`relative text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.name}

                <span
                  className={`absolute -bottom-2 left-0 h-[2px] rounded-full bg-blue-500 transition-all duration-300 ${
                    isActive
                      ? "w-full"
                      : "w-0"
                  }`}
                />
              </button>
            );
          }
        )}
      </div>

      {/* Live Status */}
      <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-5 py-3 rounded-full">

        <div className="relative flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />

          <div className="absolute w-4 h-4 bg-green-500/20 rounded-full animate-ping" />
        </div>

        <span className="text-sm font-medium text-green-400">
          Live
        </span>
      </div>
    </nav>
  );
}