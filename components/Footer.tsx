import { Globe, Mail, Phone, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#2D2A26] text-white w-full py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Sezione Contatti */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm text-gray-400 border-b border-gray-700 pb-8">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-red-800" />
            <span>superstart.it</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-red-800" />
            <span>info@superstart.it</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={18} className="text-red-800" />
            <span>+39 393 453 3500</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-red-800" />
            <span>WhatsApp</span>
          </div>
        </div>

        {/* Sezione Copyright */}
        <div className="text-center pt-8 text-xs text-gray-600">
          © {new Date().getFullYear()} SuPeR - Sistema Gestionale
        </div>
        
      </div>
    </footer>
  );
}