import React, { useState, useEffect } from 'react';
import { Check, BookOpen, GraduationCap, X, RotateCcw } from 'lucide-react';
import { vocabulary } from './data/words';

function App() {
  const [checkedWords, setCheckedWords] = useState(() => {
    const saved = localStorage.getItem('checkedWords');
    return saved ? JSON.parse(saved) : [];
  });

  const [filter, setFilter] = useState('all'); // 'all', 'learning', 'memorized'

  useEffect(() => {
    localStorage.setItem('checkedWords', JSON.stringify(checkedWords));
  }, [checkedWords]);

  const toggleWord = (id) => {
    setCheckedWords(prev => 
      prev.includes(id) 
        ? prev.filter(wordId => wordId !== id)
        : [...prev, id]
    );
  };

  const resetProgress = () => {
    if (window.confirm('정말로 모든 학습 기록을 초기화하시겠습니까?')) {
      setCheckedWords([]);
    }
  };

  const filteredWords = vocabulary.filter(word => {
    if (filter === 'learning') return !checkedWords.includes(word.id);
    if (filter === 'memorized') return checkedWords.includes(word.id);
    return true;
  });

  const progress = Math.round((checkedWords.length / vocabulary.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="w-8 h-8" />
              수능 필수 영단어장
            </h1>
            <button 
              onClick={resetProgress}
              className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> 초기화
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-blue-800 rounded-full h-4 w-full overflow-hidden relative">
            <div 
              className="bg-green-400 h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm mt-1 text-blue-100">
            <span>진행률: {progress}%</span>
            <span>{checkedWords.length} / {vocabulary.length} 단어 암기 완료</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'all', label: '전체 단어', icon: BookOpen },
            { id: 'learning', label: '학습 중', icon: X },
            { id: 'memorized', label: '암기 완료', icon: Check },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                filter === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.id === 'all' ? vocabulary.length : 
                 tab.id === 'learning' ? vocabulary.length - checkedWords.length : 
                 checkedWords.length}
              </span>
            </button>
          ))}
        </div>

        {/* Word Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {filteredWords.map(word => {
            const isChecked = checkedWords.includes(word.id);
            return (
              <div 
                key={word.id}
                onClick={() => toggleWord(word.id)}
                className={`group relative bg-white rounded-xl shadow-sm border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                  isChecked 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-transparent hover:border-blue-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className={`text-2xl font-bold mb-1 ${isChecked ? 'text-green-700' : 'text-gray-900'}`}>
                        {word.word}
                      </h2>
                      <span className="text-sm text-gray-500 font-mono">{word.pronunciation}</span>
                    </div>
                    <div className={`p-2 rounded-full transition-colors ${
                      isChecked ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-400'
                    }`}>
                      <Check className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className={`text-lg font-semibold ${isChecked ? 'text-green-600' : 'text-blue-600'}`}>
                      {word.meaning}
                    </p>
                  </div>

                  <div className={`text-sm p-3 rounded-lg ${isChecked ? 'bg-green-100/50' : 'bg-gray-50'}`}>
                    <p className="mb-1 text-gray-700">{word.exampleEn}</p>
                    <p className="text-gray-500">{word.exampleKo}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredWords.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">해당하는 단어가 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;