import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, Settings } from 'lucide-react';

const SortingVisualizer = () => {
  const [array, setArray] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [algorithm, setAlgorithm] = useState('bubble');
  const [speed, setSpeed] = useState(50);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [highlightedIndices, setHighlightedIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const stopRef = useRef(false);

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
    generateRandomArray();
  }, []);

  const generateRandomArray = (size = 30) => {
    const newArray = Array.from({ length: size }, () => 
      Math.floor(Math.random() * 100) + 5
    );
    setArray(newArray);
    setSortedIndices([]);
    setHighlightedIndices([]);
    setComparisons(0);
    setSwaps(0);
    setCurrentStep('Ready to sort');
  };

  const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const updateArray = async (newArray, highlighted = [], sorted = []) => {
    if (stopRef.current) return false;
    setArray([...newArray]);
    setHighlightedIndices(highlighted);
    setSortedIndices(sorted);
    // Increased delay multiplier to make "slow" speed actually slow
    await sleep((101 - speed) * 5);
    return true;
  };

  // Bubble Sort
  const bubbleSort = async (arr) => {
    const n = arr.length;
    let comp = 0, swp = 0;
    
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      setCurrentStep(`Pass ${i + 1}: Comparing adjacent elements`);
      
      for (let j = 0; j < n - i - 1; j++) {
        comp++;
        setComparisons(comp);
        
        if (!await updateArray(arr, [j, j + 1], Array.from({ length: i }, (_, k) => n - 1 - k))) return;
        
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swp++;
          setSwaps(swp);
          swapped = true;
          
          if (!await updateArray(arr, [j, j + 1], Array.from({ length: i }, (_, k) => n - 1 - k))) return;
        }
      }
      
      if (!swapped) break;
    }
    
    setCurrentStep('Sorting complete!');
    setSortedIndices(Array.from({ length: n }, (_, i) => i));
  };

  // Selection Sort
  const selectionSort = async (arr) => {
    const n = arr.length;
    let comp = 0, swp = 0;
    
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      setCurrentStep(`Finding minimum element from position ${i}`);
      
      for (let j = i + 1; j < n; j++) {
        comp++;
        setComparisons(comp);
        
        if (!await updateArray(arr, [i, j, minIdx], Array.from({ length: i }, (_, k) => k))) return;
        
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }
      
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        swp++;
        setSwaps(swp);
        
        if (!await updateArray(arr, [i, minIdx], Array.from({ length: i + 1 }, (_, k) => k))) return;
      }
    }
    
    setCurrentStep('Sorting complete!');
    setSortedIndices(Array.from({ length: n }, (_, i) => i));
  };

  // Insertion Sort
  const insertionSort = async (arr) => {
    const n = arr.length;
    let comp = 0, swp = 0;
    
    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;
      setCurrentStep(`Inserting element ${key} into sorted portion`);
      
      while (j >= 0) {
        comp++;
        setComparisons(comp);
        
        if (!await updateArray(arr, [j, j + 1], Array.from({ length: i }, (_, k) => k))) return;
        
        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          swp++;
          setSwaps(swp);
          j--;
        } else {
          break;
        }
      }
      
      arr[j + 1] = key;
      if (!await updateArray(arr, [j + 1], Array.from({ length: i + 1 }, (_, k) => k))) return;
    }
    
    setCurrentStep('Sorting complete!');
    setSortedIndices(Array.from({ length: n }, (_, i) => i));
  };

  // Merge Sort
  const mergeSort = async (arr, start = 0, end = arr.length - 1) => {
    if (start >= end) return;
    
    const mid = Math.floor((start + end) / 2);
    setCurrentStep(`Dividing array: [${start}...${mid}] and [${mid + 1}...${end}]`);
    
    await mergeSort(arr, start, mid);
    await mergeSort(arr, mid + 1, end);
    await merge(arr, start, mid, end);
  };

  const merge = async (arr, start, mid, end) => {
    const left = arr.slice(start, mid + 1);
    const right = arr.slice(mid + 1, end + 1);
    
    let i = 0, j = 0, k = start;
    setCurrentStep(`Merging subarrays from ${start} to ${end}`);
    
    while (i < left.length && j < right.length) {
      setComparisons(c => c + 1);
      
      if (!await updateArray(arr, [k, start + i, mid + 1 + j], [])) return;
      
      if (left[i] <= right[j]) {
        arr[k] = left[i];
        i++;
      } else {
        arr[k] = right[j];
        j++;
      }
      setSwaps(s => s + 1);
      k++;
    }
    
    while (i < left.length) {
      arr[k] = left[i];
      if (!await updateArray(arr, [k], [])) return;
      i++;
      k++;
    }
    
    while (j < right.length) {
      arr[k] = right[j];
      if (!await updateArray(arr, [k], [])) return;
      j++;
      k++;
    }
  };

  // Quick Sort
  const quickSort = async (arr, low = 0, high = arr.length - 1) => {
    if (low < high) {
      const pi = await partition(arr, low, high);
      if (pi === null) return;
      await quickSort(arr, low, pi - 1);
      await quickSort(arr, pi + 1, high);
    } else if (low === high) {
      setSortedIndices(prev => [...prev, low]);
    }
  };

  const partition = async (arr, low, high) => {
    const pivot = arr[high];
    let i = low - 1;
    setCurrentStep(`Partitioning around pivot ${pivot}`);
    
    for (let j = low; j < high; j++) {
      setComparisons(c => c + 1);
      
      if (!await updateArray(arr, [j, high, i + 1], [])) return null;
      
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setSwaps(s => s + 1);
        
        if (!await updateArray(arr, [i, j], [])) return null;
      }
    }
    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    setSwaps(s => s + 1);
    
    if (!await updateArray(arr, [i + 1, high], [])) return null;
    
    return i + 1;
  };

  // Heap Sort
  const heapSort = async (arr) => {
    const n = arr.length;
    
    setCurrentStep('Building max heap');
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      await heapify(arr, n, i);
    }
    
    for (let i = n - 1; i > 0; i--) {
      setCurrentStep(`Extracting maximum element to position ${i}`);
      [arr[0], arr[i]] = [arr[i], arr[0]];
      setSwaps(s => s + 1);
      
      if (!await updateArray(arr, [0, i], Array.from({ length: n - i }, (_, k) => n - 1 - k))) return;
      
      await heapify(arr, i, 0);
    }
    
    setCurrentStep('Sorting complete!');
    setSortedIndices(Array.from({ length: n }, (_, i) => i));
  };

  const heapify = async (arr, n, i) => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    if (left < n) {
      setComparisons(c => c + 1);
      if (arr[left] > arr[largest]) largest = left;
    }
    
    if (right < n) {
      setComparisons(c => c + 1);
      if (arr[right] > arr[largest]) largest = right;
    }
    
    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      setSwaps(s => s + 1);
      
      if (!await updateArray(arr, [i, largest], [])) return;
      
      await heapify(arr, n, largest);
    }
  };

  // Shell Sort
  const shellSort = async (arr) => {
    const n = arr.length;
    let gap = Math.floor(n / 2);
    
    while (gap > 0) {
      setCurrentStep(`Sorting with gap size ${gap}`);
      
      for (let i = gap; i < n; i++) {
        const temp = arr[i];
        let j = i;
        
        while (j >= gap) {
          setComparisons(c => c + 1);
          
          if (!await updateArray(arr, [j, j - gap], [])) return;
          
          if (arr[j - gap] > temp) {
            arr[j] = arr[j - gap];
            setSwaps(s => s + 1);
            j -= gap;
          } else {
            break;
          }
        }
        
        arr[j] = temp;
        if (!await updateArray(arr, [j], [])) return;
      }
      
      gap = Math.floor(gap / 2);
    }
    
    setCurrentStep('Sorting complete!');
    setSortedIndices(Array.from({ length: n }, (_, i) => i));
  };

  // Radix Sort
  const radixSort = async (arr) => {
    const max = Math.max(...arr);
    let exp = 1;
    
    while (Math.floor(max / exp) > 0) {
      setCurrentStep(`Sorting by digit at position ${exp}`);
      await countingSort(arr, exp);
      exp *= 10;
    }
    
    setCurrentStep('Sorting complete!');
    setSortedIndices(Array.from({ length: arr.length }, (_, i) => i));
  };

  const countingSort = async (arr, exp) => {
    const n = arr.length;
    const output = new Array(n);
    const count = new Array(10).fill(0);
    
    for (let i = 0; i < n; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;
      count[digit]++;
    }
    
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }
    
    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      output[count[digit] - 1] = arr[i];
      count[digit]--;
      setSwaps(s => s + 1);
    }
    
    for (let i = 0; i < n; i++) {
      arr[i] = output[i];
      if (!await updateArray(arr, [i], [])) return;
    }
  };

  const startSorting = async () => {
    stopRef.current = false;
    setSorting(true);
    setComparisons(0);
    setSwaps(0);
    setSortedIndices([]);
    
    const arrCopy = [...array];
    
    switch (algorithm) {
      case 'bubble':
        await bubbleSort(arrCopy);
        break;
      case 'selection':
        await selectionSort(arrCopy);
        break;
      case 'insertion':
        await insertionSort(arrCopy);
        break;
      case 'merge':
        await mergeSort(arrCopy);
        setSortedIndices(Array.from({ length: arrCopy.length }, (_, i) => i));
        setCurrentStep('Sorting complete!');
        break;
      case 'quick':
        await quickSort(arrCopy);
        setSortedIndices(Array.from({ length: arrCopy.length }, (_, i) => i));
        setCurrentStep('Sorting complete!');
        break;
      case 'heap':
        await heapSort(arrCopy);
        break;
      case 'shell':
        await shellSort(arrCopy);
        break;
      case 'radix':
        await radixSort(arrCopy);
        break;
    }
    
    setSorting(false);
    setHighlightedIndices([]);
  };

  const stopSorting = () => {
    stopRef.current = true;
    setSorting(false);
    setHighlightedIndices([]);
    setCurrentStep('Sorting stopped');
  };

  const handleCustomInput = () => {
    const numbers = customInput
      .split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n > 0 && n <= 100);
    
    if (numbers.length > 0) {
      setArray(numbers);
      setSortedIndices([]);
      setHighlightedIndices([]);
      setComparisons(0);
      setSwaps(0);
      setCurrentStep('Custom array loaded');
      setCustomInput('');
    }
  };

  const maxHeight = Math.max(...array);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2 animate-pulse">
            Sorting Visualizer
          </h1>
          <p className="text-gray-300 text-lg">Experience the beauty of algorithms in motion</p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-purple-500/20 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-purple-300 mb-2 text-sm font-semibold">Algorithm</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                disabled={sorting}
                className="w-full bg-gray-700/50 text-white rounded-lg p-3 border border-purple-500/30 focus:border-purple-400 focus:outline-none transition-all"
              >
                {Object.entries(algorithms).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-purple-300 mb-2 text-sm font-semibold">
                Speed: {speed}%
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={sorting ? stopSorting : startSorting}
                disabled={array.length === 0}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                  sorting
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg'
                }`}
              >
                {sorting ? (
                  <>
                    <Pause size={20} /> Stop
                  </>
                ) : (
                  <>
                    <Play size={20} /> Sort
                  </>
                )}
              </button>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={() => generateRandomArray(30)}
                disabled={sorting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                <RotateCcw size={20} /> Reset
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="mt-4 p-4 bg-gray-700/30 rounded-lg border border-purple-500/20">
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
                  className="flex-1 bg-gray-700/50 text-white rounded-lg p-3 border border-purple-500/30 focus:border-purple-400 focus:outline-none"
                />
                <button
                  onClick={handleCustomInput}
                  disabled={sorting}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all"
                >
                  Load
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <Zap className="text-yellow-400" size={24} />
              <div>
                <p className="text-gray-300 text-sm">Comparisons</p>
                <p className="text-3xl font-bold text-white">{comparisons}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-6 border border-pink-500/30">
            <div className="flex items-center gap-3">
              <Zap className="text-pink-400" size={24} />
              <div>
                <p className="text-gray-300 text-sm">Swaps</p>
                <p className="text-3xl font-bold text-white">{swaps}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center gap-3">
              <Zap className="text-blue-400" size={24} />
              <div>
                <p className="text-gray-300 text-sm">Array Size</p>
                <p className="text-3xl font-bold text-white">{array.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 mb-6 border border-purple-500/20">
          <p className="text-center text-purple-300 text-lg font-semibold">
            {currentStep}
          </p>
        </div>

        {/* Visualization */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20 shadow-2xl">
          <div className="flex items-end justify-center gap-1 h-96">
            {array.map((value, idx) => {
              const height = (value / maxHeight) * 100;
              const isHighlighted = highlightedIndices.includes(idx);
              const isSorted = sortedIndices.includes(idx);
              
              let barColor = 'from-purple-500 to-pink-500';
              if (isSorted) {
                barColor = 'from-green-400 to-emerald-500';
              } else if (isHighlighted) {
                barColor = 'from-yellow-400 to-orange-500';
              }
              
              return (
                <div
                  key={idx}
                  className="relative group flex-1 max-w-16"
                  style={{
                    height: `${height}%`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div
                    className={`w-full h-full bg-gradient-to-t ${barColor} rounded-t-lg shadow-lg transition-all duration-300 ${
                      isHighlighted ? 'scale-110 shadow-2xl' : ''
                    }`}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                      {value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Algorithm Info */}
        <div className="mt-6 bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-bold text-purple-300 mb-3">
            About {algorithms[algorithm]}
          </h3>
          <div className="text-gray-300 space-y-2">
            {algorithm === 'bubble' && (
              <>
                <p><strong>Time Complexity:</strong> O(n²) average and worst case</p>
                <p><strong>Space Complexity:</strong> O(1)</p>
                <p>Bubble sort repeatedly steps through the list, compares adjacent elements and swaps them if they're in the wrong order.</p>
              </>
            )}
            {algorithm === 'selection' && (
              <>
                <p><strong>Time Complexity:</strong> O(n²) in all cases</p>
                <p><strong>Space Complexity:</strong> O(1)</p>
                <p>Selection sort divides the list into sorted and unsorted regions, repeatedly selecting the smallest element from the unsorted region.</p>
              </>
            )}
            {algorithm === 'insertion' && (
              <>
                <p><strong>Time Complexity:</strong> O(n²) average and worst case, O(n) best case</p>
                <p><strong>Space Complexity:</strong> O(1)</p>
                <p>Insertion sort builds the final sorted array one item at a time by inserting each element into its correct position.</p>
              </>
            )}
            {algorithm === 'merge' && (
              <>
                <p><strong>Time Complexity:</strong> O(n log n) in all cases</p>
                <p><strong>Space Complexity:</strong> O(n)</p>
                <p>Merge sort divides the array into halves, recursively sorts them, and then merges the sorted halves.</p>
              </>
            )}
            {algorithm === 'quick' && (
              <>
                <p><strong>Time Complexity:</strong> O(n log n) average, O(n²) worst case</p>
                <p><strong>Space Complexity:</strong> O(log n)</p>
                <p>Quick sort picks a pivot element and partitions the array around it, then recursively sorts the partitions.</p>
              </>
            )}
            {algorithm === 'heap' && (
              <>
                <p><strong>Time Complexity:</strong> O(n log n) in all cases</p>
                <p><strong>Space Complexity:</strong> O(1)</p>
                <p>Heap sort builds a max heap from the array and repeatedly extracts the maximum element.</p>
              </>
            )}
            {algorithm === 'shell' && (
              <>
                <p><strong>Time Complexity:</strong> O(n log n) to O(n²) depending on gap sequence</p>
                <p><strong>Space Complexity:</strong> O(1)</p>
                <p>Shell sort is an optimization of insertion sort that allows elements to move long distances quickly.</p>
              </>
            )}
            {algorithm === 'radix' && (
              <>
                <p><strong>Time Complexity:</strong> O(d × n) where d is the number of digits</p>
                <p><strong>Space Complexity:</strong> O(n + k)</p>
                <p>Radix sort processes digits from least significant to most significant, using counting sort as a subroutine.</p>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(to right, #a855f7, #ec4899);
          cursor: pointer;
          border-radius: 50%;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: linear-gradient(to right, #a855f7, #ec4899);
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default SortingVisualizer;
