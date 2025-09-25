"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, firestore } from "@/firebase";
import { UserCircleIcon } from "@heroicons/react/16/solid";
import LoginModal from "./modals/LoginModal";
import SignupModal from "./modals/SignupModal";
import DashboardButton from "./Button";
import { AppDispatch } from "@/redux/store";
import { closeLoginModal, closeSignupModal } from "@/redux/slices/modalSlice";
import LoadingPage from "./Loading";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Prevent hydration mismatch: only render auth-dependent pieces after mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Analyze", href: "#features" },
    { name: "Why this matters?", href: "#impact" },
    { name: "App", href: "#app" },
  ];

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // start as loading until auth resolved
  const router = useRouter();

  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // reload to get latest claims/properties (safe to call)
          if (typeof currentUser.reload === "function") {
            try {
              await currentUser.reload();
            } catch (err) {
              // ignore reload failure; still use currentUser
              console.warn("User reload failed:", err);
            }
          }

          setUser(currentUser);

          // Ensure a users doc exists (non-blocking)
          try {
            const userDocRef = doc(firestore, "users", currentUser.uid);
            const snapshot = await getDoc(userDocRef);
            if (!snapshot.exists()) {
              // If you stored registrationData earlier in localStorage, read it only if mounted
              let username = "";
              let password = "";
              if (typeof window !== "undefined") {
                const registrationData = localStorage.getItem("registrationData");
                if (registrationData) {
                  try {
                    const parsed = JSON.parse(registrationData);
                    username = parsed.username || "";
                    password = parsed.password || "";
                  } catch {
                    // ignore parse error
                  }
                }
              }
              await setDoc(userDocRef, {
                username,
                email: currentUser.email || "",
                password,
              });
              if (typeof window !== "undefined") {
                localStorage.removeItem("registrationData");
              }
            }
          } catch (err) {
            console.warn("Error ensuring user doc:", err);
          }
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Dropdown Menu state and outside-click handling
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Redux dispatch
  const dispatch: AppDispatch = useDispatch();

  const handleSignOut = useCallback(() => {
    setLoading(true);
    setOpen(false);

    // Sign out and close modals
    signOut(auth)
      .then(() => {
        dispatch(closeLoginModal());
        dispatch(closeSignupModal());
      })
      .catch((err) => {
        console.error("Sign out error:", err);
      })
      .finally(() => {
        // Small delay for UX; feel free to remove/set to 0
        setTimeout(() => setLoading(false), 400);
      });
  }, [dispatch]);

  // Mobile menu button bars color — keep visible on dark background
  const mobileBarClass = "w-6 h-0.5 bg-white";

  // While resolving auth, show a loading placeholder (prevents flicker/hydration mismatch)
  if (!mounted) {
    // render nothing until the client mounts to avoid SSR/CSR mismatch
    return null;
  }

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <nav
      className={[
        "fixed p-1 top-0 left-0 w-full z-50 transition-colors duration-300",
        scrolled
          ? "bg-black/95 backdrop-blur-md border border-purple-800/20 shadow-lg"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 ">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="#home" className="text-xl font-bold text-white ml-2">
            RTWRH
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-white hover:text-pink-200 transition"
            >
              {link.name}
            </a>
          ))}

          {user ? (
            <>
              <DashboardButton />
              <div
                className="user-dropdown bg-white/15 text-white px-4 py-2 rounded-md hover:bg-white/25 transition cursor-pointer relative"
                ref={dropdownRef}
                style={{ display: "inline-block" }}
              >
                <div
                  onClick={() => setOpen((prev) => !prev)}
                  className="flex gap-2 items-center select-none"
                >
                  <UserCircleIcon width={29} />{" "}
                  <span className="max-w-[150px] truncate">{user.displayName || user.email}</span>
                </div>

                {open && (
                  <div
                    className="dropdown-menu mt-2 right-0 absolute bg-white rounded-md shadow-lg z-50 overflow-hidden"
                    style={{
                      minWidth: 160,
                    }}
                  >
                    <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 border-t"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <LoginModal />
              <SignupModal />
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col gap-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={mobileBarClass}></span>
          <span className={mobileBarClass}></span>
          <span className={mobileBarClass}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-purple-600/95 backdrop-blur-md shadow-lg px-4 py-3 space-y-3 rounded-2xl mx-3 border border-purple-300/20">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block text-white/90 hover:text-white transition"
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}

          {user ? (
            <div className="flex gap-2">
              <DashboardButton />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setOpen(false);
                  handleSignOut();
                }}
                className="flex-1 bg-white/15 text-white px-4 py-2 rounded-md hover:bg-white/25 transition"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <div onClick={() => setMenuOpen(false)}>
                <LoginModal />
              </div>
              <div onClick={() => setMenuOpen(false)}>
                <SignupModal />
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
