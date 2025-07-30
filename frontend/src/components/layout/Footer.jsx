import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Globe,
  GraduationCap,
  Users,
} from "lucide-react";
import {
  APP_NAME,
  UNIVERSITY_NAME,
  UNIVERSITY_EMAIL,
  UNIVERSITY_ADDRESS,
} from "../common/constants/index";

/**
 * Footer component for the application
 * Displays links, contact information, and social media
 */
const Footer = ({ isPublic = true, onOpenLogin }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold">{APP_NAME}</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              A comprehensive mobile web-based approach to school event
              attendance monitoring with integrated analytics for{" "}
              {UNIVERSITY_NAME}.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-green-600 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Events
                </Link>
              </li>
              {isPublic && (
                <>
                  <li>
                    <button
                      onClick={onOpenLogin}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      Login
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-green-600 pb-2">
              Contact Info
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-gray-400">
                <MapPin size={20} className="text-green-500 mt-1" />
                <span>{UNIVERSITY_ADDRESS}</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail size={20} className="text-green-500" />
                <span>{UNIVERSITY_EMAIL}</span>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-green-600 pb-2">
              Connect With Us
            </h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-green-500 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-green-500 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter size={24} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-green-500 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>
            &copy; {currentYear} {APP_NAME}. All rights reserved.
          </p>
          <p className="mt-2 text-sm">Developed for {UNIVERSITY_NAME}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
