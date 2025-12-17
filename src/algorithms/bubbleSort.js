export const bubbleSort = async (arr, { updateArray, setComparisons, setSwaps, setCurrentStep, setSortedIndices }) => {
    const n = arr.length;
    let comp = 0, swp = 0;
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      setCurrentStep(`Pass ${i + 1}: Comparing adjacent elements`);
      for (let j = 0; j < n - i - 1; j++) {
        comp++;
        setComparisons(comp);
        if (!await updateArray(arr, [j, j + 1], Array.from({ length: i }, (_, k) => n - 1 - k), i)) return;
        if (arr[j].value > arr[j + 1].value) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swp++;
          setSwaps(swp);
          swapped = true;
          if (!await updateArray(arr, [j, j + 1], Array.from({ length: i }, (_, k) => n - 1 - k), i, 'swap')) return;
        }
      }
      if (!swapped) break;
    }
    setCurrentStep('Sorting complete!');
    setSortedIndices(Array.from({ length: n }, (_, i) => i));
};
