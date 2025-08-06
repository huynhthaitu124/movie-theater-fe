import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary-800 text-secondary-200 dark:bg-secondary-900 dark:text-secondary-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center text-xl font-bold text-white mb-4">
              {/* <Film className="h-8 w-8 mr-2 text-primary-400" /> */}
              <img src="../../src/assets/images/Cinemasvg.svg" alt="Logo" className="h-8 w-8 mr-2" />
              <span>BlueCinema</span>
            </Link>
            <p className="text-sm mb-4">
              Experience movies like never before with state-of-the-art technology and ultimate comfort.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary-300 hover:text-primary-400" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-secondary-300 hover:text-primary-400" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-secondary-300 hover:text-primary-400" aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/movies" className="text-secondary-300 hover:text-primary-400">
                  Movies
                </Link>
              </li>
              <li>
                <Link to="/promotions" className="text-secondary-300 hover:text-primary-400">
                  Promotions
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-secondary-300 hover:text-primary-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-secondary-300 hover:text-primary-400">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-secondary-300 hover:text-primary-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-secondary-300 hover:text-primary-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-secondary-300 hover:text-primary-400">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-secondary-300 hover:text-primary-400">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 text-primary-400" />
                <span>123 Cinema Street, Movie City, MC 12345</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-primary-400" />
                <span>+1 (123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-primary-400" />
                <span>info@BlueCinema.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-700 mt-8 pt-8 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} BlueCinema. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;