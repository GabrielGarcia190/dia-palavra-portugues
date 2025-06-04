
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            COMO JOGAR
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Adivinhe a <strong>PALAVRA</strong> em 6 tentativas.
            </p>
            
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Cada tentativa deve ser uma palavra válida de 5 letras. Pressione ENTER para enviar.
            </p>
            
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Após cada tentativa, a cor das letras mudará para mostrar o quão próximo você está da resposta.
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">EXEMPLOS</h3>
            
            <div className="space-y-4">
              {/* Example 1 */}
              <div className="space-y-2">
                <div className="flex gap-1">
                  <div className="w-8 h-8 border-2 bg-green-500 border-green-500 flex items-center justify-center text-white font-bold text-sm">
                    P
                  </div>
                  <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-sm">
                    L
                  </div>
                  <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-sm">
                    A
                  </div>
                  <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-sm">
                    N
                  </div>
                  <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-sm">
                    O
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  A letra <strong>P</strong> está na palavra e na posição correta.
                </p>
              </div>

              {/* Example 2 */}
              <div className="space-y-2">
                <div className="flex gap-1">
                  <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-sm">
                    C
                  </div>
                  <div className="w-8 h-8 border-2 bg-yellow-500 border-yellow-500 flex items-center justify-center text-white font-bold text-sm">
                    A
                  </div>
                  <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-sm">
                    S
                  </div>
                  <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-sm">
                    A
                  </div>
                  <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-sm">
                    S
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  A letra <strong>A</strong> está na palavra mas na posição errada.
                </p>
              </div>

              {/* Example 3 */}
              <div className="space-y-2">
                <div className="flex gap-1">
                  <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-sm">
                    M
                  </div>
                  <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-sm">
                    U
                  </div>
                  <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-sm">
                    N
                  </div>
                  <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-sm">
                    D
                  </div>
                  <div className="w-8 h-8 border-2 bg-gray-500 border-gray-500 flex items-center justify-center text-white font-bold text-sm">
                    O
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  A letra <strong>O</strong> não está em nenhum lugar da palavra.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
              Uma nova <strong>PALAVRA</strong> será disponibilizada a cada dia!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
