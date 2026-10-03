import React, { useState } from 'react';
import { Moon, Sparkles, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from './AuthContext';

export const AuthView: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!fullName.trim()) {
          setErrorMsg('Por favor, informe seu nome completo.');
          setLoading(false);
          return;
        }
        const res = await signUp(email, fullName, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Erro ao realizar cadastro.');
        }
      } else {
        const res = await signIn(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Email ou senha inválidos.');
        }
      }
    } catch {
      setErrorMsg('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 flex flex-col justify-center px-4 py-8 text-slate-100">
      <div className="max-w-md w-full mx-auto bg-slate-900/90 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 backdrop-blur-md">
        {/* App Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Moon size={32} />
          </div>
          <h1 className="text-2xl font-black text-white">BabySleep</h1>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhamento inteligente de sono e rotina com respeito ao ritmo do bebê.
          </p>
        </div>

        {/* Abas Entrar / Cadastrar */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-800/80 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              !isRegister ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              isRegister ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Seu Nome Completo
              </label>
              <input
                type="text"
                placeholder="Ex: Maria Silva"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                required={isRegister}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              E-mail
            </label>
            <input
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full mt-2" isLoading={loading}>
            {isRegister ? 'Criar Conta Gratuita' : 'Entrar na Conta'}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 leading-tight">
            Ambiente seguro com criptografia de ponta a ponta e isolamento estrito de dados por bebê.
          </p>
        </div>
      </div>
    </div>
  );
};
