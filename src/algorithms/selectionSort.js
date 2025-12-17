export const selectionSort = async (arr, { updateArray, setComparisons, setSwaps, setCurrentStep, setSortedIndices }) => {
    const n = arr.length;
    let comp = 0, swp = 0;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        setCurrentStep(`Finding minimum element from position ${i}`);
        for (let j = i + 1; j < n; j++) {
            comp++;
            setComparisons(comp);
            if (!await updateArray(arr, [i, j, minIdx], Array.from({ length: i }, (_, k) => k), i)) return;
            if (arr[j].value < arr[minIdx].value) minIdx = j;
        }
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            swp++;
            setSwaps(swp);
            if (!await updateArray(arr, [i, minIdx], Array.from({ length: i + 1 }, (_, k) => k), i)) return;
        }
    }
    setCurrentStep('Sorting complete!');
    setSortedIndices(Array.from({ length: n }, (_, i) => i));
};
