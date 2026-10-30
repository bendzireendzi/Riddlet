/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Smartphone, Share, PlusSquare, Sparkles, Check } from 'lucide-react';
import { sound } from '../utils/audio';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 shadow-xl relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2E6] border border-[#C6D3B6] flex items-center justify-center text-[#4D5E2B]">
            <Smartphone className="w-6 h-6 text-[#6B7F38]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">Install Riddlet as App</h3>
            <p className="text-xs text-stone-500">Play full-screen with no browser address bar</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3.5 my-5 text-sm text-stone-700">
          
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#6B7F38] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              1
            </div>
            <div>
              <div className="font-bold text-stone-900 text-xs">On iPhone (Safari):</div>
              <p className="text-xs text-stone-600 mt-0.5">
                Tap the <strong>Share button</strong> <span className="inline-block px-1 py-0.5 bg-stone-200 rounded text-[10px]">⎋ / Share</span> at the bottom of Safari.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#6B7F38] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              2
            </div>
            <div>
              <div className="font-bold text-stone-900 text-xs">Choose &quot;Add to Home Screen&quot;:</div>
              <p className="text-xs text-stone-600 mt-0.5">
                Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong> (ili <em>&quot;Dodaj na početni zaslon&quot;</em>).
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-[#EEF2E6] rounded-2xl border border-[#C6D3B6] flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#4D5E2B] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              3
            </div>
            <div>
              <div className="font-bold text-[#3D4B20] text-xs">Instant 1-Tap Access:</div>
              <p className="text-xs text-[#4D5E2B] mt-0.5">
                Riddlet appears on your phone screen with its own icon, launching instantly without any redirect notices!
              </p>
            </div>
          </div>

        </div>

        {/* Got it button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-3 bg-[#6B7F38] hover:bg-[#5C6E30] text-white font-bold rounded-2xl transition-all cursor-pointer shadow-xs text-sm"
        >
          Got it!
        </button>

      </div>
    </div>
  );
};
