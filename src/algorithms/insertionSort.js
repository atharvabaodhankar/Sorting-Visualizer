export const insertionSort = async (arr, { updateArray, setComparisons, setSwaps, setCurrentStep, setSortedIndices }) => {
    const n = arr.length;
    let comp = 0, swp = 0;
    for (let i = 1; i < n; i++) {
        let j = i;
        setCurrentStep(`Inserting element ${arr[i].value} into sorted portion`);
        
        while (j > 0) {
            comp++;
            setComparisons(comp);
            // Highlight comparison
            if (!await updateArray(arr, [j, j - 1], Array.from({ length: i }, (_, k) => k), i)) return;

            if (arr[j].value < arr[j - 1].value) {
                // Swap instead of shift to avoid duplicate keys in React
                [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
                swp++;
                setSwaps(swp);
                // Highlight swap
                if (!await updateArray(arr, [j, j - 1], Array.from({ length: i }, (_, k) => k), i, 'swap')) return;
                j--;
            } else {
                break;
            }
        }
    }
    setCurrentStep('Sorting complete!');
    setSortedIndices(Array.from({ length: n }, (_, i) => i));
};
