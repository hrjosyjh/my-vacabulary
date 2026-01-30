import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, BookOpen, GraduationCap, X, RotateCcw, Volume2, 
  ChevronLeft, ChevronRight, Smile, School, FileText, Bookmark,
  Play, Pause, Settings, Maximize2
} from 'lucide-react';
import { vocabulary } from './data/words';

function App() {
  const [checkedWords, setCheckedWords] = useState(() => {
    const saved = localStorage.getItem('checkedWords');
    return saved ? JSON.parse(saved) : [];
  });

  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // Study Mode State
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [studyInterval, setStudyInterval] = useState(3000); // 3 seconds
  const [studyIndex, setStudyIndex] = useState(0);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    setStudyIndex(0); // Reset study index too
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

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

  const playAudio = (text, e) => {
    if (e) e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const filteredWords = vocabulary.filter(word => {
    if (filter === 'learning') return !checkedWords.includes(word.id);
    if (filter === 'memorized') return checkedWords.includes(word.id);
    if (['mood', 'suneung', 'evaluator', 'jicheonmyeong'].includes(filter)) {
        return word.category && word.category.split(',').includes(filter);
    }
    return true;
  });

  // Auto-play logic
  useEffect(() => {
    let timer;
    if (isStudyMode && isPlaying) {
      timer = setInterval(() => {
        setStudyIndex(prev => {
          if (prev >= filteredWords.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, studyInterval);
    }
    return () => clearInterval(timer);
  }, [isStudyMode, isPlaying, studyInterval, filteredWords.length]);

  // Pagination logic
  const totalPages = Math.ceil(filteredWords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedWords = filteredWords.slice(startIndex, startIndex + itemsPerPage);

  const progress = Math.round((checkedWords.length / vocabulary.length) * 100);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Study Mode UI
  if (isStudyMode) {
    const currentWord = filteredWords[studyIndex];
    if (!currentWord) return <div>No words to study</div>;

    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative">
        {/* Category Selector */}
        <div className="absolute top-6 left-6 z-20">
            <select
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 outline-none focus:border-blue-500 cursor-pointer shadow-lg"
            >
                <option value="all">전체 단어</option>
                <option value="jicheonmyeong">지천명</option>
                <option value="suneung">수능필수</option>
                <option value="evaluator">평가원</option>
                <option value="mood">분위기/심경</option>
                <option value="learning">학습 중</option>
                <option value="memorized">암기 완료</option>
            </select>
        </div>

        <button 
          onClick={() => setIsStudyMode(false)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-800 transition-colors z-20"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="w-full max-w-3xl flex flex-col items-center gap-8">
          {/* Progress Info */}
          <div className="text-gray-400 text-sm">
            {studyIndex + 1} / {filteredWords.length}
          </div>

          {/* Card */}
          <div className="bg-white text-gray-900 rounded-3xl p-12 w-full shadow-2xl text-center min-h-[400px] flex flex-col justify-center relative">
            <h2 className="text-6xl font-bold mb-4">{currentWord.word}</h2>
            <div className="flex justify-center items-center gap-2 mb-8 text-gray-500">
               {currentWord.pronunciation && <span className="font-mono text-xl">{currentWord.pronunciation}</span>}
               <button onClick={() => playAudio(currentWord.word)} className="p-2 hover:bg-gray-100 rounded-full">
                 <Volume2 className="w-6 h-6" />
               </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-3xl font-semibold text-blue-600">{currentWord.meaning}</p>
              {currentWord.exampleEn && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl text-lg text-gray-600">
                  <p>{currentWord.exampleEn}</p>
                </div>
              )}
            </div>

            {/* Check Button inside Study Mode */}
            <div className="absolute top-4 right-4">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        const isChecked = checkedWords.includes(currentWord.id);
                        if (!isChecked) {
                            toggleWord(currentWord.id);
                        }
                        // Move to next word immediately
                        if (studyIndex < filteredWords.length - 1) {
                            setStudyIndex(prev => prev + 1);
                        } else {
                            setIsPlaying(false);
                            alert('마지막 단어입니다!');
                        }
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-md ${
                        checkedWords.includes(currentWord.id)
                        ? 'bg-green-500 text-white cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                    }`}
                >
                    <Check className="w-5 h-5" />
                    {checkedWords.includes(currentWord.id) ? '암기 완료됨' : '암기 완료'}
                </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-8 bg-gray-800 px-8 py-4 rounded-full shadow-xl">
             <button 
               onClick={() => setStudyIndex(prev => Math.max(0, prev - 1))}
               className="p-2 hover:text-blue-400 transition-colors"
               disabled={studyIndex === 0}
             >
               <ChevronLeft className="w-8 h-8" />
             </button>

             <button 
               onClick={() => setIsPlaying(!isPlaying)}
               className={`p-4 rounded-full transition-all ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
             >
               {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
             </button>

             <button 
               onClick={() => setStudyIndex(prev => Math.min(filteredWords.length - 1, prev + 1))}
               className="p-2 hover:text-blue-400 transition-colors"
               disabled={studyIndex === filteredWords.length - 1}
             >
               <ChevronRight className="w-8 h-8" />
             </button>
          </div>

          {/* Settings */}
          <div className="flex items-center gap-4 text-sm text-gray-400 bg-gray-800/50 px-6 py-2 rounded-full">
            <Settings className="w-4 h-4" />
            <span>자동 넘김 간격:</span>
            <select 
              value={studyInterval}
              onChange={(e) => setStudyInterval(Number(e.target.value))}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value={1000}>1초</option>
              <option value={2000}>2초</option>
              <option value={3000}>3초</option>
              <option value={5000}>5초</option>
              <option value={10000}>10초</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="flex gap-2">
                <button
                onClick={() => setIsStudyMode(true)}
                className="text-sm bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full flex items-center gap-2 font-bold shadow-sm transition-all transform hover:scale-105"
                >
                <Maximize2 className="w-4 h-4" /> 학습 모드 시작
                </button>
                <button 
                onClick={resetProgress}
                className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded flex items-center gap-1 transition-colors"
                >
                <RotateCcw className="w-4 h-4" /> 초기화
                </button>
            </div>
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
        {/* Controls: Filter Tabs & Pagination Settings */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {[
                { id: 'all', label: '전체', icon: BookOpen },
                { id: 'learning', label: '학습 중', icon: X },
                { id: 'memorized', label: '완료', icon: Check },
                { id: 'jicheonmyeong', label: '지천명', icon: Bookmark },
                { id: 'suneung', label: '수능필수', icon: School },
                { id: 'evaluator', label: '평가원', icon: FileText },
                { id: 'mood', label: '분위기', icon: Smile },
            ].map(tab => (
                <button
                key={tab.id}
                onClick={() => handleFilterChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
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
                    tab.id === 'memorized' ? checkedWords.length :
                    vocabulary.filter(w => w.category && w.category.split(',').includes(tab.id)).length}
                </span>
                </button>
            ))}
            </div>

            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm shrink-0">
                <span className="text-sm text-gray-600">페이지당:</span>
                <select 
                    value={itemsPerPage} 
                    onChange={handleItemsPerPageChange}
                    className="bg-transparent font-medium focus:outline-none cursor-pointer"
                >
                    <option value={10}>10개</option>
                    <option value={20}>20개</option>
                    <option value={30}>30개</option>
                    <option value={50}>50개</option>
                </select>
            </div>
        </div>

        {/* Word Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {displayedWords.map(word => {
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className={`text-2xl font-bold ${isChecked ? 'text-green-700' : 'text-gray-900'}`}>
                          {word.word}
                        </h2>
                        <button
                          onClick={(e) => playAudio(word.word, e)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="발음 듣기"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>
                      {word.pronunciation && (
                        <span className="text-sm text-gray-500 font-mono block mb-1">{word.pronunciation}</span>
                      )}
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

        {/* Pagination Controls */}
        {filteredWords.length > 0 && (
            <div className="mt-12 flex justify-center items-center gap-4">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="font-medium text-gray-700">
                    {currentPage} / {totalPages} 페이지
                </span>

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        )}
      </main>
    </div>
  );
}

export default App;
