import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, Settings, StepForward, SkipForward, ChevronDown, BarChart3, Clock, Database, Menu } from 'lucide-react';
import * as SortingAlgorithms from './algorithms';

const SortingVisualizer = () => {
  const [array, setArray] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [algorithm, setAlgorithm] = useState('bubble');
  const [speed, setSpeed] = useState(50);

  const speedRef = useRef(50); 
  
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [highlightedIndices, setHighlightedIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [flashMessage, setFlashMessage] = useState(null);

  const stopRef = useRef(false);
  const isPausedRef = useRef(false); 
  const pauseResolverRef = useRef(null);
  const skipPassRef = useRef(false);
  const lastPassIdRef = useRef(null);

  const algorithms = {
    bubble: 'Bubble Sort',
    selection: 'Selection Sort',
    insertion: 'Insertion Sort',
    merge: 'Merge Sort',
    quick: 'Quick Sort',
    heap: 'Heap Sort',
    shell: 'Shell Sort',
    radix: 'Radix Sort'
  };

  useEffect(() => {
    // Initial generation with responsive size
    generateRandomArray();
    if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
      speedRef.current = speed;
  }, [speed]);

  const generateRandomArray = (size) => {
    // Use provided size, or dynamically choose based on screen width
    const count = size || (window.innerWidth < 640 ? 15 : 30);
    const newArray = Array.from({ length: count }, (_, i) => ({
      value: Math.floor(Math.random() * 100) + 5,
      id: `item-${Date.now()}-${i}`
    }));
    setArray(newArray);
    setSortedIndices([]);
    setHighlightedIndices([]);
    setComparisons(0);
    setSwaps(0);
    setCurrentStep('Ready to sort');
    setIsPaused(false);
    isPausedRef.current = false;
    setFlashMessage(null);
  };

  const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const waitForResume = async () => {
    if (pauseResolverRef.current) return;
    return new Promise(resolve => {
      pauseResolverRef.current = resolve;
    });
  };

  const updateArray = async (newArray, highlighted = [], sorted = [], passId = null, action = null) => {
    if (stopRef.current) return false;
    
    setArray([...newArray]);
    setHighlightedIndices(highlighted);
    setSortedIndices(sorted);

    if (action === 'swap') {
        setFlashMessage('SWAP');
    } else {
        setFlashMessage(null);
    }

    let shouldPause = isPausedRef.current;
    
    if (skipPassRef.current) {
        if (passId !== lastPassIdRef.current) {
            skipPassRef.current = false;
            setIsPaused(true);
            isPausedRef.current = true;
            shouldPause = true;
        } else {
            shouldPause = false;
        }
    }

    lastPassIdRef.current = passId;

    if (shouldPause) {
        await waitForResume();
    } else {
        const delay = skipPassRef.current ? 0 : (101 - speedRef.current) * 5;
        await sleep(delay);
    }
    
    return true;
  };

  // --- Sorting Implementations (Refactored to separate modules) ---


  const startSorting = async () => {
    stopRef.current = false;
    skipPassRef.current = false;
    lastPassIdRef.current = null;
    pauseResolverRef.current = null;
    setIsPaused(false);
    isPausedRef.current = false;
    
    setSorting(true);
    setComparisons(0);
    setSwaps(0);
    setSortedIndices([]);
    const arrCopy = [...array];

    const helpers = {
        updateArray,
        setComparisons,
        setSwaps,
        setCurrentStep,
        setSortedIndices
    };

    const algorithmMap = {
      bubble: SortingAlgorithms.bubbleSort,
      selection: SortingAlgorithms.selectionSort,
      insertion: SortingAlgorithms.insertionSort,
      merge: SortingAlgorithms.mergeSort,
      quick: SortingAlgorithms.quickSort,
      heap: SortingAlgorithms.heapSort,
      shell: SortingAlgorithms.shellSort,
      radix: SortingAlgorithms.radixSort
    };

    const selectedAlgorithm = algorithmMap[algorithm];
    if (selectedAlgorithm) {
        await selectedAlgorithm(arrCopy, helpers);
    }

    setSorting(false);
    setIsPaused(false);
    isPausedRef.current = false;
    setHighlightedIndices([]);
  };

  const stopSorting = () => {
    stopRef.current = true;
    if (pauseResolverRef.current) {
        pauseResolverRef.current();
        pauseResolverRef.current = null;
    }
    setSorting(false);
    setIsPaused(false);
    isPausedRef.current = false;
    setHighlightedIndices([]);
    setCurrentStep('Reset');
    generateRandomArray(array.length);
  };

  const togglePause = () => {
    if (isPausedRef.current) {
        setIsPaused(false);
        isPausedRef.current = false;
        if (pauseResolverRef.current) {
            pauseResolverRef.current();
            pauseResolverRef.current = null;
        }
    } else {
        setIsPaused(true);
        isPausedRef.current = true;
    }
  };

  const nextStep = () => {
      if (pauseResolverRef.current) {
          pauseResolverRef.current();
          pauseResolverRef.current = null;
      }
  };

  const nextPass = () => {
      skipPassRef.current = true;
      if (pauseResolverRef.current) {
          pauseResolverRef.current();
          pauseResolverRef.current = null;
      }
  };

  const handleCustomInput = () => {
    const numbers = customInput
      .split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n > 0 && n <= 100);
    if (numbers.length > 0) {
      setArray(numbers.map((val, i) => ({ value: val, id: `custom-${Date.now()}-${i}` })));
      setSortedIndices([]);
      setHighlightedIndices([]);
      setComparisons(0);
      setSwaps(0);
      setCurrentStep('Custom array loaded');
      setCustomInput('');
    }
  };

  const maxHeight = array.length > 0 ? Math.max(...array.map(o => o.value)) : 0;

  return (
    <div className="flex min-h-screen bg-[#0f1020] text-gray-100 overflow-hidden font-sans relative">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Left Sidebar / Hero Section */}
      <div className={`fixed inset-y-0 left-0 z-50 w-full md:w-80 lg:w-1/3 bg-[#0f1020]/95 lg:bg-black/20 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:block flex flex-col justify-center p-8 overflow-y-auto`}>
         
         {/* Mobile Close Button */}
         <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg"
         >
            <Menu size={20} />
         </button>

         <div className="mb-8 mt-8 lg:mt-0">
            <div className="flex items-center gap-4 mb-6">
                 <h1 className="text-4xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] leading-tight">
                     Sorting <br/> Visualizer
                 </h1>
            </div>
           <p className="text-lg lg:text-xl text-gray-400 font-light leading-relaxed">
             Experience the beauty of algorithms in motion. <br className="hidden lg:block"/>
             Watch how data organizes itself through elegant logic.
           </p>
         </div>

         <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                 <div className="flex items-center gap-3 mb-2 text-purple-300">
                     <Clock size={20} />
                     <span className="font-semibold">Time Complexity</span>
                 </div>
                 <div className="text-3xl font-bold text-white mb-1">
                     {algorithm === 'bubble' ? 'O(n²)' : 
                      algorithm === 'selection' ? 'O(n²)' :
                      algorithm === 'insertion' ? 'O(n²)' :
                      algorithm === 'radix' ? 'O(nk)' : 'O(n log n)'}
                 </div>
                 <div className="text-xs text-gray-500 uppercase tracking-wider">Average Case</div>
              </div>
              
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                 <div className="flex items-center gap-3 mb-2 text-blue-300">
                     <Database size={20} />
                     <span className="font-semibold">Space Complexity</span>
                 </div>
                  <div className="text-3xl font-bold text-white mb-1">
                     {algorithm === 'merge' ? 'O(n)' : 
                      algorithm === 'quick' ? 'O(log n)' :
                      algorithm === 'radix' ? 'O(n+k)' : 'O(1)'}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Auxiliary Space</div>
              </div>
         </div>
      </div>

      {/* Right Main Interface */}
      <div className={`flex-1 p-4 lg:p-8 relative z-10 flex flex-col h-screen overflow-y-auto transition-all duration-300 w-full`}>
        
        {/* Top Control Bar */}
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl mb-6 w-full">
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                 {/* Sidebar Toggle Button (Mobile Only) */}
                 <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-md border border-white/10 transition-all shadow-lg group flex-shrink-0 self-start sm:self-auto"
                    title="Open Menu"
                >
                    <Menu size={20} className="group-hover:scale-110 transition-transform" />
                </button>

                 <div className="relative group w-full sm:w-auto flex-1">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-200"></div>
                    <select
                        value={algorithm}
                        onChange={(e) => setAlgorithm(e.target.value)}
                        disabled={sorting}
                        className="relative w-full sm:w-64 bg-slate-900 text-white rounded-lg p-3 border border-white/10 focus:border-purple-400 focus:outline-none appearance-none cursor-pointer"
                    >
                        {Object.entries(algorithms).map(([key, name]) => (
                        <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                
                <div className="w-full sm:w-48 px-2 group/slider">
                  <div className="flex justify-between text-xs font-medium text-gray-400 mb-2 transition-colors">
                    <div className="flex items-center gap-2 group-hover/slider:text-purple-300 transition-colors">
                        <Zap size={14} className={`transition-all ${speed > 75 ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-gray-500"}`} />
                        <span className="uppercase tracking-wider text-[10px]">Speed</span>
                    </div>
                    <span className="font-mono text-sm text-purple-200">{speed}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={speed}
                    onChange={(e) => setSpeed(parseInt(e.target.value))}
                    className="premium-slider w-full cursor-pointer h-1.5"
                    style={{ backgroundSize: `${speed}% 100%` }}
                  />
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 w-full xl:w-auto">
                 {!sorting ? (
                    <button
                        onClick={startSorting}
                        disabled={array.length === 0}
                        className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] rounded-xl font-bold transition-all transform hover:scale-105 flex items-center justify-center gap-2 min-w-[120px]"
                    >
                        <Play size={18} fill="currentColor" /> Sort
                    </button>
                 ) : (
                    <div className="flex gap-2 flex-1 sm:flex-none w-full sm:w-auto">
                        <button
                            onClick={togglePause}
                            className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg min-w-[100px] ${
                                isPaused 
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30' 
                                : 'bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/30'
                            }`}
                        >
                            {isPaused ? <Play size={18} fill="currentColor"/> : <Pause size={18} fill="currentColor"/>}
                        </button>
                        <button
                            onClick={stopSorting}
                             className="flex-1 sm:flex-none px-4 py-3 bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-200 rounded-xl font-bold transition-all"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>
                 )}

                <button
                    onClick={() => generateRandomArray()}
                    disabled={sorting}
                    className="flex-1 sm:flex-none px-6 py-3 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw size={18} /> Reset
                </button>
                
                 <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-xl transition-all border border-white/10"
                >
                    <Settings size={20} />
                </button>
            </div>
        </div>

        {/* Extended Settings */}
        {showSettings && (
             <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md animate-fade-in-down">
                <label className="block text-purple-300 mb-2 text-sm font-semibold">
                Custom Input (comma-separated numbers 1-100)
                </label>
                <div className="flex gap-2">
                <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g., 45, 23, 67, 12, 89"
                    disabled={sorting}
                    className="flex-1 bg-black/30 text-white rounded-lg p-3 border border-white/10 focus:border-purple-400 focus:outline-none"
                />
                <button
                    onClick={handleCustomInput}
                    disabled={sorting}
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-all"
                >
                    Load
                </button>
                </div>
            </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm flex items-center justify-between group hover:bg-white/[0.06] transition-all">
                <div>
                     <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Comparisons</p>
                     <p className="text-xl md:text-2xl font-mono text-white group-hover:text-purple-300 transition-colors">{comparisons}</p>
                </div>
                <div className="p-2 md:p-3 rounded-full bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:scale-110 transition-all">
                    <Zap size={16} className="md:w-5 md:h-5" />
                </div>
            </div>
            
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm flex items-center justify-between group hover:bg-white/[0.06] transition-all">
                <div>
                     <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Swaps</p>
                     <p className="text-xl md:text-2xl font-mono text-white group-hover:text-pink-300 transition-colors">{swaps}</p>
                </div>
                <div className="p-2 md:p-3 rounded-full bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20 group-hover:scale-110 transition-all">
                    <RotateCcw size={16} className="rotate-90 md:w-5 md:h-5" />
                </div>
            </div>

            <div className="col-span-2 md:col-span-1 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm flex items-center justify-between group hover:bg-white/[0.06] transition-all">
                <div>
                     <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Elements</p>
                     <p className="text-xl md:text-2xl font-mono text-white group-hover:text-blue-300 transition-colors">{array.length}</p>
                </div>
                <div className="p-2 md:p-3 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all">
                    <BarChart3 size={16} className="md:w-5 md:h-5" />
                </div>
            </div>
        </div>

        {/* Main Visualization Area */}
        <div className="flex-1 relative rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl p-4 md:p-8 mb-6 overflow-hidden flex flex-col min-h-[300px]">
            
            {/* Action Overlay */}
            {flashMessage && (
                <div className="absolute top-20 right-8 z-40 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md px-6 py-4 rounded-2xl animate-in slide-in-from-right-10 fade-in duration-200 border border-yellow-500/20 shadow-2xl transform">
                        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] tracking-widest">
                            {flashMessage}
                        </h1>
                    </div>
                </div>
            )}
            
            {/* Step Status Text */}
            <div className="absolute top-4 md:top-6 left-4 md:left-8 right-4 md:right-8 z-10 flex flex-col md:flex-row justify-between items-start gap-2">
                 <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/5 shadow-lg w-full md:w-auto">
                    <span className="text-purple-300 font-mono text-sm mr-2">{'>'}</span>
                    <span className="text-gray-200 font-medium text-xs md:text-sm">{currentStep}</span>
                 </div>
                 
                 {isPaused && (
                     <div className="flex gap-2 animate-in fade-in zoom-in duration-300 self-end md:self-auto">
                        <button
                            onClick={nextStep}
                            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 transition-all text-xs md:text-sm font-semibold backdrop-blur-md"
                        >
                            <StepForward size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Step</span>
                        </button>
                        <button
                            onClick={nextPass}
                            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg border border-purple-500/30 transition-all text-xs md:text-sm font-semibold backdrop-blur-md"
                        >
                            <SkipForward size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Next Pass</span>
                        </button>
                     </div>
                 )}
            </div>
            
            {/* Grid Floor Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_100%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className="flex-1 relative mt-16 md:mt-12 mb-4 w-full h-full"> 
                {array.map((item, idx) => {
                const height = (item.value / maxHeight) * 100;
                const isHighlighted = highlightedIndices.includes(idx);
                const isSorted = sortedIndices.includes(idx);
                const width = 100 / array.length;
                
                // Dynamic styling based on state
                let barClass = 'bg-slate-400/50'; // Default
                let shadowClass = '';

                if (isSorted) {
                    barClass = 'bg-gradient-to-t from-emerald-600 to-emerald-400';
                    shadowClass = 'shadow-[0_0_15px_rgba(52,211,153,0.5)]';
                } else if (isHighlighted) {
                    barClass = 'bg-gradient-to-t from-amber-500 to-yellow-400';
                    shadowClass = 'shadow-[0_0_20px_rgba(251,191,36,0.8)] z-20 scale-110';
                } else {
                     barClass = 'bg-gradient-to-t from-purple-600/80 to-pink-500/80';
                }
                
                return (
                    <div
                    key={item.id}
                    className={`absolute bottom-0 rounded-t-lg transition-[left,height,background-color,transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${barClass} ${shadowClass}`}
                    style={{
                        height: `${height}%`,
                        width: `calc(${width}% - 4px)`, // Gap
                        left: `${idx * width}%`,
                    }}
                    >
                        {/* Tooltip value */}
                        <div className={`absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-black/80 px-1.5 py-0.5 rounded opacity-0 transition-opacity ${isHighlighted ? 'opacity-100' : ''}`}>
                            {item.value}
                        </div>
                    </div>
                );
                })}
            </div>
        </div>
        
         {/* Footer / Description */}
         <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-2">{algorithms[algorithm]}</h3>
             <p className="text-gray-400 text-sm leading-relaxed">
                {algorithm === 'bubble' && "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted."}
                {algorithm === 'selection' && "Divides the input list into two parts: a sorted sublist of items which is built up from left to right at the front (left) of the list and a sublist of the remaining unsorted items that occupy the rest of the list."}
                {algorithm === 'insertion' && "Builds the final sorted array (or list) one item at a time. It is much less efficient on large lists than more advanced algorithms such as quicksort, heapsort, or merge sort."}
                {algorithm === 'merge' && "An efficient, stable, comparison-based sorting algorithm. Most implementations produce a stable sort, which means that the order of equal elements is the same in the input and output."}
                {algorithm === 'quick' && "An efficient sorting algorithm. Developed by British computer scientist Tony Hoare in 1959. It is still a commonly used algorithm for sorting. When implemented well, it can be about two or three times faster than its main competitors, merge sort and heapsort."}
                {algorithm === 'heap' && "A comparison-based sorting technique based on Binary Heap data structure. It is similar to selection sort where we first find the minimum element and place the minimum element at the beginning."}
                {algorithm === 'shell' && "In-place comparison sort. It can be seen as either a generalization of sorting by exchange (bubble sort) or sorting by insertion (insertion sort)."}
                {algorithm === 'radix' && "A non-comparative sorting algorithm. It avoids comparison by creating and distributing elements into buckets according to their radix. For elements with more than one significant digit, this bucketing process is repeated for each digit, while preserving the ordering of the prior step, until all digits have been considered."}
             </p>
         </div>

      </div>
    </div>
  );
};

export default SortingVisualizer;
