import { MenuIcon, XIcon, ChevronDown } from "lucide-react";
import { PrimaryButton, GhostButton } from "./Buttons";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/Screenshot 2026-03-01 005051.png";

import {
  useUser,
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
  useClerk,
  useAuth,
  
} from "@clerk/clerk-react";
import api from "../configs/axios";
import toast from "react-hot-toast";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [credits , setcredits] = useState(0);
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
   const { getToken } = useAuth();
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Create", href: "/create" },
    { name: "Community", href: "/community" },
    { name: "My Generations", href: "/my-generations" },
    { name: "Plans", href: "/plans" },
  ];

  const handleNavigation = (href: string) => {
    window.scrollTo(0, 0);
    setIsOpen(false);
    setDropdownOpen(false);
    navigate(href);
  };
  const getUserCredits = async () => {
    try{
        const token = await getToken();
        const {data} = await api.get('/api/user/credits' , {
            headers : {
                Authorization : `Bearer ${token}`
            }
        });
        setcredits(data.credits);
    }
    catch(error : any){
      toast.error("Error fetching credits:", error);
      console.log(error);
    }
  }

  useEffect(() => {
    if(user){
      (async ()=> await getUserCredits())()
    }
  }, [user , pathname])
  return (
    <>
      {/* Navbar */}
      <motion.nav
        className="fixed top-5 left-0 right-0 z-50 px-4"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 250, damping: 25 }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-3">

          {/* Logo */}
          <Link to="/" onClick={() => window.scrollTo(0, 0)}>
            <img src={logo} alt="Genova Ads" className="h-8" />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="hover:text-white transition"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">

            {/* Signed Out */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-gray-300 hover:text-white transition">
                  Sign in
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <PrimaryButton>Get Started</PrimaryButton>
              </SignUpButton>
            </SignedOut>

            {/* Signed In */}
            <SignedIn>
              <div className="flex items-center gap-4 relative">

                <GhostButton onClick={() => navigate("/plans")}>
                  Credits : {credits}
                </GhostButton>

                {/* Custom Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2"
                  >
                    <UserButton afterSignOutUrl="/" />
                    <ChevronDown className="w-4 h-4 text-gray-300" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden">

                      <button
                        onClick={() => handleNavigation("/create")}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5"
                      >
                        Generate
                      </button>

                      <button
                        onClick={() => handleNavigation("/my-generations")}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5"
                      >
                        My Generations
                      </button>

                      <button
                        onClick={() => handleNavigation("/community")}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5"
                      >
                        Community
                      </button>

                      <button
                        onClick={() => handleNavigation("/plans")}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5"
                      >
                        Plans
                      </button>

                      <div className="border-t border-white/10" />

                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>

                <Link to="/create">
                  <PrimaryButton>Create Video</PrimaryButton>
                </Link>

              </div>
            </SignedIn>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden"
          >
            <MenuIcon className="w-6 h-6 text-white" />
          </button>

        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center gap-8 text-xl font-medium text-white transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >

        {navLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => handleNavigation(link.href)}
          >
            {link.name}
          </button>
        ))}

        <SignedOut>
          <SignInButton mode="modal">
            <button>Sign in</button>
          </SignInButton>

          <SignUpButton mode="modal">
            <PrimaryButton>Get Started</PrimaryButton>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          <div className="flex flex-col items-center gap-4">
            <UserButton afterSignOutUrl="/" />

            <span className="text-gray-300">
              {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
            </span>

            <button
              onClick={() => signOut()}
              className="text-red-400"
            >
              Sign out
            </button>
          </div>
        </SignedIn>

        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6"
        >
          <XIcon className="w-6 h-6" />
        </button>

      </div>
    </>
  );
}